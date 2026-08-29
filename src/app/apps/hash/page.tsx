'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { strings } from '../../constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import md5 from 'crypto-js/md5';
import ripemd160 from 'crypto-js/ripemd160';
import sha224 from 'crypto-js/sha224';
import { LockClosedIcon, ClipboardIcon, CheckIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const toHex = (buf: ArrayBuffer): string =>
    [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');

export default function Hash() {
    const [input, setInput] = useState('');
    const [hashes, setHashes] = useState<{ name: string; value: string }[]>([]);
    const [copied, setCopied] = useState<string | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        const compute = async () => {
            const text = input;
            const enc = new TextEncoder().encode(text);

            const [sha1, sha256, sha384, sha512] = await Promise.all([
                crypto.subtle.digest('SHA-1', enc),
                crypto.subtle.digest('SHA-256', enc),
                crypto.subtle.digest('SHA-384', enc),
                crypto.subtle.digest('SHA-512', enc),
            ]);
            // note: SubtleCrypto has no SHA-224, hence crypto-js

            setHashes([
                { name: 'MD5', value: md5(text).toString() },
                { name: 'SHA1', value: toHex(sha1) },
                { name: 'SHA256', value: toHex(sha256) },
                { name: 'SHA512', value: toHex(sha512) },
                { name: 'RIPEMD160', value: ripemd160(text).toString() },
                { name: 'SHA384', value: toHex(sha384) },
                { name: 'SHA224', value: sha224(text).toString() },
            ]);
        };

        // debounce: hashing never runs mid-typing, so the UI never jams
        debounceRef.current = setTimeout(compute, 150);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [input]);

    const copyToClipboard = (text: string, name: string) => {
        navigator.clipboard.writeText(text);
        setCopied(name);
        setTimeout(() => setCopied(null), 1500);
    };

    return (
        <>
            <WebVitals />
            <main className='el-page'>
                <header className='el-nav'>
                    <Link href='/' className='el-logo' aria-label='John Leonardo home'>
                        John Leonardo
                    </Link>
                    <nav className='el-nav-links' aria-label='Primary navigation'>
                        <Link href='/apps' className='el-nav-link'>Apps</Link>
                        <Link href='/blog' className='el-nav-link'>Blog</Link>
                        <Link href='/apps/resume' className='el-nav-link'>Resume</Link>
                    </nav>
                    <div className='el-nav-actions'>
                        <Link href='/apps/chat' className='el-nav-link'>Chat</Link>
                        <Link href={`mailto:${strings.EMAIL}`} className='el-btn el-btn-dark el-btn-sm'>
                            Contact
                        </Link>
                    </div>
                </header>

                <section className='el-hero el-hero-page'>
                    <div className='el-hero-inner'>
                        <div className='el-hero-copy'>
                            <h1>Hash Lab</h1>
                            <p className='el-hero-sub'>
                                Generate cryptographic hashes in real-time using multiple algorithms.
                            </p>
                        </div>
                    </div>
                </section>

                <section className='el-section el-sentiment'>
                    <div className='el-chart-block'>
                        <div className='el-chart-title'>
                            <span className='el-chart-title-label'>
                                <LockClosedIcon aria-hidden='true' />
                                Input
                            </span>
                        </div>
                        <div className='el-file-card'>
                            <textarea
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder='Enter text to generate hashes...'
                                className='el-textarea'
                                rows={5}
                            />
                        </div>
                    </div>

                    <div className='el-chart-block'>
                        <div className='el-chart-title'>
                            <span className='el-chart-title-label'>
                                <DocumentTextIcon aria-hidden='true' />
                                Generated Digests
                            </span>
                            <span className='el-chart-pill'>live compute</span>
                        </div>
                        <div className='el-hash-list'>
                            {hashes.map(h => (
                                <div key={h.name} className='el-file-card el-hash-row'>
                                    <div className='el-hash-row-head'>
                                        <span className='el-hash-name'>{h.name}</span>
                                        <button
                                            onClick={() => copyToClipboard(h.value, h.name)}
                                            className='el-btn el-btn-light el-btn-sm'
                                        >
                                            <ClipboardIcon aria-hidden='true' />
                                            {copied === h.name ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>
                                    <div className='el-hash-output'>{h.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className='el-hash-note'>
                        Cryptographic hash functions map data of arbitrary size to fixed-size values.
                        They are one-way functions, making it practically impossible to invert. These are
                        commonly used for data integrity verification, password storage, and digital signatures.
                    </p>
                </section>

                <footer className='el-footer'>
                    <div className='el-footer-inner'>
                        <span className='el-footer-logo'>John Leonardo</span>
                        <div className='el-footer-links'>
                            <a href={strings.GITHUB_URL} target='_blank' rel='noreferrer'>GitHub</a>
                            <a href={strings.LINKEDIN_URL} target='_blank' rel='noreferrer'>LinkedIn</a>
                            <a href={`mailto:${strings.EMAIL}`}>{strings.EMAIL}</a>
                        </div>
                        <span className='el-footer-copy'>© 2026. All rights reserved.</span>
                    </div>
                </footer>
            </main>
        </>
    );
}
