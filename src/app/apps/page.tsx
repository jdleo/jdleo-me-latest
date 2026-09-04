'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { strings } from '../constants/strings';
import { apps } from '../constants/apps';
import { WebVitals } from '@/components/SEO/WebVitals';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';

const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: 'Resume', href: '/apps/resume' },
    { label: 'GitHub', href: strings.GITHUB_URL, external: true },
];

export default function Apps() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <WebVitals />
            <main className='el-page'>
                <header className='el-nav'>
                    <Link href='/' className='el-logo' aria-label='John Leonardo home'>
                        John Leonardo
                    </Link>
                    <nav className='el-nav-links' aria-label='Apps navigation'>
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                target={link.external ? '_blank' : undefined}
                                rel={link.external ? 'noreferrer' : undefined}
                                className='el-nav-link'
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>
                    <div className='el-nav-actions'>
                        <a href={strings.LINKEDIN_URL} target='_blank' rel='noreferrer' className='el-nav-link'>
                            LinkedIn
                        </a>
                        <a href={`mailto:${strings.EMAIL}`} className='el-btn el-btn-dark el-btn-sm'>
                            Contact
                        </a>
                    </div>
                </header>

                <section className='el-hero el-hero-page'>
                    <div className='el-hero-inner'>
                        <div className='el-hero-copy'>
                            <h1>Apps</h1>
                            <p className='el-hero-sub'>
                                Random apps I made that might have some value to somebody.
                            </p>
                        </div>
                    </div>
                </section>

                <section className='el-section el-blog-list' aria-label='Applications and tools'>
                    <ul className='el-list'>
                        {apps.map((app) => (
                            <li key={app.title}>
                                <Link href={app.href} className='el-row el-post-row'>
                                    <div className='el-post-main'>
                                        <h2>{app.title}</h2>
                                        <p>{app.subtitle}</p>
                                    </div>
                                    <span className='el-arrow' aria-hidden='true'>
                                        <ArrowUpRightIcon />
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>

                <footer className='el-footer'>
                    <div className='el-footer-inner'>
                        <span className='el-footer-logo'>John Leonardo</span>
                        <div className='el-footer-links'>
                            <a href={strings.GITHUB_URL} target='_blank' rel='noreferrer'>
                                GitHub
                            </a>
                            <a href={strings.LINKEDIN_URL} target='_blank' rel='noreferrer'>
                                LinkedIn
                            </a>
                            <a href={`mailto:${strings.EMAIL}`}>{strings.EMAIL}</a>
                        </div>
                        <span className='el-footer-copy'>© 2026. All rights reserved.</span>
                    </div>
                </footer>
            </main>
        </>
    );
}
