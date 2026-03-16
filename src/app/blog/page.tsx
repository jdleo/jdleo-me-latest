'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarIcon, EyeIcon } from '@heroicons/react/24/outline';
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

const notebookLinks = [
    { label: 'Home', href: '/' },
    { label: 'Apps', href: '/apps' },
    { label: 'Resume', href: '/apps/resume' },
    { label: 'GitHub', href: strings.GITHUB_URL, external: true },
];

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
        const timer = setTimeout(() => setIsLoaded(true), 80);
        return () => clearTimeout(timer);
    }, []);

    const formatNumber = (num: number) => num.toLocaleString('en-US');
    const formatDate = (date: string) =>
        new Intl.DateTimeFormat('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        }).format(new Date(date));

    return (
        <>
            <WebVitals />
            <main className='obsidian-home obsidian-home-blog'>
                <div className='obsidian-orb obsidian-orb-left' />
                <div className='obsidian-orb obsidian-orb-right' />

                <article className={`obsidian-sheet ${isLoaded ? 'is-loaded' : ''}`}>
                    <header className='obsidian-topbar'>
                        <Link href='/' className='obsidian-wordmark'>
                            {strings.NAME}
                        </Link>
                        <nav className='obsidian-nav' aria-label='Blog navigation'>
                            {notebookLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    target={link.external ? '_blank' : undefined}
                                    rel={link.external ? 'noreferrer' : undefined}
                                    className='obsidian-nav-link'
                                >
                                    {link.label}
                                </a>
                            ))}
                        </nav>
                    </header>

                    <section className='obsidian-intro obsidian-intro-blog'>
                        <h1 className='obsidian-title'>Blog</h1>
                        <p className='obsidian-lede obsidian-lede-blog'>
                            Technical notes, experiments, and longer writeups on AI, distributed systems,
                            product work, and whatever else was worth keeping.
                        </p>
                    </section>

                    {posts.length > 0 ? (
                        <section className='obsidian-section obsidian-section-blog-list'>
                            <div className='obsidian-post-list'>
                                {posts.map((post) => (
                                    <Link key={post.slug} href={`/blog/${post.slug}`} className='obsidian-post-card'>
                                        <div className='obsidian-entry-header'>
                                            <span className='obsidian-post-meta-item'>
                                                <CalendarIcon className='obsidian-entry-icon' />
                                                {formatDate(post.date)}
                                            </span>
                                            {viewCounts[post.slug] > 0 && (
                                                <span className='obsidian-post-meta-item'>
                                                    <EyeIcon className='obsidian-entry-icon' />
                                                    {formatNumber(viewCounts[post.slug])} views
                                                </span>
                                            )}
                                        </div>
                                        <h2>{post.title}</h2>
                                        {post.description && <p>{post.description}</p>}
                                        {post.tags.length > 0 && (
                                            <div className='obsidian-tag-row'>
                                                {post.tags.map((tag) => (
                                                    <span key={tag} className='obsidian-tag'>
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ) : (
                        <section className='obsidian-section'>
                            <p>No posts yet.</p>
                        </section>
                    )}

                    <footer className='obsidian-footer'>© 2026 {strings.NAME}</footer>
                </article>
            </main>
        </>
    );
}
