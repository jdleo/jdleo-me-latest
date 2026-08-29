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
