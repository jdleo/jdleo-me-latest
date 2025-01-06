'use client';

import Link from 'next/link';
import { strings } from '../../constants/strings';
import { useState, useEffect } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

type InfoCard = {
    title: string;
    value: string | number | null | undefined;
    icon: string;
};

type IPInfo = {
    ip: string;
    city: string;
    country: string;
    region: string;
    postal: string;
    latitude: number;
    longitude: number;
    timezone: string;
    org: string;
};

const InfoCardComponent = ({ title, value, icon }: InfoCard) => (
    <div
        className='w-full sm:w-[400px] p-4 rounded-xl backdrop-blur-md shadow-xl
                    border border-white/10 hover:border-white/20 transition-all
                    bg-gradient-to-br from-white/10 via-white/5 to-transparent'
    >
        <div className='flex items-center gap-3 mb-3'>
            <span className='text-xl'>{icon}</span>
            <h3 className='text-white/60 font-nunito'>{title}</h3>
        </div>
        <div className='font-mono text-sm break-all bg-black/20 p-3 rounded-lg text-white/80'>
            {value || 'Loading...'}
        </div>
    </div>
);

export default function Privacy() {
    const [fingerprint, setFingerprint] = useState<string | null>(null);
    const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);

    useEffect(() => {
        // get fingerprint
        FingerprintJS.load()
            .then(fp => fp.get())
            .then(result => setFingerprint(result.visitorId));

        // get ip info from your api
        fetch('/api/ip')
            .then(res => res.json())
            .then(setIpInfo);
    }, []);

    const infoCards: InfoCard[] = [
        {
            title: 'Browser Fingerprint',
            value: fingerprint,
            icon: '🔍',
        },
        {
            title: 'IP Address',
            value: ipInfo?.ip,
            icon: '🌐',
        },
        {
            title: 'Location',
            value: ipInfo ? `${ipInfo.city}, ${ipInfo.country}` : null,
            icon: '📍',
        },
        {
            title: 'Screen Resolution',
            value: `${window.screen.width}x${window.screen.height}`,
            icon: '📱',
        },
        {
            title: 'Color Depth',
            value: `${window.screen.colorDepth}-bit`,
            icon: '🎨',
        },
        {
            title: 'Platform',
            value: navigator.platform,
            icon: '💻',
        },
        {
            title: 'User Agent',
            value: navigator.userAgent,
            icon: '🔎',
        },
        {
            title: 'Language',
            value: navigator.language,
            icon: '🗣️',
        },
        {
            title: 'Timezone',
            value: Intl.DateTimeFormat().resolvedOptions().timeZone,
            icon: '🕒',
        },
        {
            title: 'Device Memory',
            // @ts-ignore
            value: 'deviceMemory' in navigator ? `${(navigator as any).deviceMemory}GB` : 'Not Available',
            icon: '💾',
        },
    ];

    return (
        <div className='flex min-h-screen bg-[#1d1d1d]'>
            <header className='absolute top-0 right-0 p-4'>
                <nav className='flex gap-4 text-white/70 font-nunito'>
                    <Link href='/apps'>Apps</Link>
                    <a href={`mailto:${strings.EMAIL}`}>Email</a>
                    <a href={strings.LINKEDIN_URL}>LinkedIn</a>
                    <a href={strings.GITHUB_URL}>GitHub</a>
                </nav>
            </header>

            <main className='flex-1 flex flex-col items-center pt-20 px-4 pb-8'>
                <h1 className='text-white/90 font-nunito text-2xl mb-2'>Privacy Scanner</h1>
                <p className='text-white/60 font-nunito mb-8 text-center max-w-md'>
                    This shows what websites can learn about you through browser fingerprinting.
                </p>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[850px]'>
                    {infoCards.map(card => (
                        <InfoCardComponent key={card.title} {...card} />
                    ))}
                </div>
            </main>
        </div>
    );
}
