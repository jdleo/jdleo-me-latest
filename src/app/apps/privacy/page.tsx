'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { strings } from '../../constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import {
    ShieldCheckIcon,
    GlobeAmericasIcon,
} from '@heroicons/react/24/outline';

type IPInfo = {
    ip: string;
    city: string;
    country: string;
    region: string;
    postal: string;
};

// FNV-1a, same family of hashing CreepJS uses for API fingerprints
const fnv1a = (str: string): string => {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16).padStart(8, '0');
};

const canvasFingerprint = (): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 60;
    const ctx = canvas.getContext('2d')!;
    ctx.textBaseline = 'top';
    ctx.font = '18px "Arial"';
    ctx.fillStyle = '#f60';
    ctx.fillRect(0, 0, 120, 30);
    ctx.fillStyle = '#069';
    ctx.fillText('jdleo.me \ud83d\udc41\ufe0f', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('privacy scan', 4, 32);
    const data = canvas.toDataURL();
    return fnv1a(data);
};

const audioFingerprint = async (): Promise<string> => {
    const OfflineCtx = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
    if (!OfflineCtx) return 'unsupported';
    const ctx = new OfflineCtx(1, 5000, 44100);
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 10000;
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -50;
    compressor.ratio.value = 12;
    osc.connect(compressor);
    compressor.connect(ctx.destination);
    osc.start(0);
    const buffer = await ctx.startRendering();
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) sum += Math.abs(buffer.getChannelData(0)[i]);
    return fnv1a(sum.toString());
};

const mathFingerprint = (): string => {
    const math = {
        acos: Math.acos(0.123),
        acosh: Math.acosh(1e308),
        tanh: Math.tanh(1),
        sin1e300: Math.sin(1e300),
        pow: Math.pow(Math.PI, -100),
        atanh: Math.atanh(0.5),
        expm1: Math.expm1(1),
        cbrt: Math.cbrt(100),
    };
    let out = '';
    for (const v of Object.values(math)) out += v.toString().slice(0, 20);
    return fnv1a(out);
};

const gpuInfo = (): { vendor: string; renderer: string } => {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
        if (!gl) return { vendor: 'unsupported', renderer: '' };
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        if (!ext) return { vendor: 'masked', renderer: '' };
        return {
            vendor: (gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) as string) || 'unknown',
            renderer: (gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string) || 'unknown',
        };
    } catch {
        return { vendor: 'blocked', renderer: '' };
    }
};

const detectFonts = (): string[] => {
    const fonts = [
        'Arial', 'Calibri', 'Cambria', 'Comic Sans MS', 'Consolas', 'Courier New',
        'Georgia', 'Helvetica', 'Impact', 'Menlo', 'Monaco', 'Roboto', 'Segoe UI',
        'SF Pro Text', 'Times New Roman', 'Trebuchet MS', 'Ubuntu', 'Verdana',
    ];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const testString = 'mmmmmmmmmmlli Ww@#08';
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const baseSizes: Record<string, number[]> = {};
    for (const base of baseFonts) {
        ctx.font = `72px ${base}`;
        baseSizes[base] = [ctx.measureText(testString).width];
    }
    const detected: string[] = [];
    for (const font of fonts) {
        let found = false;
        for (const base of baseFonts) {
            ctx.font = `72px "${font}", ${base}`;
            if (ctx.measureText(testString).width !== baseSizes[base][0]) found = true;
        }
        if (found) detected.push(font);
    }
    return detected;
};

const webrtcLeak = async (): Promise<string> => {
    return new Promise((resolve) => {
        const ips = new Set<string>();
        let pc: RTCPeerConnection;
        try {
            pc = new RTCPeerConnection({ iceServers: [] });
        } catch {
            resolve('blocked');
            return;
        }
        pc.createDataChannel('x');
        pc.onicecandidate = (e) => {
            if (!e.candidate) {
                pc.close();
                resolve(ips.size ? [...ips].slice(0, 3).join(', ') : 'no leak');
                return;
            }
            const match = e.candidate.candidate.match(
                /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{4}(:[a-f0-9]{0,4}){2,7})/i
            );
            if (match) ips.add(match[1]);
        };
        pc.createOffer()
            .then(offer => pc.setLocalDescription(offer))
            .catch(() => resolve('blocked'));
        setTimeout(() => {
            pc.close();
            resolve(ips.size ? [...ips].slice(0, 3).join(', ') : 'no leak');
        }, 1500);
    });
};

