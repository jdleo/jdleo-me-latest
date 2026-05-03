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
            <main className={`resend-home resend-blog-home ${isLoaded ? 'is-loaded' : ''}`}>
                <header className='resend-nav-wrap'>
                    <Link href='/' className='resend-logo' aria-label='John Leonardo home'>
                        {strings.NAME}
                    </Link>
                    <nav className='resend-nav' aria-label='Blog navigation'>
                        {notebookLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                target={link.external ? '_blank' : undefined}
                                rel={link.external ? 'noreferrer' : undefined}
                                className='resend-nav-link'
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>
                    <div className='resend-nav-actions'>
                        <a href={strings.LINKEDIN_URL} target='_blank' rel='noreferrer' className='resend-login'>
                            LinkedIn
                        </a>
                        <a href={`mailto:${strings.EMAIL}`} className='resend-top-cta'>
                            Contact
                        </a>
                    </div>
                </header>

                <article className='resend-blog-shell'>
                    <section className='resend-blog-hero'>
                        <h1>Blog</h1>
                        <p>
                            Technical notes, experiments, and longer writeups on AI, distributed systems,
                            product work, and whatever else was worth keeping.
                        </p>
                    </section>

                    {posts.length > 0 ? (
                        <section className='resend-blog-list'>
                            <div className='resend-post-list'>
                                {posts.map((post) => (
                                    <Link key={post.slug} href={`/blog/${post.slug}`} className='resend-post-card'>
                                        <div className='resend-post-meta'>
                                            <span>
                                                <CalendarIcon aria-hidden='true' />
                                                {formatDate(post.date)}
                                            </span>
                                            {viewCounts[post.slug] > 0 && (
                                                <span>
                                                    <EyeIcon aria-hidden='true' />
                                                    {formatNumber(viewCounts[post.slug])} views
                                                </span>
                                            )}
                                        </div>
                                        <h2>{post.title}</h2>
                                        {post.description && <p>{post.description}</p>}
                                        {post.tags.length > 0 && (
                                            <div className='resend-tag-row'>
                                                {post.tags.map((tag) => (
                                                    <span key={tag} className='resend-tag'>
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
                        <section className='resend-blog-empty'>
                            <p>No posts yet.</p>
                        </section>
                    )}

                    <footer className='resend-footer'>
                        <span>© 2026 {strings.NAME}</span>
                        <a href={`mailto:${strings.EMAIL}`}>{strings.EMAIL}</a>
                    </footer>
                </article>
            </main>
        </>
    );
}
