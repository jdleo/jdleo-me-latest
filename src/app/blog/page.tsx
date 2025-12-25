'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllBlogPosts } from '@/blog/registry';
import { WebVitals } from '@/components/SEO/WebVitals';
import { strings } from '../constants/strings';

async function getAllBlogViewCounts(): Promise<Record<string, number>> {
    try {
        const response = await fetch('/api/blog-views', { cache: 'no-store' });
        if (!response.ok) return {};
        const data = await response.json();
        if (data.success && data.views) {
            return data.views.reduce((acc: Record<string, number>, view: { slug: string; view_count: number }) => {
                acc[view.slug] = view.view_count;
                return acc;
            }, {});
        }
        return {};
    } catch (error) {
        console.error('Error fetching view counts:', error);
        return {};
    }
}

export default function BlogPage() {
    const posts = getAllBlogPosts();
    const [isLoaded, setIsLoaded] = useState(false);
    const [viewCounts, setViewCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchViewCounts = async () => {
            const counts = await getAllBlogViewCounts();
            setViewCounts(counts);
        };
        fetchViewCounts();
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Format number helper
    const formatNumber = (num: number) => {
        return num.toLocaleString('en-US');
    };

    return (
        <>
            <WebVitals />
            <main className='relative min-h-screen overflow-hidden selection:bg-[var(--purple-2)] selection:text-[var(--purple-4)]'>
                {/* Floating Decorations */}
                <div className='float-decoration float-1' />
                <div className='float-decoration float-2' />

                {/* Header Navigation */}
                <header className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                    <div className='max-w-6xl mx-auto flex justify-between items-center'>
                        <Link href='/' className='text-sm font-bold uppercase tracking-widest text-[var(--fg-4)] hover:text-[var(--purple-4)] transition-colors'>
                            {strings.NAME}
                        </Link>
                        <nav className='flex items-center gap-6 md:gap-10'>
                            {[
                                { label: 'Apps', href: '/apps' },
                                { label: 'Blog', href: '/blog' },
                                { label: 'Resume', href: '/apps/resume' },
                            ].map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${link.href === '/blog' ? 'text-[var(--purple-4)]' : 'text-muted hover:text-[var(--purple-4)]'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </header>

                <div className={`container mx-auto px-6 pt-32 pb-20 transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

                    {/* Header Section */}
                    <div className='max-w-4xl mx-auto mb-16 text-center'>
                        <h1 className='text-4xl md:text-5xl font-bold mb-4 text-[var(--fg-4)]'>
                            Thoughts & Notes
                        </h1>
                        <p className='text-lg text-muted max-w-2xl mx-auto'>
                            Exploring distributed systems, AI engineering, and interface design.
                        </p>
                    </div>

                    {/* Blog Grid */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto'>
                        {posts.map((post) => (
                            <Link
                                key={post.slug}
                                href={`/blog/${post.slug}`}
                                className='group'
                            >
                                <div className='card h-full p-8 hover:border-[var(--purple-2)] hover:shadow-lg transition-all duration-300 flex flex-col'>
                                    <div className='flex items-center justify-between mb-4'>
                                        <div className='flex items-center gap-2'>
                                            <span className='px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--purple-1)] text-[var(--purple-4)]'>
                                                Article
                                            </span>
                                            <span className='text-[10px] text-muted font-bold uppercase tracking-wider'>
                                                {post.date}
                                            </span>
                                        </div>
                                        {viewCounts[post.slug] > 0 && (
                                            <div className='flex items-center gap-1 text-[10px] font-bold text-muted'>
                                                <span>{formatNumber(viewCounts[post.slug])}</span>
                                                <span>views</span>
                                            </div>
                                        )}
                                    </div>

                                    <h2 className='text-2xl font-bold mb-4 group-hover:text-[var(--purple-4)] transition-colors'>
                                        {post.title}
                                    </h2>

                                    <p className='text-muted leading-relaxed mb-6 flex-grow'>
                                        {post.description}
                                    </p>

                                    <div className='flex flex-wrap gap-2 mt-auto'>
                                        {post.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className='text-[10px] font-bold uppercase tracking-wider text-muted opacity-60 group-hover:opacity-100 transition-opacity'
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {posts.length === 0 && (
                            <div className='col-span-full text-center py-20'>
                                <div className='text-6xl mb-4'>📭</div>
                                <h3 className='text-xl font-bold mb-2'>No posts found</h3>
                                <p className='text-muted'>Check back soon for new content.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <footer className='py-20 text-center text-muted border-t border-[var(--border-light)] mt-20 max-w-4xl mx-auto'>
                        <p className='text-[10px] font-bold uppercase tracking-[0.4em] opacity-30'>
                            © 2026 {strings.NAME}
                        </p>
                    </footer>
                </div>
            </main>
        </>
    );
}
