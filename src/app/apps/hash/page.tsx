'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import crypto from 'crypto';
import { WebVitals } from '@/components/SEO/WebVitals';

const HashCard = ({ name, hash }: { name: string; hash: string }) => (
    <div className='w-full p-4 rounded border border-[var(--color-border)] bg-black/40 hover:border-[var(--color-accent)]/30 transition-all group'>
        <div className='text-[10px] font-mono text-[var(--color-accent)] opacity-60 mb-2 uppercase tracking-widest flex justify-between'>
            <span>{name}</span>
            <button
                onClick={() => navigator.clipboard.writeText(hash)}
                className='opacity-0 group-hover:opacity-100 hover:text-white transition-opacity'
            >
                [COPY]
            </button>
        </div>
        <div className='font-mono text-[11px] break-all text-[var(--color-text-dim)] leading-relaxed selection:bg-[var(--color-accent)] selection:text-black'>
            {hash}
        </div>
    </div>
);

export default function Hash() {
    const [input, setInput] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);

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
            <main className='min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4 md:p-8 selection:bg-[var(--color-accent)] selection:text-[var(--color-bg)]'>
                <div className='fixed inset-0 overflow-hidden pointer-events-none'>
                    <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(62,175,124,0.03),transparent_60%)]' />
                </div>

                <div className={`w-full max-w-6xl h-[85vh] transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className='terminal-window flex flex-col h-full'>
                        <div className='terminal-header'>
                            <div className='terminal-controls'>
                                <div className='terminal-control red' />
                                <div className='terminal-control yellow' />
                                <div className='terminal-control green' />
                            </div>
                            <div className='terminal-title'>johnleonardo — ~/cryptography-lab</div>
                        </div>

                        <div className='terminal-split flex-grow overflow-hidden'>
                            {/* Left Sidebar: Algorithms & Info */}
                            <div className='terminal-pane border-r border-[var(--color-border)] hidden md:flex flex-col gap-8'>
                                <div>
                                    <div className='flex items-center gap-2 mb-6 text-[var(--color-accent)]'>
                                        <span className='terminal-prompt'>➜</span>
                                        <span className='text-sm uppercase tracking-widest font-bold'>Suite</span>
                                    </div>
                                    <nav className='flex flex-col gap-4 mb-10'>
                                        <Link href='/' className='text-lg hover:text-[var(--color-accent)] transition-colors'>~/home</Link>
                                        <Link href='/apps' className='text-lg hover:text-[var(--color-accent)] transition-colors'>~/apps</Link>
                                    </nav>

                                    <div className='space-y-6 font-mono'>
                                        <div>
                                            <span className='text-[var(--color-text)] opacity-40 text-[10px] uppercase tracking-widest block mb-4'>$ ls --algorithms</span>
                                            <div className='space-y-2 opacity-60'>
                                                {hashes.map(h => (
                                                    <div key={h.name} className='text-[10px] flex items-center gap-2'>
                                                        <span className='text-[var(--color-accent)]'>•</span> {h.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className='pt-6 border-t border-[var(--color-border)]'>
                                            <span className='text-[var(--color-text)] opacity-40 text-[10px] uppercase tracking-widest block mb-4'>$ info --crypt</span>
                                            <p className='text-[10px] text-[var(--color-text-dim)] leading-relaxed italic uppercase'>
                                                "One-way trapdoor functions converting arbitrary payloads into fixed-length hex digests."
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Display: Input & Output */}
                            <div className='terminal-pane bg-black/40 flex flex-col p-8 overflow-y-auto w-full'>
                                <div className='max-w-2xl mx-auto w-full space-y-8'>
                                    <div className='space-y-4'>
                                        <div className='flex items-center gap-2 text-[var(--color-accent)]'>
                                            <span className='terminal-prompt'>$</span>
                                            <span className='text-[10px] uppercase tracking-widest opacity-60'>Entry_Point</span>
                                        </div>
                                        <textarea
                                            value={input}
                                            onChange={e => setInput(e.target.value)}
                                            placeholder='ENTER_PAYLOAD_HERE...'
                                            className='w-full bg-black/40 border border-[var(--color-border)] rounded-lg p-6 font-mono text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none resize-none h-32 scrollbar-hide'
                                            spellCheck={false}
                                        />
                                    </div>

                                    <div className='space-y-6 pb-12'>
                                        <div className='flex items-center gap-4 opacity-40'>
                                            <div className='h-[1px] flex-grow bg-[var(--color-border)]' />
                                            <span className='text-[10px] font-mono uppercase tracking-widest flex items-center gap-2'>
                                                <span className='animate-pulse text-[var(--color-accent)]'>●</span> Digests_Calculated
                                            </span>
                                            <div className='h-[1px] flex-grow bg-[var(--color-border)]' />
                                        </div>

                                        <div className='grid gap-4'>
                                            {hashes.map(h => (
                                                <HashCard key={h.name} name={h.name} hash={h.value} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Console decoration */}
                    <div className='mt-4 flex items-center justify-between text-[10px] font-mono text-[var(--color-text-dim)] opacity-40 uppercase tracking-[0.2em] px-4'>
                        <div className='flex gap-6'>
                            <span>Lib: Crypto_v3</span>
                            <span>CPU: 0.1%</span>
                        </div>
                        <span>Status: hashes_synchronized</span>
                    </div>
                </div>
            </main>
        </>
    );
}
