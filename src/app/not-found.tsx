'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apps } from './constants/apps';
import { WebVitals } from '@/components/SEO/WebVitals';

export default function NotFound() {
    const [isLoaded, setIsLoaded] = useState(false);
    const popularApps = apps.slice(0, 3);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <WebVitals />
            <main className='min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4 md:p-8 selection:bg-[var(--color-accent)] selection:text-[var(--color-bg)]'>
                <div className='fixed inset-0 overflow-hidden pointer-events-none'>
                    <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(239,68,68,0.03),transparent_60%)]' />
                    <div className='absolute inset-0' style={{
                        backgroundImage: 'radial-gradient(rgba(255,255,255,0.01) 1px, transparent 1px)',
                        backgroundSize: '32px 32px'
                    }} />
                </div>

                <div className={`w-full max-w-2xl transition-all duration-700 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className='terminal-window'>
                        <div className='terminal-header border-red-500/20'>
                            <div className='terminal-controls'>
                                <div className='terminal-control red' />
                                <div className='terminal-control yellow opacity-30 shadow-none' />
                                <div className='terminal-control green opacity-30 shadow-none' />
                            </div>
                            <div className='terminal-title text-red-500/50'>system_error — 404</div>
                        </div>

                        <div className='p-8 md:p-12 font-mono'>
                            <div className='flex items-center gap-3 mb-8 text-red-500'>
                                <span className='text-2xl animate-pulse'>!</span>
                                <h1 className='text-3xl font-bold tracking-tighter uppercase'>Error: Page Not Found</h1>
                            </div>

                            <div className='space-y-6 text-[var(--color-text-dim)]'>
                                <div className='p-4 bg-red-500/5 border border-red-500/20 rounded text-sm leading-relaxed'>
                                    <span className='text-red-500'>[FATAL]</span> The requested resource at segment <code className='text-[var(--color-text)] bg-white/5 px-1'>0xDEADBEEF</code> could not be located on this server. It may have been moved, deleted, or never existed in the current namespace.
                                </div>

                                <div className='space-y-2'>
                                    <div className='text-[10px] uppercase tracking-widest opacity-40 mb-4'>Recovery Options</div>
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                        <Link href='/' className='group flex items-center justify-between p-3 border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 rounded transition-all'>
                                            <span className='text-xs'>~/return_home</span>
                                            <span className='text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity'>[ENTER]</span>
                                        </Link>
                                        <Link href='/apps' className='group flex items-center justify-between p-3 border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 rounded transition-all'>
                                            <span className='text-xs'>~/explore_apps</span>
                                            <span className='text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity'>[ENTER]</span>
                                        </Link>
                                    </div>
                                </div>

                                <div className='pt-8 border-t border-[var(--color-border)]'>
                                    <div className='text-[10px] uppercase tracking-widest opacity-40 mb-4'>Suggested Entrypoints</div>
                                    <div className='space-y-2'>
                                        {popularApps.map(app => (
                                            <Link key={app.href} href={app.href} className='flex items-center justify-between text-xs hover:text-[var(--color-accent)] transition-colors py-1 group'>
                                                <span className='flex items-center gap-2'>
                                                    <span className='opacity-40 font-bold'>&gt;</span>
                                                    {app.title.toLowerCase().replace(/\s+/g, '_')}/
                                                </span>
                                                <span className='text-[var(--color-text-dim)] group-hover:text-[var(--color-accent)] opacity-40'>{app.subtitle.slice(0, 30)}...</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className='mt-12 text-[10px] opacity-20 text-center uppercase tracking-[0.2em]'>
                                System status: degraded // Connection: stable
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
