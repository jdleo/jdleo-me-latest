'use client';

import { useEffect, useRef, useState } from 'react';

const WGSL = /* wgsl */ `
struct Params {
  time: f32,
  aspect: f32,
  mouseX: f32,
  mouseY: f32,
  mStrength: f32,
  _pad0: f32,
  _pad1: f32,
  _pad2: f32,
}

@group(0) @binding(0) var<uniform> params: Params;

fn hash21(p: vec2f) -> f32 {
  var q = fract(p * vec2f(234.34, 435.345));
  q += dot(q, q + 34.23);
  return fract(q.x * q.y);
}

fn noise(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2f(1.0, 0.0)), u.x),
    mix(hash21(i + vec2f(0.0, 1.0)), hash21(i + vec2f(1.0, 1.0)), u.x),
    u.y
  );
}

fn fbm(p: vec2f) -> f32 {
  var v = 0.0;
  var amp = 0.5;
  var q = p;
  for (var i = 0; i < 5; i++) {
    v += amp * noise(q);
    q = q * 2.03 + vec2f(11.7, 5.3);
    amp *= 0.5;
  }
  return v;
}

// signed surface: a sphere whose radius swells with fbm
fn swell(p: vec2f, t: f32) -> f32 {
  let w = fbm(p * 1.7 + vec2f(t * 0.07, -t * 0.05));
  let w2 = fbm(p * 3.4 - vec2f(t * 0.04, t * 0.06) + w * 1.5);
  return (w - 0.5) * 0.17 + (w2 - 0.5) * 0.08;
}

fn fbmSum(p: vec2f, t: f32) -> f32 {
  return swell(p, t);
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let t = params.time;
  var p = (uv - 0.5) * vec2f(params.aspect, 1.0) * 2.0;

  // gentle idle drift
  let c = vec2f(sin(t * 0.19) * 0.08, cos(t * 0.16) * 0.05);
  let q = p - c;

  let R = 0.56 + swell(q, t) * 2.2;
  let r = length(q);
  let body = 1.0 - smoothstep(-0.008, 0.035, r - R);

  // true sphere normal (front hemisphere), perturbed by the liquid surface
  let zn = sqrt(max(0.0, 1.0 - min(1.0, (r * r) / (R * R))));
  var n = normalize(vec3f(q / max(R, 0.001), max(zn, 0.001)));
  let e = 0.06;
  let sx = fbmSum(q + vec2f(e, 0.0), t) - fbmSum(q - vec2f(e, 0.0), t);
  let sy = fbmSum(q + vec2f(0.0, e), t) - fbmSum(q - vec2f(0.0, e), t);
  n = normalize(n + vec3f(-sx, -sy, 0.0) * 9.0);

  // key light upper-left, cool fill lower-right, camera in +z
  let L = normalize(vec3f(-0.45, 0.62, 0.64));
  let L2 = normalize(vec3f(0.58, -0.28, 0.5));
  let V = vec3f(0.0, 0.0, 1.0);
  let diff = clamp(dot(n, L), 0.0, 1.0);
  let diff2 = clamp(dot(n, L2), 0.0, 1.0);
  let spec = pow(clamp(dot(n, normalize(L + V)), 0.0, 1.0), 56.0);
  let spec2 = pow(clamp(dot(n, normalize(L2 + V)), 0.0, 1.0), 32.0);
  let rim = pow(1.0 - clamp(n.z, 0.0, 1.0), 1.7);

  // deep charcoal core -> lit band -> dark limb: reads as a solid sphere
  var col = vec3f(0.014, 0.014, 0.017);
  col += vec3f(0.21, 0.22, 0.25) * pow(diff, 1.4);
  col += vec3f(0.075, 0.08, 0.10) * diff2;
  col += vec3f(0.92, 0.94, 1.0) * spec * 0.6;
  col += vec3f(0.55, 0.58, 0.7) * spec2 * 0.18;
  col += vec3f(0.36, 0.38, 0.48) * rim * 0.6;

  // ghostly wisps drifting across the face of the body
  let wisp = smoothstep(0.46, 0.78, fbm(q * 2.1 + vec2f(t * 0.05, -t * 0.09) + swell(q, t)));
  col += vec3f(0.11, 0.12, 0.15) * wisp * (0.35 + 0.65 * diff);

  // smoke field hugging the body, slowly rising — tight falloff, no box edges
  // the cursor cuts a channel through it: full clear at the pointer,
  // radius grows with stir strength, heals as strength decays
  let mp = vec2f(params.mouseX, params.mouseY);
  let dm = q - mp;
  let md = length(dm);
  let mrad = 0.16 + 0.44 * params.mStrength;
  let cut = params.mStrength * (1.0 - smoothstep(0.0, mrad, md));
  let push = normalize(dm + vec2f(0.0001, 0.0)) * exp(-md * 4.0) * params.mStrength * 0.3;

  let sq = q + vec2f(0.0, -t * 0.13) + push;
  let s1 = fbm(sq * 1.55 + vec2f(t * 0.03, 0.0));
  let s2 = fbm(sq * 3.3 - vec2f(t * 0.07, t * 0.02));
  let dens = smoothstep(0.40, 0.82, s1 * 0.62 + s2 * 0.38);
  let dist = max(r - R * 0.88, 0.0);
  var smoke = dens * exp(-dist * 6.0) * 0.65 * (1.0 - cut);
  // hard guarantee: nothing reaches the canvas edges
  let edge = (1.0 - smoothstep(0.78, 0.95, abs(p.y)))
    * (1.0 - smoothstep(params.aspect * 0.78, params.aspect * 0.95, abs(p.x)));
  smoke *= edge;
  // smoke thins where it overlaps the lit face so the sphere still reads
  let smokeOverBody = smoke * mix(1.0, 0.25, body * (0.3 + diff));

  var outCol = col * body;
  outCol += vec3f(0.34, 0.36, 0.44) * smokeOverBody;
  outCol += vec3f(0.5, 0.53, 0.62) * smoke * (1.0 - body) * 0.55;

  let alpha = clamp(body + smoke * (1.0 - body) * 0.85, 0.0, 1.0);
  return vec4f(outCol * alpha, alpha);
}
`;

