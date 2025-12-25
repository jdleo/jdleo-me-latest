'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import crypto from 'crypto';
import { WebVitals } from '@/components/SEO/WebVitals';

const HashCard = ({ name, hash }: { name: string; hash: string }) => (
    <div className='w-full p-4 rounded-xl border border-[var(--border-light)] bg-white hover:border-[var(--purple-2)] hover:shadow-md transition-all group'>
        <div className='text-[10px] font-bold text-[var(--purple-4)] mb-2 uppercase tracking-widest flex justify-between items-center'>
            <div className='flex items-center gap-2'>
                <div className='w-1.5 h-1.5 rounded-full bg-[var(--purple-4)]' />
                <span>{name}</span>
            </div>
            <button
                onClick={() => navigator.clipboard.writeText(hash)}
                className='text-[9px] text-muted font-bold opacity-0 group-hover:opacity-100 hover:text-[var(--purple-4)] transition-all bg-[var(--bg-2)] px-2 py-1 rounded-md'
            >
                COPY HASH
            </button>
        </div>
        <div className='font-mono text-[11px] break-all text-[var(--fg-4)] leading-relaxed bg-[var(--bg-2)] p-3 rounded-lg border border-transparent group-hover:bg-white group-hover:border-[var(--purple-1)] transition-colors select-all'>
            {hash}
        </div>
    </div>
);

export default function Hash() {
    const [input, setInput] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
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
        <>
            <WebVitals />
            <main className='relative h-screen bg-[#fafbff] overflow-hidden selection:bg-[var(--purple-2)] selection:text-[var(--purple-4)] flex flex-col md:flex-row'>

                {/* Mobile Header */}
                <header className='md:hidden flex items-center justify-between p-4 border-b border-[var(--border-light)] bg-white/80 backdrop-blur-md z-50'>
                    <Link href='/apps' className='text-sm font-bold uppercase tracking-widest text-muted hover:text-[var(--purple-4)]'>
                        ← Apps
                    </Link>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className='px-3 py-1.5 bg-white border border-[var(--border-light)] rounded-full shadow-sm text-xs font-bold uppercase tracking-wider text-[var(--fg-4)] flex items-center gap-1.5'
                    >
                        <span>Algorithms</span>
                        <span className='text-[10px]'>▼</span>
                    </button>
                </header>

                {/* Left Sidebar (Desktop) */}
                <aside className='hidden md:flex flex-col w-80 h-full border-r border-[var(--border-light)] bg-white/50 backdrop-blur-xl z-20'>
                    <div className='p-6 border-b border-[var(--border-light)]'>
                        <div className='flex items-center gap-3 mb-6'>
                            <div className='w-3 h-3 rounded-full bg-[var(--purple-4)]' />
                            <span className='font-bold uppercase tracking-widest text-sm text-[var(--fg-4)]'>Hash Studio</span>
                        </div>
                        <nav className='flex flex-col gap-2'>
                            <Link href='/apps' className='text-xs font-bold uppercase tracking-wider text-muted hover:text-[var(--purple-4)] transition-colors flex items-center gap-2'>
                                <span>←</span> Back to Apps
                            </Link>
                        </nav>
                    </div>

                    <div className='flex-grow overflow-y-auto p-6 space-y-8'>
                        <div>
                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Algorithm Suite</h3>
                            <div className='space-y-2'>
                                {hashes.map(h => (
                                    <div key={h.name} className='flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-2)] transition-colors group cursor-default'>
                                        <div className='w-1.5 h-1.5 rounded-full bg-[var(--line-color)] group-hover:bg-[var(--purple-4)] transition-colors' />
                                        <span className='text-xs font-bold text-[var(--fg-4)] opacity-70 group-hover:opacity-100 transition-opacity'>{h.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='pt-6 border-t border-[var(--border-light)]'>
                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Info</h3>
                            <p className='text-[10px] text-muted leading-relaxed'>
                                Cryptographic hash functions map data of arbitrary size to fixed-size values. They are one-way functions, making it practically impossible to invert.
                            </p>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className='flex-grow flex flex-col h-full relative bg-[#fafbff] overflow-hidden'>
                    {/* Floating decorations */}
                    <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--purple-1)] opacity-30 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2' />

                    <div className='flex-grow overflow-auto p-4 md:p-8 z-10 custom-scrollbar'>
                        <div className='max-w-3xl mx-auto w-full space-y-8 animate-fade-in-up'>

                            {/* Input Section */}
                            <div className='space-y-4'>
                                <div className='flex items-center gap-2'>
                                    <div className='w-2 h-2 rounded-full bg-[var(--purple-4)]' />
                                    <span className='text-[10px] font-bold uppercase tracking-widest text-muted'>Input Payload</span>
                                </div>
                                <div className='relative group'>
                                    <div className='absolute -inset-0.5 bg-gradient-to-r from-[var(--purple-2)] to-blue-200 rounded-2xl opacity-30 group-hover:opacity-50 transition duration-500 blur-sm' />
                                    <textarea
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        placeholder='Enter text to generate hashes...'
                                        className='relative w-full bg-white border border-[var(--border-light)] rounded-xl p-6 font-medium text-sm text-[var(--fg-4)] focus:border-[var(--purple-4)] outline-none resize-none h-32 transition-all placeholder:text-muted/50 shadow-sm'
                                        spellCheck={false}
                                    />
                                </div>
                            </div>

                            {/* Output Section */}
                            <div className='space-y-6'>
                                <div className='flex items-center justify-between border-b border-[var(--border-light)] pb-4'>
                                    <div className='flex items-center gap-2'>
                                        <div className='w-2 h-2 rounded-full bg-blue-400' />
                                        <span className='text-[10px] font-bold uppercase tracking-widest text-muted'>Generated Digests</span>
                                    </div>
                                    <span className='text-[10px] font-mono text-[var(--purple-4)] bg-[var(--purple-1)] px-2 py-0.5 rounded-full'>
                                        LIVE_COMPUTE
                                    </span>
                                </div>

                                <div className='grid gap-4'>
                                    {hashes.map(h => (
                                        <HashCard key={h.name} name={h.name} hash={h.value} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu Overlay */}
                    {isMobileMenuOpen && (
                        <div className='fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 md:hidden' onClick={() => setIsMobileMenuOpen(false)}>
                            <div className='w-full max-w-sm bg-white rounded-2xl shadow-2xl animate-slide-up overflow-hidden border border-[var(--border-light)]' onClick={e => e.stopPropagation()}>
                                <div className='p-4 border-b border-[var(--border-light)] flex justify-between items-center bg-[var(--bg-2)]'>
                                    <span className='text-xs font-bold uppercase tracking-widest text-[var(--fg-4)]'>Algorithm Suite</span>
                                    <button onClick={() => setIsMobileMenuOpen(false)} className='w-6 h-6 rounded-full bg-white border border-[var(--border-light)] flex items-center justify-center text-muted'>✕</button>
                                </div>
                                <div className='p-4 grid grid-cols-2 gap-3'>
                                    {hashes.map(h => (
                                        <div key={h.name} className='flex items-center gap-2 p-3 bg-[var(--bg-2)] rounded-lg border border-[var(--border-light)]'>
                                            <div className='w-1.5 h-1.5 rounded-full bg-[var(--purple-4)]' />
                                            <span className='text-xs font-bold text-[var(--fg-4)]'>{h.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
