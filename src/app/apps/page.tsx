'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { strings } from '../constants/strings';
import { apps } from '../constants/apps';

export default function Apps() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);

        // Mobile hover effect
        if (window.matchMedia('(hover: none)').matches) {
            const observer = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('mobile-glow');
                        } else {
                            entry.target.classList.remove('mobile-glow');
                        }
                    });
                },
                { threshold: 0.7 }
            );

            document.querySelectorAll('.app-card').forEach(card => {
                observer.observe(card);
            });

            return () => observer.disconnect();
        }
    }, []);

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

            <main className='flex flex-col items-center px-4 pt-24 pb-12 sm:pt-32 sm:pb-16'>
                <div
                    className={`transition-all duration-700 ${
                        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                >
                    <h1 className='text-3xl sm:text-5xl font-bold mb-6 text-center'>
                        <span className='gradient-text'>Mini Apps</span>
                    </h1>
                    <p className='text-[color:var(--foreground)] text-opacity-80 text-sm sm:text-lg max-w-[90%] sm:max-w-[700px] text-center leading-relaxed mb-12 mx-auto'>
                        Here are some mini apps I built directly into this website for fun. They&apos;re all open
                        source. Enjoy!
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 max-w-[1200px] w-full'>
                    {apps.map((app, index) => (
                        <Link
                            key={app.title}
                            href={app.href}
                            className={`app-card glass-card group relative p-6 rounded-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-orbital-glow-sm transition-all duration-700 delay-${
                                100 + index * 50
                            } ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                        >
                            <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[color:var(--orbital-glow-1)] via-[color:var(--orbital-glow-2)] to-[color:var(--orbital-glow-3)] blur-xl' />

                            <div className='relative flex items-start gap-4'>
                                <div className='w-12 h-12 flex items-center justify-center rounded-lg bg-[color:var(--primary)] bg-opacity-20 group-hover:scale-110 transition-transform duration-300'>
                                    <span className='text-2xl'>{app.emoji}</span>
                                </div>
                                <div>
                                    <h2 className='text-[color:var(--foreground)] font-semibold text-xl mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:via-indigo-500 group-hover:to-purple-500 transition-all duration-300'>
                                        {app.title}
                                    </h2>
                                    <p className='text-[color:var(--foreground)] text-opacity-70 text-sm leading-relaxed'>
                                        {app.subtitle}
                                    </p>
                                </div>
                            </div>

                            <div className='absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='h-5 w-5 text-[color:var(--primary)]'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M14 5l7 7m0 0l-7 7m7-7H3'
                                    />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Floating particles for orbital effect */}
                <div className='fixed inset-0 pointer-events-none'>
                    {[...Array(10)].map((_, i) => (
                        <div
                            key={i}
                            className='absolute rounded-full animate-float'
                            style={{
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
                            }}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}
