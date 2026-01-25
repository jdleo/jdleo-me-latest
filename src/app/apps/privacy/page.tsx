'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { strings } from '../../constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import {
    DevicePhoneMobileIcon,
    PencilSquareIcon,
    DocumentTextIcon,
    ShieldCheckIcon,
    GlobeAmericasIcon,
    ComputerDesktopIcon,
} from '@heroicons/react/24/outline';

type IPInfo = {
    ip: string;
    city: string;
    country: string;
    region: string;
    postal: string;
};

export default function Privacy() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [fingerprint, setFingerprint] = useState<string | null>(null);
    const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);
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
            <main className='notion-page'>
                <header className={`notion-header ${isLoaded ? 'loaded' : ''}`}>
                    <div className='notion-nav' style={{ justifyContent: 'space-between', maxWidth: '1100px' }}>
                        <Link href='/' className='notion-nav-link' style={{ fontWeight: 600 }}>
                            {strings.NAME}
                        </Link>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Link href='/apps' className='notion-nav-link'>
                                <DevicePhoneMobileIcon className='notion-nav-icon' />
                                Apps
                            </Link>
                            <Link href='/blog' className='notion-nav-link'>
                                <PencilSquareIcon className='notion-nav-icon' />
                                Blog
                            </Link>
                            <Link href='/apps/resume' className='notion-nav-link'>
                                <DocumentTextIcon className='notion-nav-icon' />
                                Resume
                            </Link>
                        </div>
                    </div>
                </header>

                <div className={`notion-content ${isLoaded ? 'loaded' : ''}`} style={{ maxWidth: '1000px' }}>
                    <div className='notion-title-block'>
                        <h1 className='notion-title'>Privacy Scan</h1>
                        <div className='notion-subtitle'>See what websites can learn about you just by visiting</div>
                    </div>

                    <div className='notion-divider' />

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>

                        <div className='notion-card' style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <GlobeAmericasIcon style={{ width: '20px', height: '20px', color: '#ef4444' }} />
                                    <span style={{ fontSize: '14px', fontWeight: 600 }}>Network Identity</span>
                                </div>
                                <span style={{ fontSize: '10px', fontWeight: 700, color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                    Exposed
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase' }}>IP Address</span>
                                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#37352f', fontFamily: 'monospace' }}>
                                        {ipInfo?.ip || 'Scanning...'}
                                    </div>
                                </div>
                                <div style={{ height: '1px', backgroundColor: 'rgba(55, 53, 47, 0.09)' }} />
                                <div>
                                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase' }}>Location</span>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#37352f' }}>
                                        {ipInfo ? `${ipInfo.city}, ${ipInfo.region}, ${ipInfo.country}` : 'Locating...'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='notion-card' style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ShieldCheckIcon style={{ width: '20px', height: '20px', color: '#6366f1' }} />
                                    <span style={{ fontSize: '14px', fontWeight: 600 }}>Digital Fingerprint</span>
                                </div>
                                <span style={{ fontSize: '10px', fontWeight: 700, color: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                    Unique ID
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase' }}>Canvas Hash</span>
                                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#37352f', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                        {fingerprint || 'Generating...'}
                                    </div>
                                </div>
                                <div style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(55, 53, 47, 0.5)', lineHeight: 1.5 }}>
                                    Your browser's unique rendering behavior creates a permanent ID used to track you across the web, even in Incognito mode.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='notion-section'>
                        <div className='notion-section-title'>
                            <ComputerDesktopIcon className='notion-section-icon' />
                            Device Leaks
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '16px' }}>
                            {metaItems.map((item) => (
                                <div key={item.label} className='notion-card' style={{ padding: '16px' }}>
                                    <div style={{ fontSize: '24px', marginBottom: '12px' }}>{item.icon}</div>
                                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', marginBottom: '4px' }}>
                                        {item.label}
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#37352f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='notion-section'>
                        <div className='notion-card' style={{ padding: '24px', backgroundColor: '#f8fafc' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>User Agent String</span>
                            <code style={{ fontSize: '12px', fontFamily: 'monospace', color: '#37352f', lineHeight: 1.6, wordBreak: 'break-all' }}>
                                {browserInfo.userAgent}
                            </code>
                        </div>
                    </div>

                    <footer className='notion-footer'>
                        © 2026 {strings.NAME}
                    </footer>
                </div>
            </main>
        </>
    );
}