export default function LiquidGhost() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let disposed = false;
        let stop: (() => void) | undefined;

        const start = async () => {
            if (!('gpu' in navigator) || !canvasRef.current) {
                setFailed(true);
                return;
            }
            try {
                const vgpu = await import('vgpu');
                const gpu = await vgpu.init();
                if (disposed) {
                    gpu.dispose();
                    return;
                }

                const canvas = canvasRef.current!;
                const target = vgpu.surface(gpu, canvas, {
                    dpr: [1, 2],
                    alphaMode: 'premultiplied',
                    clearColor: [0, 0, 0, 0],
                });
                const blob = vgpu.effect(gpu, WGSL, {
                    label: 'liquid-ghost',
                    set: { params: { time: 0, aspect: 1, mouseX: 0, mouseY: 0, mStrength: 0 } },
                });

                const clock = vgpu.clock(gpu);
                const mouse = { x: 0, y: 0, tx: 0, ty: 0, s: 0 };
                const onMove = (e: PointerEvent) => {
                    const rect = canvas.getBoundingClientRect();
                    mouse.tx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                    mouse.ty = 1 - ((e.clientY - rect.top) / rect.height) * 2;
                };
                window.addEventListener('pointermove', onMove);

                const loop = vgpu.frameLoop(gpu, (frame) => {
                    const dx = mouse.tx - mouse.x;
                    const dy = mouse.ty - mouse.y;
                    mouse.x += dx * 0.09;
                    mouse.y += dy * 0.09;

                    // stir strength builds hard with pointer speed, decays at rest
                    const speed = Math.hypot(dx, dy);
                    mouse.s = Math.min(1, mouse.s + speed * 3.0) * 0.96;
                    const inside = Math.abs(mouse.tx) <= 1 && Math.abs(mouse.ty) <= 1;
                    if (!inside) mouse.s *= 0.85;

                    const [w, h] = target.size;
                    const aspect = w / Math.max(1, h);
                    blob.set({
                        params: {
                            time: clock.time,
                            aspect,
                            mouseX: mouse.x * aspect,
                            mouseY: mouse.y,
                            mStrength: mouse.s,
                        },
                    });
                    frame.pass(target, blob);
                });

                stop = () => {
                    loop.stop();
                    window.removeEventListener('pointermove', onMove);
                    gpu.dispose();
                };
            } catch (error) {
                console.error('LiquidGhost failed:', error);
                if (!disposed) setFailed(true);
            }
        };

        start();

        return () => {
            disposed = true;
            stop?.();
        };
    }, []);

    return (
        <div className='el-ghost' aria-hidden='true'>
            <canvas ref={canvasRef} className='el-ghost-canvas' />
            {failed && <div className='el-ghost-fallback' />}
        </div>
    );
}
