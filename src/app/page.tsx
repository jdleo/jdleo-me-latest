'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { strings } from './constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';

export default function Home() {
    const [pageViewCount, setPageViewCount] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    // Helper function to format numbers with commas
    const formatNumber = (num: number | string) => {
        const number = Number(num) || 0;
        return number.toLocaleString('en-US');
    };

    useEffect(() => {
        // Small delay for smoother loading animation
        const timer = setTimeout(() => setIsLoaded(true), 100);

        axios
            .get('/api/view')
            .then(res => {
                console.log('Raw response:', res.data.views, typeof res.data.views);
                const views = Number(res.data.views) || 0;
                console.log('Converted views:', views, typeof views);
                setPageViewCount(views);
            })
            .catch(error => {
                console.error('Failed to fetch view count:', error);
                setPageViewCount(0);
            });

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <WebVitals />
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
                        <a href='/' className='nav-logo'>
                            JL
                        </a>
                        <div className='nav-links'>
                            <a href='/apps' className='nav-link'>
                                Apps
                            </a>
                            <a href='/apps/resume' className='nav-link'>
                                Resume
                            </a>
                            <a
                                href={strings.LINKEDIN_URL}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='nav-link'
                            >
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
                        <section
                            className='text-center max-w-5xl mx-auto mb-8'
                            itemScope
                            itemType='https://schema.org/Person'
                        >
                            {/* Name & Title */}
                            <div className={`mb-12 animate-reveal ${isLoaded ? '' : 'opacity-0'}`}>
                                <h1 className='text-display gradient-text mb-6' itemProp='name'>
                                    {strings.NAME}
                                </h1>
                                <p className='text-h3 opacity-80 mb-4' itemProp='jobTitle'>
                                    Senior Software Engineer
                                </p>
                            </div>

                            {/* Main Description Card */}
                            <div
                                className={`glass-card-enhanced p-8 md:p-12 mb-12 animate-reveal animate-reveal-delay-1 ${
                                    isLoaded ? '' : 'opacity-0'
                                }`}
                            >
                                {/* Main Subtitle */}
                                <p className='text-body leading-relaxed max-w-4xl mx-auto mb-6' itemProp='description'>
                                    {strings.SUBTITLE}
                                </p>

                                {/* Fancy Mentorship Section */}
                                <div className='border-t border-white border-opacity-20 pt-4'>
                                    <div className='flex items-center justify-center gap-3 mb-4'>
                                        <div className='w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse'></div>
                                        <span className='text-small font-medium gradient-text-accent'>
                                            Always open to
                                        </span>
                                    </div>
                                    <div className='flex flex-wrap gap-3 justify-center'>
                                        <span className='glass-card-subtle px-4 py-2 text-small font-medium'>
                                            ✨ Mentorship
                                        </span>
                                        <span className='glass-card-subtle px-4 py-2 text-small font-medium'>
                                            💡 Bouncing ideas
                                        </span>
                                        <span className='glass-card-subtle px-4 py-2 text-small font-medium'>
                                            🎯 General guidance
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Primary Action Buttons */}
                            <div
                                className={`flex flex-row gap-4 sm:gap-6 justify-center items-center mb-4 animate-reveal animate-reveal-delay-2 ${
                                    isLoaded ? '' : 'opacity-0'
                                }`}
                            >
                                <a href={`mailto:${strings.EMAIL}`} className='button-primary group'>
                                    <span>Email Me</span>
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
                                        <path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' />
                                        <polyline points='22,6 12,13 2,6' />
                                    </svg>
                                </a>
                                <a
                                    href='https://calendly.com/jleonardo-roblox'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='button-book group'
                                >
                                    <span>Let's chat!</span>
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
                                        <path d='M8 2v4' />
                                        <path d='M16 2v4' />
                                        <rect width='18' height='18' x='3' y='4' rx='2' />
                                        <path d='M3 10h18' />
                                    </svg>
                                </a>
                            </div>
                        </section>

                        {/* Quick Links & Contact */}
                        <section
                            className={`max-w-4xl mx-auto text-center animate-reveal animate-reveal-delay-3 ${
                                isLoaded ? '' : 'opacity-0'
                            }`}
                        >
                            {/* View Counter - Glass Pill */}
                            <div className='glass-card px-4 py-2 inline-flex items-center gap-2'>
                                <svg
                                    width='14'
                                    height='14'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    className='opacity-60'
                                >
                                    <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
                                    <circle cx='12' cy='12' r='3' />
                                </svg>
                                <span className='text-small opacity-80'>{formatNumber(pageViewCount)} views</span>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </>
    );
}
