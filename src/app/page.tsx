'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { strings } from './constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import { getAllBlogPosts, BlogPost } from '@/blog/registry';

export default function Home() {
    const [pageViewCount, setPageViewCount] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [latestPost, setLatestPost] = useState<BlogPost | null>(null);

    // Helper function to format numbers with commas
    const formatNumber = (num: number | string) => {
        const number = Number(num) || 0;
        return number.toLocaleString('en-US');
    };

    useEffect(() => {
        // Small delay for smoother loading animation
        const timer = setTimeout(() => setIsLoaded(true), 100);

        // Fetch page view count
        axios
            .get('/api/view')
            .then(res => {
                const views = Number(res.data.views) || 0;
                setPageViewCount(views);
            })
            .catch(error => {
                console.error('Failed to fetch view count:', error);
                setPageViewCount(0);
            });

        // Fetch latest blog post
        const posts = getAllBlogPosts();
        if (posts.length > 0) {
            setLatestPost(posts[0]);
        }

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <WebVitals />
            <main className='min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4 md:p-8 selection:bg-[var(--color-accent)] selection:text-[var(--color-bg)]'>
                {/* Background Grid/Glow */}
                <div className='fixed inset-0 overflow-hidden pointer-events-none'>
                    <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(62,175,124,0.05),transparent_50%)]' />
                    <div className='absolute inset-0' style={{
                        backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
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
                            <div className='terminal-title'>johnleonardo — ~/home</div>
                        </div>

                        {/* Terminal Body with Split Screen */}
                        <div className='terminal-split terminal-split-equal'>
                            {/* Left Pane: Identity & Bio */}
                            <div className='terminal-pane'>
                                <div className='mb-8'>
                                    <div className='flex items-center gap-2 mb-4 text-[var(--color-accent)]'>
                                        <span className='terminal-prompt'>➜</span>
                                        <span className='text-sm uppercase tracking-widest font-bold'>Whoami</span>
                                    </div>
                                    <h1 className='text-4xl md:text-5xl font-bold mb-4 tracking-tight text-[var(--color-text)]'>
                                        {strings.NAME}
                                    </h1>
                                    <p className='text-[var(--color-accent-blue)] text-lg mb-6'>
                                        Senior Software Engineer
                                    </p>
                                </div>

                                <div className='space-y-6 text-[var(--color-text-dim)] leading-relaxed'>
                                    <div className='font-mono'>
                                        <span className='text-[var(--color-text)] opacity-70'>$ cat bio.txt</span>
                                        <div className='mt-2 border-l-2 border-[var(--color-border)] pl-4 italic'>
                                            {strings.SUBTITLE}
                                        </div>
                                    </div>

                                    <div className='pt-4'>
                                        <div className='flex items-center gap-2 mb-4'>
                                            <span className='terminal-prompt'>$</span>
                                            <span className='text-[var(--color-text)] opacity-70'>ls social/</span>
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            {[
                                                { label: 'github', url: strings.GITHUB_URL },
                                                { label: 'linkedin', url: strings.LINKEDIN_URL },
                                                { label: 'email', url: `mailto:${strings.EMAIL}` },
                                                { label: 'calendly', url: 'https://calendly.com/jleonardo-roblox' },
                                            ].map((link) => (
                                                <a
                                                    key={link.label}
                                                    href={link.url}
                                                    target='_blank'
                                                    className='flex items-center gap-2 hover:text-[var(--color-accent)] transition-all group'
                                                >
                                                    <span className='text-[var(--color-text-dim)] group-hover:translate-x-1 transition-transform'>└──</span> {link.label}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Pane: Navigation & Content */}
                            <div className='terminal-pane bg-[rgba(0,0,0,0.2)]'>
                                {/* Navigation */}
                                <div className='mb-12'>
                                    <div className='flex items-center gap-2 mb-6 text-[var(--color-accent)]'>
                                        <span className='terminal-prompt'>➜</span>
                                        <span className='text-sm uppercase tracking-widest font-bold'>Navigation</span>
                                    </div>
                                    <nav className='flex flex-col gap-4'>
                                        {[
                                            { label: 'Apps', href: '/apps' },
                                            { label: 'Blog', href: '/blog' },
                                            { label: 'Resume', href: '/apps/resume' },
                                        ].map((nav) => (
                                            <a
                                                key={nav.label}
                                                href={nav.href}
                                                className='text-2xl hover:translate-x-3 transition-all inline-flex items-center gap-3 group whitespace-nowrap'
                                            >
                                                <span className='text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity'>&gt;</span>
                                                <span className='group-hover:text-[var(--color-accent)] transition-colors'>{nav.label}</span>
                                            </a>
                                        ))}
                                    </nav>
                                </div>

                                {/* Latest Post */}
                                {latestPost && (
                                    <div className='mb-12'>
                                        <div className='flex items-center gap-2 mb-4 text-[var(--color-accent)]'>
                                            <span className='terminal-prompt'>➜</span>
                                            <span className='text-sm uppercase tracking-widest font-bold'>Latest_Post</span>
                                        </div>
                                        <a
                                            href={`/blog/${latestPost.slug}`}
                                            className='block p-6 border border-[var(--color-border)] rounded-lg hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 transition-all group'
                                        >
                                            <h3 className='text-xl font-bold mb-2 group-hover:text-[var(--color-accent)] transition-colors'>
                                                {latestPost.title}
                                            </h3>
                                            <p className='text-sm text-[var(--color-text-dim)] line-clamp-2'>
                                                {latestPost.description}
                                            </p>
                                        </a>
                                    </div>
                                )}

                                {/* System Stats */}
                                <div className='mt-auto pt-8 border-t border-[var(--color-border)]'>
                                    <div className='flex items-center justify-between text-xs font-mono text-[var(--color-text-dim)]'>
                                        <div className='flex gap-6'>
                                            <div className='flex items-center gap-2 px-2 py-0.5 bg-[var(--color-accent)]/5 rounded border border-[var(--color-accent)]/10'>
                                                <span className='opacity-50'>VIEWS:</span>
                                                <span className='text-[var(--color-accent)] font-bold shadow-[0_0_10px_rgba(62,175,124,0.3)]'>{formatNumber(pageViewCount)}</span>
                                                <div className='w-1 h-1 rounded-full bg-[var(--color-accent)] animate-pulse' />
                                            </div>
                                            <span className='flex items-center'>STATUS: ONLINE</span>
                                        </div>
                                        <div>
                                            LOC: BAY AREA, CA, US, EARTH
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Blinking Cursor at bottom of window (simulated) */}
                    <div className='mt-4 flex items-center gap-2 text-[var(--color-text-dim)] text-sm px-2'>
                        <span className='text-[var(--color-accent)]'>$</span>
                        <span>waiting for input...</span>
                        <span className='terminal-cursor' />
                    </div>
                </div>
            </main>
        </>
    );
}
