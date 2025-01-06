'use client';

import Link from 'next/link';
import { strings } from '../../constants/strings';
import { useState } from 'react';
import crypto from 'crypto';

const HashCard = ({ name, hash }: { name: string; hash: string }) => (
    <div
        className='w-full sm:w-[400px] p-4 rounded-xl backdrop-blur-md shadow-xl
                    border border-white/10 hover:border-white/20 transition-all
                    bg-gradient-to-br from-white/10 via-white/5 to-transparent'
    >
        <div className='text-white/60 font-nunito mb-2'>{name}</div>
        <div className='font-mono text-xs break-all bg-black/20 p-2 rounded-lg text-white/80'>{hash}</div>
    </div>
);

export default function Hash() {
    const [input, setInput] = useState('');

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
        <div className='flex min-h-screen bg-[#1d1d1d]'>
            <header className='absolute top-0 right-0 p-4'>
                <nav className='flex gap-4 text-white/70 font-nunito'>
                    <Link href='/apps'>Apps</Link>
                    <a href={`mailto:${strings.EMAIL}`}>Email</a>
                    <a href={strings.LINKEDIN_URL}>LinkedIn</a>
                    <a href={strings.GITHUB_URL}>GitHub</a>
                </nav>
            </header>

            <main className='flex-1 flex flex-col items-center pt-20 px-4 gap-6'>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder='Enter text to hash'
                    className='w-full max-w-[400px] p-3 rounded-lg bg-white/5 
                             border border-white/10 text-white'
                />
                <div className='grid grid-cols-1 gap-4'>
                    {hashes.map(h => (
                        <HashCard key={h.name} name={h.name} hash={h.value} />
                    ))}
                </div>
            </main>
        </div>
    );
}