export default function Privacy() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [fingerprint, setFingerprint] = useState<string | null>(null);
    const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);
    const [deepSignals, setDeepSignals] = useState<{ label: string; value: string }[]>([]);
    const [browserInfo, setBrowserInfo] = useState({
        screen: { width: 0, height: 0, colorDepth: 0 },
        platform: '',
        userAgent: '',
        language: '',
        timezone: '',
        memory: 'Not Available',
        cores: 0,
    });

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);

        FingerprintJS.load()
            .then(fp => fp.get())
            .then(result => setFingerprint(result.visitorId));

        fetch('/api/ip')
            .then(res => res.json())
            .then(setIpInfo);

        setBrowserInfo({
            screen: {
                width: window.screen.width,
                height: window.screen.height,
                colorDepth: window.screen.colorDepth,
            },
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            memory: 'deviceMemory' in navigator ? `${(navigator as any).deviceMemory}GB` : 'Not Available',
            cores: navigator.hardwareConcurrency || 0,
        });

        // deep signals, gathered async
        const gather = async () => {
            const gpu = gpuInfo();
            const signals: { label: string; value: string }[] = [
                { label: 'Canvas FP', value: canvasFingerprint() },
                { label: 'GPU', value: gpu.renderer || gpu.vendor || 'unknown' },
            ];

            const results = await Promise.allSettled([
                audioFingerprint(),
                Promise.resolve(mathFingerprint()),
                Promise.resolve(detectFonts()),
                webrtcLeak(),
                (navigator as any).getBattery?.() ?? Promise.resolve(null),
                Promise.resolve((navigator as any).connection?.effectiveType || null),
            ]);

            signals.push({
                label: 'Audio FP',
                value: results[0].status === 'fulfilled' ? results[0].value : 'unsupported',
            });
            signals.push({
                label: 'Math FP',
                value: results[1].status === 'fulfilled' ? results[1].value : 'unsupported',
            });
            signals.push({
                label: 'Fonts',
                value:
                    results[2].status === 'fulfilled'
                        ? `${results[2].value.length} detected${results[2].value.length ? `: ${results[2].value.slice(0, 3).join(', ')}` : ''}`
                        : 'unsupported',
            });
            signals.push({
                label: 'WebRTC IPs',
                value: results[3].status === 'fulfilled' ? results[3].value : 'unsupported',
            });

            const battery = results[4].status === 'fulfilled' ? results[4].value : null;
            signals.push({
                label: 'Battery',
                value: battery ? `${Math.round(battery.level * 100)}%${battery.charging ? ' (charging)' : ''}` : 'hidden',
            });

            signals.push({
                label: 'Connection',
                value: results[5].status === 'fulfilled' && results[5].value
                    ? `${results[5].value}${(navigator as any).connection?.downlink ? ` · ${((navigator as any).connection.downlink)}Mb` : ''}`
                    : 'hidden',
            });

            const gpc = (navigator as any).globalPrivacyControl;
            signals.push({
                label: 'Do Not Track',
                value: navigator.doNotTrack === '1' || gpc ? 'enabled' : 'not set',
            });

            const perms = ['geolocation', 'notifications', 'camera', 'microphone'];
            const permStates = await Promise.allSettled(
                perms.map(name => navigator.permissions.query({ name: name as PermissionName }))
            );
            const granted = permStates
                .map(r => (r.status === 'fulfilled' ? r.value.state : 'unknown'))
                .reduce((acc, s) => acc + (s === 'granted' ? 1 : 0), 0);
            signals.push({ label: 'Permissions', value: `${granted}/${perms.length} granted` });

            // speech voices
            signals.push({
                label: 'Speech Voices',
                value: `${window.speechSynthesis?.getVoices().length ?? 0} installed`,
            });

            // adblock: bait element hidden by cosmetic filters
            const bait = document.createElement('div');
            bait.className = 'adsbox ad-banner pub_300x250';
            bait.style.position = 'absolute';
            bait.style.top = '-999px';
            bait.style.height = '8px';
            bait.style.width = '8px';
            document.body.appendChild(bait);
            setTimeout(() => {
                const blocked = bait.offsetHeight === 0 || getComputedStyle(bait).display === 'none';
                bait.remove();
                signals.push({ label: 'Adblock', value: blocked ? 'likely on' : 'not detected' });
                setDeepSignals([...signals]);
            }, 150);
        };

        gather();

        setBrowserInfo((prev) => prev);

        return () => clearTimeout(timer);
    }, []);

    const metaItems = [
        { label: 'Platform', value: browserInfo.platform, icon: '💻' },
        { label: 'Language', value: browserInfo.language, icon: '🗣️' },
        { label: 'Timezone', value: browserInfo.timezone, icon: '🕒' },
        { label: 'Screen', value: `${browserInfo.screen.width}x${browserInfo.screen.height}`, icon: '🖥️' },
        { label: 'Cores', value: `${browserInfo.cores}`, icon: '⚡' },
        { label: 'Memory', value: browserInfo.memory, icon: '💾' },
    ];

    return (
        <>
            <WebVitals />
            <main className='el-page'>
                <header className='el-nav'>
                    <Link href='/' className='el-logo' aria-label='John Leonardo home'>
                        John Leonardo
                    </Link>
                    <nav className='el-nav-links' aria-label='Primary navigation'>
                        <Link href='/apps' className='el-nav-link'>Apps</Link>
                        <Link href='/blog' className='el-nav-link'>Blog</Link>
                        <Link href='/apps/resume' className='el-nav-link'>Resume</Link>
                    </nav>
                    <div className='el-nav-actions'>
                        <Link href='/apps/chat' className='el-nav-link'>Chat</Link>
                        <Link href={`mailto:${strings.EMAIL}`} className='el-btn el-btn-dark el-btn-sm'>
                            Contact
                        </Link>
                    </div>
                </header>

                <section className='el-hero el-hero-page'>
                    <div className='el-hero-inner'>
                        <div className='el-hero-copy'>
                            <h1>Privacy Scan</h1>
                            <p className='el-hero-sub'>
                                See what websites can learn about you just by visiting.
                            </p>
                        </div>
                    </div>
                </section>

                <section className='el-section el-sentiment'>
                    <div className='el-privacy-grid'>
                        <div className='el-info-card'>
                            <div className='el-info-card-head'>
                                <span className='el-info-card-title'>
                                    <GlobeAmericasIcon aria-hidden='true' />
                                    Network Identity
                                </span>
                                <span className='el-tag el-tag-red'>Exposed</span>
                            </div>
                            <div className='el-kv'>
                                <span className='el-kv-label'>IP Address</span>
                                <div className='el-kv-value el-kv-mono'>
                                    {ipInfo?.ip || 'Scanning...'}
                                </div>
                            </div>
                            <div className='el-kv'>
                                <span className='el-kv-label'>Location</span>
                                <div className='el-kv-value'>
                                    {ipInfo ? `${ipInfo.city}, ${ipInfo.region}, ${ipInfo.country}` : 'Locating...'}
                                </div>
                            </div>
                        </div>

                        <div className='el-info-card'>
                            <div className='el-info-card-head'>
                                <span className='el-info-card-title'>
                                    <ShieldCheckIcon aria-hidden='true' />
                                    Digital Fingerprint
                                </span>
                                <span className='el-tag el-tag-purple'>Unique ID</span>
                            </div>
                            <div className='el-kv'>
                                <span className='el-kv-label'>Canvas Hash</span>
                                <div className='el-kv-value el-kv-mono el-kv-break'>
                                    {fingerprint || 'Generating...'}
                                </div>
                            </div>
                            <p className='el-kv-note'>
                                Your browser&apos;s unique rendering behavior creates a permanent ID used
                                to track you across the web, even in Incognito mode.
                            </p>
                        </div>
                    </div>

                    <div className='el-chart-block'>
                        <div className='el-chart-title'>
                            <span className='el-chart-title-label'>Deep Signals</span>
                            <span className='el-chart-pill'>creepjs-style</span>
                        </div>
                        <div className='el-stat-grid el-stat-grid-tight'>
                            {deepSignals.map((sig) => (
                                <div key={sig.label} className='el-stat-card el-stat-mini'>
                                    <div className='el-stat-label'>{sig.label}</div>
                                    <div className='el-stat-mini-value el-kv-mono-sm' title={sig.value}>
                                        {sig.value}
                                    </div>
                                </div>
                            ))}
                            {deepSignals.length === 0 && (
                                <div className='el-stat-card el-stat-mini'>
                                    <div className='el-stat-label'>Gathering</div>
                                    <div className='el-stat-mini-value'>probing browser APIs...</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className='el-chart-block'>
                        <div className='el-chart-title'>
                            <span className='el-chart-title-label'>Device Leaks</span>
                            <span className='el-chart-pill'>{metaItems.length} signals</span>
                        </div>
                        <div className='el-stat-grid el-stat-grid-tight'>
                            {metaItems.map((item) => (
                                <div key={item.label} className='el-stat-card el-stat-mini'>
                                    <div className='el-stat-emoji'>{item.icon}</div>
                                    <div className='el-stat-label'>{item.label}</div>
                                    <div className='el-stat-mini-value'>{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='el-chart-block'>
                        <div className='el-chart-title'>
                            <span className='el-chart-title-label'>User Agent String</span>
                        </div>
                        <div className='el-copy-box el-ua-box'>{browserInfo.userAgent}</div>
                    </div>
                </section>

                <footer className='el-footer'>
                    <div className='el-footer-inner'>
                        <span className='el-footer-logo'>John Leonardo</span>
                        <div className='el-footer-links'>
                            <a href={strings.GITHUB_URL} target='_blank' rel='noreferrer'>GitHub</a>
                            <a href={strings.LINKEDIN_URL} target='_blank' rel='noreferrer'>LinkedIn</a>
                            <a href={`mailto:${strings.EMAIL}`}>{strings.EMAIL}</a>
                        </div>
                        <span className='el-footer-copy'>© 2026. All rights reserved.</span>
                    </div>
                </footer>
            </main>
        </>
    );
}
