'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllBlogPosts } from '@/blog/registry';
import { strings } from '../constants/strings';
import { Breadcrumbs } from '@/components/SEO/Breadcrumbs';

// Fetch view counts for all blog posts
async function getAllBlogViewCounts(): Promise<Record<string, number>> {
    try {
        const response = await fetch('/api/blog-views', {
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error('Failed to fetch view counts:', response.statusText);
            return {};
        }

        const data = await response.json();
        if (data.success && data.views) {
            // Convert array to object for easy lookup
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

    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'Blog', href: '/blog' },
    ];

    useEffect(() => {
        // Fetch view counts
        const fetchViewCounts = async () => {
            const counts = await getAllBlogViewCounts();
            setViewCounts(counts);
        };

        fetchViewCounts();

        // Small delay for smoother loading animation
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className='min-h-screen bg-[var(--color-bg-light)] relative'>
            {/* Subtle background gradients */}
            <div
                className='fixed inset-0 opacity-40 pointer-events-none'
                style={{
                    background:
                        'radial-gradient(ellipse at 30% 20%, rgba(94, 106, 210, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 60%)',
                }}
            />

            {/* Strong Navigation Bar */}
            <nav className='nav-container'>
                <div className='nav-content'>
                    <a href='/' className='nav-logo'>
                        JL
                    </a>
                    <div className='nav-links'>
                        <a href='/apps' className='nav-link'>
                            Apps
                        </a>
                        <a href='/blog' className='nav-link'>
                            Blog
                        </a>
                        <a href='/apps/resume' className='nav-link'>
                            Resume
                        </a>
                        <a href={strings.LINKEDIN_URL} target='_blank' rel='noopener noreferrer' className='nav-link'>
                            LinkedIn
                        </a>
                        <a href={strings.GITHUB_URL} target='_blank' rel='noopener noreferrer' className='nav-link'>
                            GitHub
                        </a>
                    </div>
                </div>
            </nav>

            <main className='main-content'>
                <div className='container-responsive'>
                    <Breadcrumbs items={breadcrumbItems} />

                    {/* Header Section */}
                    <section
                        className={`text-center max-w-4xl mx-auto mb-12 animate-reveal ${isLoaded ? '' : 'opacity-0'}`}
                    >
                        <h1 className='text-display gradient-text mb-6'>Blog</h1>
                    </section>

                    {/* Blog Posts Grid */}
                    <section
                        className={`max-w-4xl mx-auto animate-reveal animate-reveal-delay-1 ${
                            isLoaded ? '' : 'opacity-0'
                        }`}
                    >
                        <div className='space-y-6'>
                            {posts.map((post, index) => (
                                <article
                                    key={post.slug}
                                    className={`glass-card-enhanced p-6 md:p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-reveal`}
                                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                                >
                                    <Link href={`/blog/${post.slug}`} className='block group'>
                                        <h2 className='text-h2 mb-4 group-hover:gradient-text-accent transition-all duration-300'>
                                            {post.title}
                                        </h2>

                                        <p className='text-body opacity-80 mb-6 leading-relaxed'>{post.description}</p>

                                        <div className='flex flex-col gap-4'>
                                            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                                                <time
                                                    dateTime={post.date}
                                                    className='text-small opacity-70 flex items-center gap-2'
                                                >
                                                    <svg
                                                        width='14'
                                                        height='14'
                                                        viewBox='0 0 24 24'
                                                        fill='none'
                                                        stroke='currentColor'
                                                        strokeWidth='2'
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                        className='opacity-60'
                                                    >
                                                        <path d='M8 2v4' />
                                                        <path d='M16 2v4' />
                                                        <rect width='18' height='18' x='3' y='4' rx='2' />
                                                        <path d='M3 10h18' />
                                                    </svg>
                                                    {(() => {
                                                        const [year, month, day] = post.date.split('-');
                                                        const date = new Date(
                                                            parseInt(year),
                                                            parseInt(month) - 1,
                                                            parseInt(day)
                                                        );
                                                        return date.toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        });
                                                    })()}
                                                </time>

                                                <div className='flex flex-wrap gap-2'>
                                                    {post.tags.map(tag => (
                                                        <span key={tag} className='tech-tag'>
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* View Count */}
                                            <div className='flex items-center gap-2 text-small opacity-70'>
                                                <svg
                                                    width='14'
                                                    height='14'
                                                    viewBox='0 0 24 24'
                                                    fill='none'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    className='opacity-60'
                                                >
                                                    <path d='M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z' />
                                                    <path d='M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' />
                                                </svg>
                                                <span className='font-medium'>
                                                    {(viewCounts[post.slug] || 0).toLocaleString()} views
                                                </span>
                                            </div>
                                        </div>

                                        {/* Read More Arrow */}
                                        <div className='flex items-center gap-2 mt-4 text-small opacity-70 group-hover:opacity-100 group-hover:gap-3 transition-all duration-300'>
                                            <span>Read more</span>
                                            <svg
                                                width='14'
                                                height='14'
                                                viewBox='0 0 24 24'
                                                fill='none'
                                                stroke='currentColor'
                                                strokeWidth='2'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                className='transition-transform group-hover:translate-x-1'
                                            >
                                                <path d='M5 12h14' />
                                                <path d='M12 5l7 7-7 7' />
                                            </svg>
                                        </div>
                                    </Link>
                                </article>
                            ))}
                        </div>

                        {/* Empty State */}
                        {posts.length === 0 && (
                            <div className='glass-card-enhanced p-12 text-center'>
                                <div className='mb-4 opacity-60'>
                                    <svg
                                        width='48'
                                        height='48'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        stroke='currentColor'
                                        strokeWidth='1.5'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        className='mx-auto'
                                    >
                                        <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                                        <polyline points='14,2 14,8 20,8' />
                                        <line x1='16' y1='13' x2='8' y2='13' />
                                        <line x1='16' y1='17' x2='8' y2='17' />
                                        <polyline points='10,9 9,9 8,9' />
                                    </svg>
                                </div>
                                <h3 className='text-h3 mb-2 opacity-90'>No posts yet</h3>
                                <p className='text-body opacity-70'>Check back soon for new content!</p>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}
