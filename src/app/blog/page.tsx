'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRightIcon, EyeIcon } from '@heroicons/react/24/outline';
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

const navLinks = [
    { label: 'Apps', href: '/apps' },
    { label: 'Resume', href: '/apps/resume' },
    { label: 'GitHub', href: strings.GITHUB_URL, external: true },
];

export default function BlogPage() {
    const posts = getAllBlogPosts();
    const [viewCounts, setViewCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        getAllBlogViewCounts().then(setViewCounts);
    }, []);

    const formatNumber = (num: number) => num.toLocaleString('en-US');
    const formatDate = (date: string) =>
        new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC',
        }).format(new Date(date));

    return (
        <>
            <WebVitals />
            <main className='el-page'>
                <header className='el-nav'>
                    <Link href='/' className='el-logo' aria-label='John Leonardo home'>
                        John Leonardo
                    </Link>
                    <nav className='el-nav-links' aria-label='Blog navigation'>
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                target={link.external ? '_blank' : undefined}
                                rel={link.external ? 'noreferrer' : undefined}
                                className='el-nav-link'
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>
                    <div className='el-nav-actions'>
                        <a href={strings.LINKEDIN_URL} target='_blank' rel='noreferrer' className='el-nav-link'>
                            LinkedIn
                        </a>
                        <a href={`mailto:${strings.EMAIL}`} className='el-btn el-btn-dark el-btn-sm'>
                            Contact
                        </a>
                    </div>
                </header>

                <section className='el-hero el-hero-page'>
                    <div className='el-hero-inner'>
                        <div className='el-hero-copy'>
                            <h1>Blog</h1>
                            <p className='el-hero-sub'>
                                Technical notes, experiments, and longer writeups on AI, distributed systems,
                                product work, and whatever else was worth keeping.
                            </p>
                        </div>
                    </div>
                </section>

                <section className='el-section el-blog-list' aria-label='Blog posts'>
                    {posts.length > 0 ? (
                        <ul className='el-list'>
                            {posts.map((post) => (
                                <li key={post.slug}>
                                    <Link href={`/blog/${post.slug}`} className='el-row el-post-row'>
                                        <div className='el-post-main'>
                                            <div className='el-post-meta'>
                                                <span>{formatDate(post.date)}</span>
                                                {viewCounts[post.slug] > 0 && (
                                                    <span className='el-meta-views'>
                                                        <EyeIcon aria-hidden='true' />
                                                        {formatNumber(viewCounts[post.slug])} views
                                                    </span>
                                                )}
                                            </div>
                                            <h2>{post.title}</h2>
                                            {post.description && <p>{post.description}</p>}
                                        </div>
                                        <span className='el-arrow' aria-hidden='true'>
                                            <ArrowUpRightIcon />
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className='el-blog-empty'>No posts yet.</p>
                    )}
                </section>

                <footer className='el-footer'>
                    <div className='el-footer-inner'>
                        <span className='el-footer-logo'>John Leonardo</span>
                        <div className='el-footer-links'>
                            <a href={strings.GITHUB_URL} target='_blank' rel='noreferrer'>
                                GitHub
                            </a>
                            <a href={strings.LINKEDIN_URL} target='_blank' rel='noreferrer'>
                                LinkedIn
                            </a>
                            <a href={`mailto:${strings.EMAIL}`}>{strings.EMAIL}</a>
                        </div>
                        <span className='el-footer-copy'>© 2026. All rights reserved.</span>
                    </div>
                </footer>
            </main>
        </>
    );
}
