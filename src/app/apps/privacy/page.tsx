'use client';

import Link from 'next/link';
import { strings } from '../../constants/strings';
import { useState, useEffect } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

type Particle = {
    id: number;
    width: string;
    height: string;
    backgroundColor: string;
    boxShadow: string;
    left: string;
    top: string;
    animationDuration: string;
    animationDelay: string;
};

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
    <div className='w-full p-4 rounded-xl glass-card transition-all duration-300 hover:shadow-orbital-glow-sm'>
        <div className='flex items-center gap-3 mb-3'>
            <span className='text-xl'>{icon}</span>
            <h3 className='text-[color:var(--foreground)] text-opacity-60'>{title}</h3>
        </div>
        <div className='font-mono text-sm break-all bg-[color:var(--background)] bg-opacity-50 p-3 rounded-lg text-[color:var(--foreground)] text-opacity-80'>
            {value || 'Loading...'}
        </div>
    </div>
);

export default function Privacy() {
    const [fingerprint, setFingerprint] = useState<string | null>(null);
    const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [browserInfo, setBrowserInfo] = useState({
        screen: { width: 0, height: 0, colorDepth: 0 },
        platform: '',
        userAgent: '',
        language: '',
        timezone: '',
        memory: 'Not Available',
    });

    useEffect(() => {
        setIsLoaded(true);

        // Generate particles once on component mount
        const newParticles = Array.from({ length: 8 }, (_, i) => {
            return {
                id: i,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                backgroundColor: `rgba(${150 + Math.random() * 100}, ${150 + Math.random() * 100}, ${
                    200 + Math.random() * 55
                }, ${0.3 + Math.random() * 0.3})`,
                boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(${150 + Math.random() * 100}, ${
                    150 + Math.random() * 100
                }, ${200 + Math.random() * 55}, 0.3)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 10 + 10}s`,
                animationDelay: `${Math.random() * 5}s`,
            };
        });

        setParticles(newParticles);

        // get fingerprint
        FingerprintJS.load()
            .then(fp => fp.get())
            .then(result => setFingerprint(result.visitorId));

        // get ip info
        fetch('/api/ip')
            .then(res => res.json())
            .then(setIpInfo);

        // set browser info safely
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
        });
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
            value: browserInfo.screen.width ? `${browserInfo.screen.width}x${browserInfo.screen.height}` : 'Loading...',
            icon: '📱',
        },
        {
            title: 'Color Depth',
            value: browserInfo.screen.colorDepth ? `${browserInfo.screen.colorDepth}-bit` : 'Loading...',
            icon: '🎨',
        },
        {
            title: 'Platform',
            value: browserInfo.platform,
            icon: '💻',
        },
        {
            title: 'User Agent',
            value: browserInfo.userAgent,
            icon: '🔎',
        },
        {
            title: 'Language',
            value: browserInfo.language,
            icon: '🗣️',
        },
        {
            title: 'Timezone',
            value: browserInfo.timezone,
            icon: '🕒',
        },
        {
            title: 'Device Memory',
            value: browserInfo.memory,
            icon: '💾',
        },
    ];

    return (
        <div className='min-h-screen bg-[color:var(--background)] overflow-hidden orbital-grid'>
            {/* Background gradient effects */}
            <div className='fixed inset-0 bg-[color:var(--background)] z-[-2]' />
            <div
                className='fixed top-[-50%] left-[-20%] w-[140%] h-[140%] z-[-1] opacity-30 animate-spin-slow'
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(94, 106, 210, 0.1) 0%, transparent 70%)',
                    transformOrigin: 'center center',
                    animationDuration: '120s',
                }}
            />

            {/* Header */}
            <header className='absolute top-0 right-0 p-4 sm:p-6'>
                <nav className='flex gap-4 sm:gap-6 text-[color:var(--foreground)] text-opacity-70 text-sm sm:text-base'>
                    <Link href='/apps' className='linear-link'>
                        Apps
                    </Link>
                    <Link href='/' className='linear-link'>
                        Home
                    </Link>
                    <a href={`mailto:${strings.EMAIL}`} className='linear-link'>
                        Email
                    </a>
                    <a href={strings.LINKEDIN_URL} target='_blank' rel='noopener noreferrer' className='linear-link'>
                        LinkedIn
                    </a>
                    <a href={strings.GITHUB_URL} target='_blank' rel='noopener noreferrer' className='linear-link'>
                        GitHub
                    </a>
                </nav>
            </header>

            <main
                className={`flex-1 flex flex-col items-center pt-24 sm:pt-28 px-4 pb-8 transition-opacity duration-700 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <div className='mb-2 text-center'>
                    <h1 className='text-2xl sm:text-3xl font-bold mb-2'>
                        <span className='gradient-text'>Privacy Scanner</span>
                    </h1>
                    <p className='text-[color:var(--foreground)] text-opacity-70 max-w-md mb-6'>
                        This shows what websites can learn about you through browser fingerprinting.
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[850px]'>
                    {infoCards.map(card => (
                        <InfoCardComponent key={card.title} {...card} />
                    ))}
                </div>

                {/* Floating particles for orbital effect */}
                <div className='fixed inset-0 pointer-events-none'>
                    {particles.map(particle => (
                        <div
                            key={particle.id}
                            className='absolute rounded-full animate-float'
                            style={{
                                width: particle.width,
                                height: particle.height,
                                backgroundColor: particle.backgroundColor,
                                boxShadow: particle.boxShadow,
                                left: particle.left,
                                top: particle.top,
                                animationDuration: particle.animationDuration,
                                animationDelay: particle.animationDelay,
                            }}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}
