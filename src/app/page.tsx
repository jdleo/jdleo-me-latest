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
            <main className='relative min-h-screen overflow-hidden selection:bg-[var(--purple-2)] selection:text-[var(--purple-4)]'>
                {/* Floating Decorations */}
                <div className='float-decoration float-1' />
                <div className='float-decoration float-2' />

                {/* Header Navigation */}
                <header className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                    <div className='max-w-6xl mx-auto flex justify-end'>
                        <nav className='flex items-center gap-6 md:gap-10'>
                            {[
                                { label: 'Apps', href: '/apps' },
                                { label: 'Blog', href: '/blog' },
                                { label: 'Resume', href: '/apps/resume' },
                            ].map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted hover:text-[var(--purple-4)] transition-all'
                                >
                                    {link.label}
                                </a>
                            ))}
                        </nav>
                    </div>
                </header>

                <div className={`container mx-auto px-6 pt-20 pb-8 transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    {/* Hero Section */}
                    <section className='max-w-4xl mx-auto text-center mb-10'>
                        <h1 className='text-4xl md:text-6xl mb-1'>
                            {strings.NAME}
                        </h1>
                        <p className='text-lg md:text-xl text-muted font-semibold mb-6'>
                            Senior Software Engineer
                        </p>

                        <div className='flex flex-wrap justify-center gap-3'>
                            <a href='/apps' className='btn btn-primary px-6 py-2.5 text-xs'>
                                View Projects
                            </a>
                            <a href={`mailto:${strings.EMAIL}`} className='btn btn-secondary px-6 py-2.5 text-xs'>
                                Contact
                            </a>
                        </div>
                    </section>

                    <div className='grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-6xl mx-auto'>
                        {/* Bio & Social */}
                        <div className='lg:col-span-12 lg:flex lg:flex-row gap-4 mb-4'>
                            <div className='card flex-1'>
                                <h2 className='text-lg mb-3'>About</h2>
                                <p className='text-sm text-muted leading-relaxed mb-4'>
                                    {strings.SUBTITLE}
                                </p>

                                <div className='space-y-3'>
                                    <h3 className='text-[10px] font-bold uppercase tracking-widest text-subtle'>Connect</h3>
                                    <div className='flex flex-wrap gap-2'>
                                        {[
                                            { label: 'GitHub', url: strings.GITHUB_URL, icon: '🐙' },
                                            { label: 'LinkedIn', url: strings.LINKEDIN_URL, icon: '💼' },
                                            { label: 'Email', url: `mailto:${strings.EMAIL}`, icon: '📧' },
                                        ].map((link) => (
                                            <a
                                                key={link.label}
                                                href={link.url}
                                                target='_blank'
                                                className='flex items-center gap-2 p-1.5 px-3 rounded-lg bg-white/40 border border-transparent hover:border-[var(--purple-2)] hover:bg-white transition-all group text-xs'
                                            >
                                                <span className='group-hover:scale-110 transition-transform'>{link.icon}</span>
                                                <span className='font-semibold'>{link.label}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className='lg:w-1/3 flex flex-col gap-4 mt-4 lg:mt-0'>
                                {/* Mentorship Section */}
                                <div className='card bg-gradient-to-br from-white/60 to-[var(--purple-1)]/40 border-[var(--purple-a2)] flex-1'>
                                    <h2 className='text-base font-bold mb-2 flex items-center gap-2'>
                                        <span>🤝</span> Mentorship
                                    </h2>
                                    <p className='text-[11px] text-muted leading-relaxed mb-3'>
                                        Talk about career, guidance, or just chat via:
                                    </p>
                                    <a
                                        href='https://calendly.com/jleonardo-roblox'
                                        target='_blank'
                                        className='btn btn-secondary w-full py-2 text-[10px] font-bold border-[var(--purple-2)]'
                                    >
                                        Schedule Call
                                    </a>
                                </div>

                                {/* Visitor Count Card */}
                                <div className='card-visitor p-4 rounded-2xl flex flex-col items-center justify-center text-center'>
                                    <span className='text-[9px] font-bold text-[var(--purple-4)] uppercase tracking-[0.2em] mb-1 opacity-70'>Visitors</span>
                                    <div className='flex items-baseline gap-1'>
                                        <span className='text-3xl font-black gradient-text tracking-tighter'>{formatNumber(pageViewCount)}</span>
                                        <span className='text-[10px] font-bold text-muted uppercase'>views</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Writing & Navigation */}
                        <div className='lg:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-4'>
                            {/* Latest blog post */}
                            {latestPost && (
                                <div className='card'>
                                    <div className='flex items-center justify-between mb-3'>
                                        <h2 className='text-lg text-[#181925]'>Writing</h2>
                                        <a href='/blog' className='text-[10px] font-bold text-[var(--purple-4)] hover:text-[var(--blue-4)] transition-colors'>
                                            Archive →
                                        </a>
                                    </div>
                                    <a
                                        href={`/blog/${latestPost.slug}`}
                                        className='block group'
                                    >
                                        <h3 className='text-base font-bold mb-1 group-hover:text-[var(--purple-4)] transition-colors'>
                                            {latestPost.title}
                                        </h3>
                                        <p className='text-xs text-muted line-clamp-2'>
                                            {latestPost.description}
                                        </p>
                                    </a>
                                </div>
                            )}

                            <div className='grid grid-cols-2 gap-4'>
                                <div className='card p-4 flex flex-col justify-between overflow-hidden relative'>
                                    <div className='relative z-10'>
                                        <h3 className='text-[10px] font-bold uppercase tracking-widest text-subtle mb-0.5'>Location</h3>
                                        <p className='text-sm font-bold'>SF Bay Area</p>
                                    </div>
                                    <div className='absolute -bottom-3 -right-3 text-5xl opacity-10 rotate-12 select-none'>🌉</div>
                                </div>
                                <div className='card p-4 flex flex-col justify-between overflow-hidden relative text-white bg-gradient-to-br from-[#181925] to-[#2a2d40] border-none shadow-xl'>
                                    <div className='relative z-10'>
                                        <h3 className='text-[10px] font-bold uppercase tracking-widest text-white/50 mb-0.5'>Currently</h3>
                                        <p className='text-sm font-bold'>Senior @ Roblox</p>
                                    </div>
                                    <div className='absolute -bottom-3 -right-3 text-5xl opacity-10 rotate-12 select-none'>🤖</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className='py-8 text-center text-muted'>
                    <p className='text-[10px] font-bold uppercase tracking-[0.4em] opacity-30'>
                        © 2026 {strings.NAME}
                    </p>
                </footer>
            </main>
        </>
    );
}
