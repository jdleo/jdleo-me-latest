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
            <main className='min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4 md:p-8 selection:bg-[var(--color-accent)] selection:text-[var(--color-bg)]'>
                {/* Background Grid/Glow */}
                <div className='fixed inset-0 overflow-hidden pointer-events-none'>
                    <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(62,175,124,0.03),transparent_60%)]' />
                    <div className='absolute inset-0' style={{
                        backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)',
                        backgroundSize: '32px 32px'
                    }} />
                </div>

                <div className={`w-full max-w-6xl transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className='terminal-window'>
                        {/* Terminal Header */}
                        <div className='terminal-header'>
                            <div className='terminal-controls'>
                                <div className='terminal-control red' />
                                <div className='terminal-control yellow' />
                                <div className='terminal-control green' />
                            </div>
                            <div className='terminal-title'>johnleonardo — ~/apps</div>
                        </div>

                        {/* Terminal Body with Split Screen */}
                        <div className='terminal-split'>
                            {/* Left Pane: Navigation & Info */}
                            <div className='terminal-pane'>
                                <div className='mb-12'>
                                    <div className='flex items-center gap-2 mb-6 text-[var(--color-accent)]'>
                                        <span className='terminal-prompt'>➜</span>
                                        <span className='text-sm uppercase tracking-widest font-bold'>Menu</span>
                                    </div>
                                    <nav className='flex flex-col gap-4'>
                                        <Link href='/' className='text-2xl hover:translate-x-3 transition-all inline-flex items-center gap-3 group whitespace-nowrap'>
                                            <span className='text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity'>&lt;</span>
                                            <span className='text-[var(--color-text-dim)] group-hover:text-[var(--color-text)] transition-colors'>Home</span>
                                        </Link>
                                        <Link href='/apps' className='text-2xl hover:translate-x-3 transition-all inline-flex items-center gap-3 group whitespace-nowrap text-[var(--color-accent)]'>
                                            <span>&gt;</span>
                                            Apps
                                        </Link>
                                        <Link href='/blog' className='text-2xl hover:translate-x-3 transition-all inline-flex items-center gap-3 group whitespace-nowrap'>
                                            <span className='text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity'>&gt;</span>
                                            <span className='text-[var(--color-text-dim)] group-hover:text-[var(--color-text)] transition-colors'>Blog</span>
                                        </Link>
                                        <Link href='/apps/resume' className='text-2xl hover:translate-x-3 transition-all inline-flex items-center gap-3 group whitespace-nowrap'>
                                            <span className='text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity'>&gt;</span>
                                            <span className='text-[var(--color-text-dim)] group-hover:text-[var(--color-text)] transition-colors'>Resume</span>
                                        </Link>
                                    </nav>
                                </div>

                                <div className='space-y-6 pt-8 border-t border-[var(--color-border)]'>
                                    <div className='font-mono'>
                                        <span className='text-[var(--color-text)] opacity-70'>$ cat README.md</span>
                                        <div className='mt-4 text-sm text-[var(--color-text-dim)] leading-relaxed italic border-l-2 border-[var(--color-border)] pl-4'>
                                            "A collection of experiments, prototypes, and production-ready tools built with various tech stacks."
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Pane: Content (App Entries) */}
                            <div className='terminal-pane bg-[rgba(0,0,0,0.2)] scrollbar-hide'>
                                <div className='flex items-center justify-between mb-8 text-[var(--color-accent)]'>
                                    <div className='flex items-center gap-2'>
                                        <span className='terminal-prompt'>$</span>
                                        <span className='text-sm uppercase tracking-widest font-bold'>ls -F</span>
                                    </div>
                                    <span className='text-[10px] opacity-50 font-mono'>DRWX------</span>
                                </div>

                                <div className='flex flex-col gap-2'>
                                    {apps.map((app) => (
                                        <Link
                                            key={app.title}
                                            href={app.href}
                                            className='group flex items-center justify-between p-3 border-b border-[var(--color-border)] hover:bg-[var(--color-accent)]/5 transition-all'
                                        >
                                            <div className='flex items-center gap-4 min-w-0'>
                                                <span className='text-[var(--color-text-dim)] group-hover:text-[var(--color-accent)] transition-colors text-lg'>
                                                    {app.emoji}
                                                </span>
                                                <div className='min-w-0'>
                                                    <h2 className='text-md font-mono text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors flex items-center gap-2'>
                                                        {app.title.toLowerCase().replace(/\s+/g, '_')}/
                                                    </h2>
                                                    <p className='text-xs text-[var(--color-text-dim)] truncate opacity-60'>
                                                        {app.subtitle}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className='text-xs font-mono text-[var(--color-text-dim)] group-hover:text-[var(--color-accent)] opacity-40 group-hover:opacity-100 transition-all'>
                                                [ENTER]
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* Footer Stats for Apps Page */}
                                <div className='mt-12 pt-8 border-t border-[var(--color-border)]'>
                                    <div className='flex items-center justify-between text-[10px] font-mono text-[var(--color-text-dim)] uppercase tracking-wider'>
                                        <div className='flex gap-4'>
                                            <span>STORAGE: 1.2GB USED</span>
                                            <span>ITEMS: {apps.length}</span>
                                        </div>
                                        <div>
                                            VER: 2024.12
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Console decoration */}
                    <div className='mt-6 px-4 flex items-center justify-between text-xs font-mono text-[var(--color-text-dim)] opacity-50'>
                        <div className='flex items-center gap-4'>
                            <div className='flex items-center gap-2'>
                                <div className='w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse' />
                                PROCESS: ACTIVE
                            </div>
                            <div>CPU: 2.1%</div>
                        </div>
                        <div>PID: 48921</div>
                    </div>
                </div>
            </main>
        </>
    );
}
