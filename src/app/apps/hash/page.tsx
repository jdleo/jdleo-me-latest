'use client';

import Link from 'next/link';
import { strings } from '../../constants/strings';
import { useState, useEffect } from 'react';
import crypto from 'crypto';

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

const HashCard = ({ name, hash }: { name: string; hash: string }) => (
    <div className='w-full p-4 rounded-xl glass-card transition-all duration-300 hover:shadow-orbital-glow-sm'>
        <div className='text-[color:var(--foreground)] text-opacity-60 mb-2 font-medium'>{name}</div>
        <div className='font-mono text-xs break-all bg-[color:var(--background)] bg-opacity-50 p-3 rounded-lg text-[color:var(--foreground)] text-opacity-80'>
            {hash}
        </div>
    </div>
);

export default function Hash() {
    const [input, setInput] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [particles, setParticles] = useState<Particle[]>([]);

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
    }, []);

    const hashes = [
        { name: 'MD5', value: crypto.createHash('md5').update(input).digest('hex') },
        { name: 'SHA1', value: crypto.createHash('sha1').update(input).digest('hex') },
        { name: 'SHA256', value: crypto.createHash('sha256').update(input).digest('hex') },
        { name: 'SHA512', value: crypto.createHash('sha512').update(input).digest('hex') },
        { name: 'RIPEMD160', value: crypto.createHash('ripemd160').update(input).digest('hex') },
        { name: 'SHA384', value: crypto.createHash('sha384').update(input).digest('hex') },
        { name: 'SHA224', value: crypto.createHash('sha224').update(input).digest('hex') },
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
                className={`flex-1 flex flex-col items-center pt-24 sm:pt-28 px-4 gap-6 transition-opacity duration-700 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <div className='mb-2 text-center'>
                    <h1 className='text-2xl sm:text-3xl font-bold mb-2'>
                        <span className='gradient-text'>Hash Lab</span>
                    </h1>
                    <p className='text-[color:var(--foreground)] text-opacity-70 max-w-md mb-6'>
                        Convert text between different hash algorithms instantly.
                    </p>
                </div>

                <div className='w-full max-w-[500px] mb-4'>
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder='Enter text to hash'
                        className='w-full p-4 rounded-lg bg-[color:var(--secondary)] border border-[color:var(--border)]
                                text-[color:var(--foreground)] placeholder:text-[color:var(--foreground)] placeholder:text-opacity-50 
                                focus:outline-none focus:border-[color:var(--primary)] focus:border-opacity-50
                                transition-all duration-300'
                    />
                </div>

                <div className='grid grid-cols-1 gap-4 w-full max-w-[500px]'>
                    {hashes.map(h => (
                        <HashCard key={h.name} name={h.name} hash={h.value} />
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
