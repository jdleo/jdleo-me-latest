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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        { label: 'Device Platform', value: browserInfo.platform, icon: '💻' },
        { label: 'Locale / Language', value: browserInfo.language, icon: '🌐' },
        { label: 'Timezone', value: browserInfo.timezone, icon: '🕒' },
        { label: 'Display Resolution', value: `${browserInfo.screen.width}x${browserInfo.screen.height}`, icon: '🖥️' },
        { label: 'Color Depth', value: `${browserInfo.screen.colorDepth}-bit`, icon: '🎨' },
        { label: 'CPU Cores', value: `${browserInfo.cores} Cores`, icon: '⚙️' },
        { label: 'Memory (RAM)', value: browserInfo.memory, icon: '💾' },
        { label: 'Fingerprint Hash', value: fingerprint || 'GENERATING...', icon: '🆔' },
    ];

    return (
        <>
            <WebVitals />
            <main className='relative h-screen bg-[#fafbff] overflow-hidden selection:bg-[var(--purple-2)] selection:text-[var(--purple-4)] flex flex-col md:flex-row'>

                {/* Mobile Header */}
                <header className='md:hidden flex items-center justify-between p-4 border-b border-[var(--border-light)] bg-white/80 backdrop-blur-md z-50'>
                    <Link href='/apps' className='text-sm font-bold uppercase tracking-widest text-muted hover:text-[var(--purple-4)]'>
                        ← Apps
                    </Link>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className='px-3 py-1.5 bg-white border border-[var(--border-light)] rounded-full shadow-sm text-xs font-bold uppercase tracking-wider text-[var(--fg-4)] flex items-center gap-1.5'
                    >
                        <span>Status</span>
                        <span className='text-[10px]'>▼</span>
                    </button>
                </header>

                {/* Left Sidebar (Desktop) */}
                <aside className='hidden md:flex flex-col w-80 h-full border-r border-[var(--border-light)] bg-white/50 backdrop-blur-xl z-20'>
                    <div className='p-6 border-b border-[var(--border-light)]'>
                        <div className='flex items-center gap-3 mb-6'>
                            <div className='w-3 h-3 rounded-full bg-[var(--purple-4)]' />
                            <span className='font-bold uppercase tracking-widest text-sm text-[var(--fg-4)]'>Privacy Scan</span>
                        </div>
                        <nav className='flex flex-col gap-2'>
                            <Link href='/apps' className='text-xs font-bold uppercase tracking-wider text-muted hover:text-[var(--purple-4)] transition-colors flex items-center gap-2'>
                                <span>←</span> Back to Apps
                            </Link>
                        </nav>
                    </div>

                    <div className='flex-grow overflow-y-auto p-6 space-y-8'>
                        <div>
                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Exposure Status</h3>
                            <div className='space-y-4'>
                                <div className='bg-red-50 border border-red-100 p-4 rounded-xl'>
                                    <span className='text-[10px] font-bold uppercase tracking-wider text-red-500 block mb-2'>Public IP Address</span>
                                    <div className='text-xl font-bold text-red-600 font-mono tracking-tight'>
                                        {ipInfo?.ip || 'SCANNING...'}
                                    </div>
                                </div>
                                <div className='bg-white border border-[var(--border-light)] p-4 rounded-xl shadow-sm'>
                                    <span className='text-[10px] font-bold uppercase tracking-wider text-muted block mb-2'>Approximate Location</span>
                                    <div className='text-sm font-bold text-[var(--fg-4)]'>
                                        {ipInfo ? `${ipInfo.city}, ${ipInfo.country}` : 'LOCATING...'}
                                    </div>
                                    <div className='text-xs text-muted mt-1'>{ipInfo?.region}</div>
                                </div>
                            </div>
                        </div>


                    </div>
                </aside>

                {/* Main Content Area */}
                <div className='flex-grow flex flex-col h-full relative bg-[#fafbff] overflow-hidden'>
                    {/* Floating decorations */}
                    <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--purple-1)] opacity-30 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2' />

                    <div className='flex-grow overflow-auto p-4 md:p-8 z-10 custom-scrollbar'>
                        <div className='max-w-4xl mx-auto w-full space-y-8 animate-fade-in-up'>

                            {/* Header Section */}
                            <div className='flex items-center justify-between'>
                                <div>
                                    <h2 className='text-2xl font-bold text-[var(--fg-4)]'>Digital Fingerprint</h2>
                                    <p className='text-sm text-muted mt-1'>Data exposed to every website you visit.</p>
                                </div>
                                <div className='px-3 py-1 bg-red-50 text-red-500 border border-red-100 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2'>
                                    <span className='relative flex h-2 w-2'>
                                        <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75'></span>
                                        <span className='relative inline-flex rounded-full h-2 w-2 bg-red-500'></span>
                                    </span>
                                    Detected
                                </div>
                            </div>

                            {/* Artifact Grid */}
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                {metaItems.map(item => (
                                    <div key={item.label} className='bg-white p-5 rounded-2xl border border-[var(--border-light)] shadow-sm hover:shadow-md hover:border-[var(--purple-2)] transition-all group'>
                                        <div className='flex items-start justify-between mb-3'>
                                            <span className='text-2xl opacity-50 grayscale group-hover:grayscale-0 transition-all'>{item.icon}</span>
                                            <span className='text-[10px] font-bold uppercase tracking-wider text-muted'>{item.label}</span>
                                        </div>
                                        <div className='text-sm font-bold text-[var(--fg-4)] font-mono break-all'>
                                            {item.value}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* User Agent Block */}
                            <div className='bg-white p-6 rounded-2xl border border-[var(--border-light)] shadow-sm'>
                                <span className='text-[10px] font-bold uppercase tracking-wider text-muted block mb-3'>User Agent String</span>
                                <div className='p-4 bg-[var(--bg-2)] rounded-xl border border-[var(--border-light)]'>
                                    <code className='text-xs font-mono text-[var(--fg-4)] break-all leading-relaxed'>
                                        {browserInfo.userAgent}
                                    </code>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu Overlay */}
                    {isMobileMenuOpen && (
                        <div className='fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 md:hidden' onClick={() => setIsMobileMenuOpen(false)}>
                            <div className='w-full max-w-sm bg-white rounded-2xl shadow-2xl animate-slide-up overflow-hidden border border-[var(--border-light)]' onClick={e => e.stopPropagation()}>
                                <div className='p-4 border-b border-[var(--border-light)] flex justify-between items-center bg-[var(--bg-2)]'>
                                    <span className='text-xs font-bold uppercase tracking-widest text-[var(--fg-4)]'>Exposure Data</span>
                                    <button onClick={() => setIsMobileMenuOpen(false)} className='w-6 h-6 rounded-full bg-white border border-[var(--border-light)] flex items-center justify-center text-muted'>✕</button>
                                </div>
                                <div className='p-4 space-y-4'>
                                    <div className='bg-red-50 p-4 rounded-xl border border-red-100 text-center'>
                                        <span className='text-[10px] font-bold uppercase tracking-wider text-red-500 block mb-1'>IP Address</span>
                                        <span className='text-lg font-bold text-red-600 font-mono'>{ipInfo?.ip || '...'}</span>
                                    </div>
                                    <div className='grid grid-cols-2 gap-3'>
                                        <div className='bg-[var(--bg-2)] p-3 rounded-xl border border-[var(--border-light)]'>
                                            <span className='text-[10px] font-bold uppercase tracking-wider text-muted block mb-1'>Platform</span>
                                            <span className='text-xs font-bold text-[var(--fg-4)]'>{browserInfo.platform}</span>
                                        </div>
                                        <div className='bg-[var(--bg-2)] p-3 rounded-xl border border-[var(--border-light)]'>
                                            <span className='text-[10px] font-bold uppercase tracking-wider text-muted block mb-1'>Cores</span>
                                            <span className='text-xs font-bold text-[var(--fg-4)]'>{browserInfo.cores}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
