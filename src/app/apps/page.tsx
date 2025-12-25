'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { strings } from '../constants/strings';
import { apps } from '../constants/apps';
import { WebVitals } from '@/components/SEO/WebVitals';

export default function Apps() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <WebVitals />
            <main className='relative min-h-screen overflow-hidden selection:bg-[var(--purple-2)] selection:text-[var(--purple-4)]'>
                {/* Floating Decorations */}
                <div className='float-decoration float-1' />
                <div className='float-decoration float-2' />

                {/* Header Navigation */}
                <header className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                    <div className='max-w-6xl mx-auto flex justify-between items-center'>
                        <Link href='/' className='text-sm font-bold uppercase tracking-widest text-[var(--fg-4)] hover:text-[var(--purple-4)] transition-colors'>
                            {strings.NAME}
                        </Link>
                        <nav className='flex items-center gap-6 md:gap-10'>
                            {[
                                { label: 'Apps', href: '/apps' },
                                { label: 'Blog', href: '/blog' },
                                { label: 'Resume', href: '/apps/resume' },
                            ].map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${link.href === '/apps' ? 'text-[var(--purple-4)]' : 'text-muted hover:text-[var(--purple-4)]'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </header>

                <div className={`container mx-auto px-6 pt-32 pb-20 transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

                    {/* Header Section */}
                    <div className='max-w-4xl mx-auto mb-16 text-center'>
                        <h1 className='text-4xl md:text-5xl font-bold mb-4 text-[var(--fg-4)]'>
                            Applications & Tools
                        </h1>
                        <p className='text-lg text-muted max-w-2xl mx-auto'>
                            A collection of production-ready tools, prototypes, and experiments.
                        </p>
                    </div>

                    {/* Apps Grid */}
                    <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 max-w-6xl mx-auto'>
                        {apps.map((app) => (
                            <Link
                                key={app.title}
                                href={app.href}
                                className='group'
                            >
                                <div className='card h-full p-4 md:p-8 hover:border-[var(--purple-2)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between'>
                                    <div>
                                        <div className='flex items-start justify-between mb-3 md:mb-6'>
                                            <span className='text-2xl md:text-4xl group-hover:scale-110 transition-transform duration-300'>
                                                {app.emoji}
                                            </span>
                                            <div className='hidden md:block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--purple-1)] text-[var(--purple-4)]'>
                                                Open
                                            </div>
                                        </div>

                                        <h2 className='text-sm md:text-xl font-bold mb-1 md:mb-2 group-hover:text-[var(--purple-4)] transition-colors line-clamp-1'>
                                            {app.title}
                                        </h2>

                                        <p className='text-muted text-[10px] md:text-sm leading-relaxed mb-0 md:mb-6 line-clamp-2 md:line-clamp-3'>
                                            {app.subtitle}
                                        </p>
                                    </div>

                                    <div className='hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--purple-4)] opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 mt-auto'>
                                        <span>Launch App</span>
                                        <span>→</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Footer */}
                    <footer className='py-20 text-center text-muted border-t border-[var(--border-light)] mt-20 max-w-4xl mx-auto'>
                        <p className='text-[10px] font-bold uppercase tracking-[0.4em] opacity-30'>
                            © 2026 {strings.NAME}
                        </p>
                    </footer>
                </div>
            </main>
        </>
    );
}
