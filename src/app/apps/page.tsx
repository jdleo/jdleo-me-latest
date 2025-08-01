'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { strings } from '../constants/strings';
import { apps } from '../constants/apps';

export default function Apps() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Small delay for smoother loading animation
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className='min-h-screen bg-[var(--color-bg-light)] relative'>
            {/* Subtle background gradients */}
            <div
                className='fixed inset-0 opacity-40 pointer-events-none'
                style={{
                    background:
                        'radial-gradient(ellipse at 30% 20%, rgba(94, 106, 210, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 60%)',
                }}
            />

            {/* Strong Navigation Bar */}
            <nav className='nav-container'>
                <div className='nav-content'>
                    <Link href='/' className='nav-logo'>
                        JL
                    </Link>
                    <div className='nav-links'>
                        <Link href='/' className='nav-link'>
                            Home
                        </Link>
                        <a href='/apps/resume' className='nav-link'>
                            Resume
                        </a>
                        <a href={strings.LINKEDIN_URL} target='_blank' rel='noopener noreferrer' className='nav-link'>
                            LinkedIn
                        </a>
                        <a href={strings.GITHUB_URL} target='_blank' rel='noopener noreferrer' className='nav-link'>
                            GitHub
                        </a>
                    </div>
                </div>
            </nav>

            <main className='main-content'>
                <div className='container-responsive'>
                    {/* Hero Section */}
                    <section className='text-center max-w-4xl mx-auto mb-12'>
                        <div className={`mb-12 animate-reveal ${isLoaded ? '' : 'opacity-0'}`}>
                            <h1 className='text-display gradient-text mb-6'>Mini Apps</h1>
                            <div className='glass-card-enhanced p-6 md:p-8'>
                                <p className='text-body leading-relaxed'>
                                    Here are some mini apps I built directly into this website for fun. They're all open
                                    source and showcase different technologies and ideas.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Apps Grid */}
                    <section
                        className={`max-w-6xl mx-auto animate-reveal animate-reveal-delay-1 ${
                            isLoaded ? '' : 'opacity-0'
                        }`}
                    >
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                            {apps.map((app, index) => (
                                <Link
                                    key={app.title}
                                    href={app.href}
                                    className={`group glass-card p-4 hover:glass-card-enhanced transition-all duration-300 hover:-translate-y-1 animate-reveal animate-reveal-delay-${
                                        (index % 4) + 1
                                    } relative`}
                                >
                                    {/* App Icon & Content */}
                                    <div className='flex items-center gap-3'>
                                        <div className='w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-white to-gray-50 border border-gray-200 group-hover:scale-110 transition-transform duration-300 flex-shrink-0'>
                                            <span className='text-xl'>{app.emoji}</span>
                                        </div>
                                        <div className='flex-1 min-w-0 pr-6'>
                                            <h2 className='text-body font-semibold mb-1 group-hover:gradient-text-accent transition-all duration-300'>
                                                {app.title}
                                            </h2>
                                            <p className='text-small opacity-70 leading-snug line-clamp-2'>
                                                {app.subtitle}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Hover Arrow - Absolute positioned */}
                                    <div className='absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                                        <svg
                                            width='16'
                                            height='16'
                                            viewBox='0 0 24 24'
                                            fill='none'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            className='text-gray-400 group-hover:text-blue-500 transition-colors duration-300'
                                        >
                                            <path d='M5 12h14' />
                                            <path d='M12 5l7 7-7 7' />
                                        </svg>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Bottom CTA */}
                    <section
                        className={`text-center max-w-3xl mx-auto mt-16 animate-reveal animate-reveal-delay-3 ${
                            isLoaded ? '' : 'opacity-0'
                        }`}
                    >
                        <div className='glass-card-subtle p-6'>
                            <p className='text-body opacity-80 mb-4'>
                                Enjoy exploring these mini apps! Each one demonstrates different aspects of web
                                development.
                            </p>
                            <Link href='/' className='button-secondary group'>
                                <svg
                                    width='16'
                                    height='16'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                >
                                    <path d='M19 12H5' />
                                    <path d='M12 19l-7-7 7-7' />
                                </svg>
                                <span>Back to Home</span>
                            </Link>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
