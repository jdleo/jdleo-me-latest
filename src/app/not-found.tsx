'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apps } from './constants/apps';
import { WebVitals } from '@/components/SEO/WebVitals';
import { motion } from 'framer-motion';

export default function NotFound() {
    const [isLoaded, setIsLoaded] = useState(false);
    const popularApps = apps.slice(0, 4);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <WebVitals />
            <main className='min-h-screen bg-[#fafbff] flex items-center justify-center p-4 md:p-8 selection:bg-[var(--purple-2)] selection:text-[var(--purple-4)] relative overflow-hidden'>
                {/* Background decorations */}
                <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--purple-1)] opacity-20 rounded-full blur-3xl pointer-events-none' />
                <div className='absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-100 opacity-30 rounded-full blur-3xl pointer-events-none' />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className='w-full max-w-2xl relative z-10'
                >
                    <div className='bg-white/80 backdrop-blur-xl border border-[var(--border-light)] rounded-3xl shadow-2xl overflow-hidden'>
                        {/* Header */}
                        <div className='bg-gradient-to-r from-red-500 to-red-400 p-6 border-b border-red-400/20'>
                            <div className='flex items-center gap-3 mb-2'>
                                <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl'>
                                    🔍
                                </div>
                                <div>
                                    <h1 className='text-2xl font-bold text-white'>404 - Page Not Found</h1>
                                    <p className='text-white/80 text-sm'>The page you're looking for doesn't exist</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className='p-8 space-y-8'>
                            {/* Error message */}
                            <div className='p-4 bg-red-50 border border-red-200 rounded-xl'>
                                <p className='text-sm text-red-800 leading-relaxed'>
                                    The requested resource could not be found. It may have been moved, deleted, or the URL might be incorrect.
                                </p>
                            </div>

                            {/* Quick actions */}
                            <div>
                                <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Quick Actions</h3>
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                    <Link
                                        href='/'
                                        className='group flex items-center justify-between p-4 bg-white border border-[var(--border-light)] hover:border-[var(--purple-4)] hover:bg-[var(--purple-1)]/30 rounded-xl transition-all shadow-sm'
                                    >
                                        <div className='flex items-center gap-3'>
                                            <span className='text-xl'>🏠</span>
                                            <span className='text-sm font-bold text-[var(--fg-4)]'>Home</span>
                                        </div>
                                        <span className='text-[var(--purple-4)] opacity-0 group-hover:opacity-100 transition-opacity'>→</span>
                                    </Link>
                                    <Link
                                        href='/apps'
                                        className='group flex items-center justify-between p-4 bg-white border border-[var(--border-light)] hover:border-[var(--purple-4)] hover:bg-[var(--purple-1)]/30 rounded-xl transition-all shadow-sm'
                                    >
                                        <div className='flex items-center gap-3'>
                                            <span className='text-xl'>🚀</span>
                                            <span className='text-sm font-bold text-[var(--fg-4)]'>Apps</span>
                                        </div>
                                        <span className='text-[var(--purple-4)] opacity-0 group-hover:opacity-100 transition-opacity'>→</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Popular apps */}
                            <div className='pt-6 border-t border-[var(--border-light)]'>
                                <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Popular Apps</h3>
                                <div className='grid grid-cols-1 gap-3'>
                                    {popularApps.map((app, idx) => (
                                        <motion.div
                                            key={app.href}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            <Link
                                                href={app.href}
                                                className='group flex items-center gap-4 p-4 bg-[var(--bg-2)] hover:bg-white border border-transparent hover:border-[var(--purple-4)] rounded-xl transition-all'
                                            >
                                                <div className='w-10 h-10 bg-white border border-[var(--border-light)] rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform'>
                                                    {app.emoji}
                                                </div>
                                                <div className='flex-grow'>
                                                    <div className='text-sm font-bold text-[var(--fg-4)] group-hover:text-[var(--purple-4)] transition-colors'>
                                                        {app.title}
                                                    </div>
                                                    <div className='text-xs text-muted line-clamp-1'>
                                                        {app.subtitle}
                                                    </div>
                                                </div>
                                                <span className='text-[var(--purple-4)] opacity-0 group-hover:opacity-100 transition-opacity'>→</span>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className='px-8 py-4 bg-[var(--bg-2)] border-t border-[var(--border-light)]'>
                            <p className='text-[10px] text-muted text-center uppercase tracking-wider'>
                                Error Code: 404 • Page Not Found
                            </p>
                        </div>
                    </div>
                </motion.div>
            </main>
        </>
    );
}
