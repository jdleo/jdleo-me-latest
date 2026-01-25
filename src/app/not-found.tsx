'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apps } from './constants/apps';
import { WebVitals } from '@/components/SEO/WebVitals';
import { HomeIcon, RocketLaunchIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

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
            <main className='notion-page' style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                <div className={`notion-content ${isLoaded ? 'loaded' : ''}`} style={{ maxWidth: '600px', textAlign: 'center' }}>
                    {/* Icon */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ width: '80px', height: '80px', margin: '0 auto', background: 'rgba(220, 38, 38, 0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MagnifyingGlassIcon style={{ width: '40px', height: '40px', color: 'rgb(220, 38, 38)', strokeWidth: 2 }} />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className='notion-title' style={{ marginBottom: '12px' }}>404 - Page Not Found</h1>
                    <div className='notion-subtitle' style={{ marginBottom: '32px' }}>
                        The page you're looking for doesn't exist or has been moved
                    </div>

                    {/* Divider */}
                    <div className='notion-divider' />

                    {/* Quick Links */}
                    <div style={{ marginTop: '32px', marginBottom: '32px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
                            Quick Navigation
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                            <Link href='/' className='notion-link-item'>
                                <HomeIcon className='notion-link-icon' />
                                <span className='notion-link-label'>Home</span>
                            </Link>
                            <Link href='/apps' className='notion-link-item'>
                                <RocketLaunchIcon className='notion-link-icon' />
                                <span className='notion-link-label'>Apps</span>
                            </Link>
                        </div>
                    </div>

                    {/* Popular Apps */}
                    {popularApps.length > 0 && (
                        <>
                            <div className='notion-divider' />
                            <div style={{ marginTop: '32px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
                                    Popular Apps
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {popularApps.map((app, idx) => (
                                        <Link
                                            key={app.href}
                                            href={app.href}
                                            className='notion-app-item'
                                            style={{ animationDelay: `${idx * 50}ms` }}
                                        >
                                            <div className='notion-app-icon-wrapper' style={{ width: '36px', height: '36px' }}>
                                                <span style={{ fontSize: '20px' }}>{app.emoji}</span>
                                            </div>
                                            <div className='notion-app-info'>
                                                <div className='notion-app-name'>{app.title}</div>
                                                <div className='notion-app-desc'>{app.subtitle}</div>
                                            </div>
                                            <div className='notion-app-arrow'>→</div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Footer */}
                    <footer className='notion-footer' style={{ marginTop: '48px' }}>
                        Error 404 • Page Not Found
                    </footer>
                </div>
            </main>
        </>
    );
}
