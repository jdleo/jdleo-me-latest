'use client';

import { useEffect, useRef, useState } from 'react';

// Raw WebGL2 fullscreen-quad shader — no framework, no library.
// The liquid-ghost: an fbm-smoke aura around a charcoal sphere. The cursor
// is a small object the aura cannot occupy — a thin exclusion zone at the
// pointer, plus a thin line-shaped gap along the path you slash, closing
// behind you. The aura is procedural; nothing is ever "created".

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAspect;
uniform vec2  uMouse;   // cursor in shader space (aspect-corrected, y up)
uniform float uActive;  // eased 0..1 presence of the cursor over the canvas
uniform int   uCount;
uniform vec4  uSegs[24]; // even: ax,ay,bx,by — odd: strength, age, 0, 0

in vec2 vUv;
out vec4 fragColor;

float hash21(vec2 p) {
  vec2 q = fract(p * vec2(234.34, 435.345));
  q += dot(q, q + 34.23);
  return fract(q.x * q.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  vec2 q = p;
  for (int i = 0; i < 5; i++) {
    v += amp * noise(q);
    q = q * 2.03 + vec2(11.7, 5.3);
    amp *= 0.5;
  }
  return v;
}

float swell(vec2 p, float t) {
  float w = fbm(p * 1.7 + vec2(t * 0.07, -t * 0.05));
  float w2 = fbm(p * 3.4 - vec2(t * 0.04, t * 0.06) + w * 1.5);
  return (w - 0.5) * 0.17 + (w2 - 0.5) * 0.08;
}

void main() {
  float t = uTime;
  vec2 uv = vUv;
  vec2 p = (uv - 0.5) * vec2(uAspect, 1.0) * 2.0;

  // gentle idle drift
  vec2 c = vec2(sin(t * 0.19) * 0.08, cos(t * 0.16) * 0.05);

  // 1) live exclusion zone at the pointer — thin, radial, fills back behind
  vec2 toFrag = p - uMouse;
  float dFrag = length(toFrag);
  vec2 dirFrag = normalize(toFrag + vec2(0.0001, 0.0));
  float fall = exp(-dFrag * dFrag * 60.0);
  vec2 disp = dirFrag * fall * uActive * 0.18;

  // 2) the slash: a thin line-shaped gap along the swept path, parting
  //    perpendicular to the stroke, closing segment by segment (~0.7s)
  float cutAcc = 0.0;
  for (int i = 0; i < 12; i++) {
    if (i >= uCount) break;
    vec4 s0 = uSegs[i * 2];
    vec4 s1 = uSegs[i * 2 + 1];
    vec2 ab = s0.zw - s0.xy;
    float tt = clamp(dot(p - s0.xy, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);
    vec2 closest = s0.xy + ab * tt;
    vec2 away = p - closest;
    float d = length(away);
    float env = s1.x * min(1.0, s1.y * 20.0) * (1.0 - s1.y);
    disp += (away / max(d, 1e-4)) * env * exp(-d * d * 500.0) * 0.3;
    cutAcc = max(cutAcc, env * exp(-d * d * 1500.0));
  }

  vec2 q = p - c - disp;

  float R = 0.56 + swell(q, t) * 2.2;
  float r = length(q);
  float body = 1.0 - smoothstep(-0.008, 0.035, r - R) * (1.0 - smoothstep(0.3, 0.8, cutAcc) * 0.55);

  // true sphere normal (front hemisphere), perturbed by the liquid surface
  float zn = sqrt(max(0.0, 1.0 - min(1.0, (r * r) / (R * R))));
  vec3 n = normalize(vec3(q / max(R, 0.001), max(zn, 0.001)));
  float e = 0.06;
  float sx = swell(q + vec2(e, 0.0), t) - swell(q - vec2(e, 0.0), t);
  float sy = swell(q + vec2(0.0, e), t) - swell(q - vec2(0.0, e), t);
  n = normalize(n + vec3(-sx, -sy, 0.0) * 9.0);

  // key light upper-left, cool fill lower-right, camera in +z
  vec3 L = normalize(vec3(-0.45, 0.62, 0.64));
  vec3 L2 = normalize(vec3(0.58, -0.28, 0.5));
  vec3 V = vec3(0.0, 0.0, 1.0);
  float diff = clamp(dot(n, L), 0.0, 1.0);
  float diff2 = clamp(dot(n, L2), 0.0, 1.0);
  float spec = pow(clamp(dot(n, normalize(L + V)), 0.0, 1.0), 56.0);
  float spec2 = pow(clamp(dot(n, normalize(L2 + V)), 0.0, 1.0), 32.0);
  float rim = pow(1.0 - clamp(n.z, 0.0, 1.0), 1.7);

  // deep charcoal core -> lit band -> dark limb: reads as a solid sphere
  vec3 col = vec3(0.014, 0.014, 0.017);
  col += vec3(0.21, 0.22, 0.25) * pow(diff, 1.4);
  col += vec3(0.075, 0.08, 0.10) * diff2;
  col += vec3(0.92, 0.94, 1.0) * spec * 0.6;
  col += vec3(0.55, 0.58, 0.7) * spec2 * 0.18;
  col += vec3(0.36, 0.38, 0.48) * rim * 0.6;

  // ghostly wisps drifting across the face of the body
  float wisp = smoothstep(0.46, 0.78, fbm(q * 2.1 + vec2(t * 0.05, -t * 0.09) + swell(q, t)));
  col += vec3(0.11, 0.12, 0.15) * wisp * (0.35 + 0.65 * diff);

  // the aura: procedural fbm smoke hugging the body — the slash parts it
  vec2 sq = q + vec2(0.0, -t * 0.13);
  float sn1 = fbm(sq * 1.55 + vec2(t * 0.03, 0.0));
  float sn2 = fbm(sq * 3.3 - vec2(t * 0.07, t * 0.02));
  float dens = smoothstep(0.40, 0.82, sn1 * 0.62 + sn2 * 0.38);
  float dist2 = max(r - R * 0.88, 0.0);
  float smoke = dens * exp(-dist2 * 6.0) * 0.65 * (1.0 - smoothstep(0.1, 0.5, cutAcc) * 0.9);
  // hard guarantee: nothing reaches the canvas edges
  float edge = (1.0 - smoothstep(0.78, 0.95, abs(p.y)))
    * (1.0 - smoothstep(uAspect * 0.78, uAspect * 0.95, abs(p.x)));
  smoke *= edge;
  // smoke thins where it overlaps the lit face so the sphere still reads
  float smokeOverBody = smoke * mix(1.0, 0.25, body * (0.3 + diff));

  vec3 outCol = col * body;
  outCol += vec3(0.34, 0.36, 0.44) * smokeOverBody;
  outCol += vec3(0.5, 0.53, 0.62) * smoke * (1.0 - body) * 0.55;

  float alpha = clamp(body + smoke * (1.0 - body) * 0.85, 0.0, 1.0);
  fragColor = vec4(outCol * alpha, alpha);
}`;

const MAX_SEGS = 12;
const LIFE = 0.7;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) || 'shader compile failed');
    }
    return shader;
}

export default function LiquidGhost() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext('webgl2', {
            alpha: true,
            premultipliedAlpha: true,
            antialias: true,
            preserveDrawingBuffer: true,
        });
        if (!gl) {
            setFailed(true);
            return;
        }

        let program: WebGLProgram;
        try {
            program = gl.createProgram()!;
            gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
            gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                throw new Error(gl.getProgramInfoLog(program) || 'program link failed');
            }
        } catch (error) {
            console.error('LiquidGhost shader error:', error);
            setFailed(true);
            return;
        }

        const vao = gl.createVertexArray()!;
        gl.bindVertexArray(vao);
        const buf = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(program, 'aPos');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        gl.useProgram(program);
        gl.bindVertexArray(vao);

        const uTime = gl.getUniformLocation(program, 'uTime');
        const uAspect = gl.getUniformLocation(program, 'uAspect');
        const uMouse = gl.getUniformLocation(program, 'uMouse');
        const uActive = gl.getUniformLocation(program, 'uActive');
        const uCount = gl.getUniformLocation(program, 'uCount');
        const uSegs = gl.getUniformLocation(program, 'uSegs');

        const segs: { ax: number; ay: number; bx: number; by: number; birth: number; str: number }[] = [];
        const segData = new Float32Array(MAX_SEGS * 8);
        const pointer = { fx: 0.5, fy: 0.5, pfx: 0.5, pfy: 0.5, has: false };

        const onMove = (e: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            pointer.fx = (e.clientX - rect.left) / rect.width;
            pointer.fy = (e.clientY - rect.top) / rect.height;
            if (!pointer.has) {
                pointer.pfx = pointer.fx;
                pointer.pfy = pointer.fy;
                pointer.has = true;
            }
        };
        window.addEventListener('pointermove', onMove);

        let raf = 0;
        const start = performance.now();

        const render = (nowMs: number) => {
            raf = requestAnimationFrame(render);
            const t = (nowMs - start) / 1000;

            // resize canvas to layout, dpr capped at 2
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            const cw = Math.max(1, Math.floor(canvas.clientWidth * dpr));
            const ch = Math.max(1, Math.floor(canvas.clientHeight * dpr));
            if (canvas.width !== cw || canvas.height !== ch) {
                canvas.width = cw;
                canvas.height = ch;
                gl.viewport(0, 0, cw, ch);
            }
            const aspect = cw / ch;

            // age out dead slash segments
            while (segs.length > 0 && t - segs[0].birth > LIFE) segs.shift();

            // record the swept segment if the pointer moved inside the canvas
            const ax = pointer.pfx * 2 - 1;
            const ay = 1 - pointer.pfy * 2;
            const bx = pointer.fx * 2 - 1;
            const by = 1 - pointer.fy * 2;
            const d = Math.hypot(bx - ax, by - ay) * aspect;
            const inside = pointer.has && pointer.fx >= 0 && pointer.fx <= 1 && pointer.fy >= 0 && pointer.fy <= 1;
            if (inside && d > 0.001) {
                segs.push({
                    ax: ax * aspect,
                    ay,
                    bx: bx * aspect,
                    by,
                    birth: t,
                    str: Math.min(1, Math.max(0.6, d / 0.03)),
                });
                if (segs.length > MAX_SEGS) segs.shift();
            }
            pointer.pfx = pointer.fx;
            pointer.pfy = pointer.fy;

            for (let i = 0; i < MAX_SEGS; i++) {
                const s = segs[i];
                if (!s) break;
                const o = i * 8;
                segData[o] = s.ax;
                segData[o + 1] = s.ay;
                segData[o + 2] = s.bx;
                segData[o + 3] = s.by;
                segData[o + 4] = s.str;
                segData[o + 5] = Math.min(1, (t - s.birth) / LIFE);
            }

            gl.uniform1f(uTime, t);
            gl.uniform1f(uAspect, aspect);
            gl.uniform2f(uMouse, pointer.fx * 2 - 1, 1 - pointer.fy * 2);
            gl.uniform1f(uActive, pointer.has && inside ? 1 : 0);
            gl.uniform1i(uCount, segs.length);
            gl.uniform4fv(uSegs, segData);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            canvas.dataset.live = '1';
        };
        raf = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('pointermove', onMove);
            gl.deleteProgram(program);
            gl.deleteBuffer(buf);
            gl.deleteVertexArray(vao);
        };
    }, []);

    return (
        <div className='el-ghost' aria-hidden='true'>
            <canvas ref={canvasRef} className='el-ghost-canvas' />
            {failed && <div className='el-ghost-fallback' />}
        </div>
    );
}
