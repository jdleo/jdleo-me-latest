'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import crypto from 'crypto';
import { strings } from '../../constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import {
    DevicePhoneMobileIcon,
    PencilSquareIcon,
    DocumentTextIcon,
    LockClosedIcon,
    ClipboardIcon,
} from '@heroicons/react/24/outline';

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

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <>
            <WebVitals />
            <main className='notion-page'>
                <header className={`notion-header ${isLoaded ? 'loaded' : ''}`}>
                    <div className='notion-nav' style={{ justifyContent: 'space-between', maxWidth: '1100px' }}>
                        <Link href='/' className='notion-nav-link' style={{ fontWeight: 600 }}>
                            {strings.NAME}
                        </Link>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Link href='/apps' className='notion-nav-link'>
                                <DevicePhoneMobileIcon className='notion-nav-icon' />
                                Apps
                            </Link>
                            <Link href='/blog' className='notion-nav-link'>
                                <PencilSquareIcon className='notion-nav-icon' />
                                Blog
                            </Link>
                            <Link href='/apps/resume' className='notion-nav-link'>
                                <DocumentTextIcon className='notion-nav-icon' />
                                Resume
                            </Link>
                        </div>
                    </div>
                </header>

                <div className={`notion-content ${isLoaded ? 'loaded' : ''}`} style={{ maxWidth: '900px' }}>
                    <div className='notion-title-block'>
                        <h1 className='notion-title'>Hash Lab</h1>
                        <div className='notion-subtitle'>Generate cryptographic hashes in real-time using multiple algorithms</div>
                    </div>

                    <div className='notion-divider' />

                    <div className='notion-section'>
                        <div className='notion-section-title'>
                            <LockClosedIcon className='notion-section-icon' />
                            Input
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <textarea
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder='Enter text to generate hashes...'
                                className='notion-textarea'
                                style={{ height: '120px' }}
                            />
                        </div>
                    </div>

                    <div className='notion-divider' />

                    <div className='notion-section'>
                        <div className='notion-section-title'>
                            <DocumentTextIcon className='notion-section-icon' />
                            Generated Digests
                            <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 600, color: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '4px 8px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Live Compute
                            </span>
                        </div>
                        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {hashes.map(h => (
                                <div key={h.name} className='notion-card' style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#6366f1' }} />
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h.name}</span>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(h.value)}
                                            className='notion-action-btn'
                                            style={{ padding: '4px 8px', fontSize: '10px' }}
                                        >
                                            <ClipboardIcon style={{ width: '12px', height: '12px' }} />
                                            Copy
                                        </button>
                                    </div>
                                    <div style={{
                                        fontFamily: 'monospace',
                                        fontSize: '12px',
                                        wordBreak: 'break-all',
                                        color: '#37352f',
                                        backgroundColor: 'rgba(55, 53, 47, 0.04)',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        lineHeight: 1.6
                                    }}>
                                        {h.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='notion-divider' />

                    <div className='notion-section'>
                        <p style={{ fontSize: '13px', color: 'rgba(55, 53, 47, 0.6)', lineHeight: 1.7 }}>
                            Cryptographic hash functions map data of arbitrary size to fixed-size values. They are one-way functions, making it practically impossible to invert. These are commonly used for data integrity verification, password storage, and digital signatures.
                        </p>
                    </div>

                    <footer className='notion-footer'>
                        © 2026 {strings.NAME}
                    </footer>
                </div>
            </main>
        </>
    );
}
