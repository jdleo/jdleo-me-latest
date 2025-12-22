'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { WebVitals } from '@/components/SEO/WebVitals';

type IPInfo = {
    ip: string;
    city: string;
    country: string;
    region: string;
    postal: string;
};

export default function Privacy() {
    const [fingerprint, setFingerprint] = useState<string | null>(null);
    const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
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

        return () => clearTimeout(timer);
    }, []);

    const metaItems = [
        { label: 'DEVICE_PLATFORM', value: browserInfo.platform },
        { label: 'LOCALE_IDENTIFIER', value: browserInfo.language },
        { label: 'CHRONO_ZONE', value: browserInfo.timezone },
        { label: 'DISPLAY_MATRIX', value: `${browserInfo.screen.width}x${browserInfo.screen.height}` },
        { label: 'COLOR_DEPTH_BITS', value: `${browserInfo.screen.colorDepth}-BIT` },
        { label: 'HARDWARE_CONCURRENCY', value: `${browserInfo.cores} CORES` },
        { label: 'VOLATILE_MEMORY', value: browserInfo.memory },
        { label: 'REMOTE_HOST_ADDR', value: ipInfo?.ip || 'SCANNING...' },
        { label: 'CLIENT_IDENTIFIER_HASH', value: fingerprint || 'GENERATING...' },
    ];

    return (
        <>
            <WebVitals />
            <main className='min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4 md:p-8 selection:bg-[var(--color-accent)] selection:text-[var(--color-bg)]'>
                <div className='fixed inset-0 overflow-hidden pointer-events-none'>
                    <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(62,175,124,0.03),transparent_60%)]' />
                </div>

                <div className={`w-full max-w-6xl h-[85vh] transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className='terminal-window flex flex-col h-full'>
                        <div className='terminal-header'>
                            <div className='terminal-controls'>
                                <div className='terminal-control red' />
                                <div className='terminal-control yellow' />
                                <div className='terminal-control green' />
                            </div>
                            <div className='terminal-title'>johnleonardo — ~/privacy-exposure-scanner</div>
                        </div>

                        <div className='terminal-split flex-grow overflow-hidden'>
                            {/* Left Sidebar: Key Identifiers */}
                            <div className='terminal-pane border-r border-[var(--color-border)] hidden md:flex flex-col gap-8'>
                                <div>
                                    <div className='flex items-center gap-2 mb-6 text-[var(--color-accent)]'>
                                        <span className='terminal-prompt'>➜</span>
                                        <span className='text-sm uppercase tracking-widest font-bold'>Exposure</span>
                                    </div>
                                    <nav className='flex flex-col gap-4 mb-10'>
                                        <div className='p-4 border border-red-500/20 bg-red-500/5 rounded-lg font-mono'>
                                            <span className='text-[10px] text-red-400 uppercase tracking-widest block mb-2 font-bold'>Resource_Leaked</span>
                                            <div className='text-xl font-bold text-white truncate'>{ipInfo?.ip || 'SCANNING...'}</div>
                                            <span className='text-[9px] opacity-40 uppercase block mt-1'>{ipInfo ? `${ipInfo.city}, ${ipInfo.country}` : 'LOCATING...'}</span>
                                        </div>
                                        <Link href='/' className='text-sm hover:text-[var(--color-accent)] transition-colors mt-4 font-mono uppercase tracking-[0.2em] opacity-60'>~/home</Link>
                                        <Link href='/apps' className='text-sm hover:text-[var(--color-accent)] transition-colors font-mono uppercase tracking-[0.2em] opacity-60'>~/apps</Link>
                                    </nav>

                                    <div className='space-y-6 font-mono'>
                                        <div>
                                            <span className='text-[var(--color-text)] opacity-40 text-[10px] uppercase tracking-widest block mb-4'>$ cat fingerprint.id</span>
                                            <div className='text-[11px] font-mono text-[var(--color-accent)] break-all bg-black/40 p-3 border border-[var(--color-border)] rounded'>
                                                {fingerprint || '[CALCULATING_HASH...]'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='mt-auto pt-8 border-t border-[var(--color-border)] opacity-30 font-mono text-[9px] uppercase tracking-tighter leading-relaxed'>
                                    "Passive reconnaissance of client-side artifacts and network headers."
                                </div>
                            </div>

                            {/* Main Display: Full Exposure Matrix */}
                            <div className='terminal-pane bg-black/40 flex flex-col p-8 overflow-y-auto w-full'>
                                <div className='max-w-4xl mx-auto w-full space-y-10'>
                                    <div className='flex items-center gap-4 opacity-40'>
                                        <span className='text-[10px] font-mono uppercase tracking-widest'>Client_Artifact_Exposure_Matrix</span>
                                        <div className='h-[1px] flex-grow bg-[var(--color-border)]' />
                                    </div>

                                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                        {metaItems.map(item => (
                                            <div key={item.label} className='border border-[var(--color-border)] p-5 rounded-lg bg-black/40 hover:border-[var(--color-accent)]/30 transition-all group'>
                                                <span className='text-[9px] font-mono text-[var(--color-accent)] opacity-40 uppercase tracking-widest block mb-2 group-hover:opacity-80 transition-opacity'>{item.label}</span>
                                                <div className='text-xs font-mono text-[var(--color-text)] break-all uppercase selection:bg-[var(--color-accent)] selection:text-black'>
                                                    {item.value || '[NULL]'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className='pt-10 border-t border-[var(--color-border)]'>
                                        <div className='flex items-center gap-2 mb-6 text-red-400 font-mono'>
                                            <span className='terminal-prompt'>$</span>
                                            <span className='text-[10px] uppercase tracking-widest opacity-60'>User_Agent_String</span>
                                        </div>
                                        <div className='p-6 bg-red-400/5 border border-red-500/20 rounded-lg selection:bg-red-400/20'>
                                            <p className='text-xs font-mono text-red-300 leading-relaxed break-all uppercase'>
                                                {browserInfo.userAgent}
                                            </p>
                                        </div>
                                    </div>

                                    <div className='flex flex-col items-center gap-4 py-12 opacity-30 animate-pulse'>
                                        <div className='flex gap-2 font-mono text-[10px] uppercase tracking-[0.4em]'>
                                            <span className='text-red-500'>[DATA_COLLECTED]</span>
                                            <span className='text-red-500'>[TRACKING_ACTIVE]</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Console decoration */}
                    <div className='mt-4 flex items-center justify-between text-[10px] font-mono text-[var(--color-text-dim)] opacity-40 uppercase tracking-[0.2em] px-4'>
                        <div className='flex gap-6'>
                            <span>Protocol: TCP/IP_V4</span>
                            <span>Encryption: TLS_1.3</span>
                        </div>
                        <span>Status: scan_complete</span>
                    </div>
                </div>
            </main>
        </>
    );
}
