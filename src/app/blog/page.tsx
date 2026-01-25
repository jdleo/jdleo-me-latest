'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllBlogPosts } from '@/blog/registry';
import { WebVitals } from '@/components/SEO/WebVitals';
import { strings } from '../constants/strings';
import {
    DevicePhoneMobileIcon,
    PencilSquareIcon,
    DocumentTextIcon,
    EyeIcon,
    CalendarIcon,
} from '@heroicons/react/24/outline';

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

    const formatNumber = (num: number) => {
        return num.toLocaleString('en-US');
    };

    return (
        <>
            <WebVitals />
            <main className='notion-page'>
                {/* Header */}
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
                            <Link href='/blog' className='notion-nav-link' style={{ color: '#37352f' }}>
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

                <div className={`notion-content ${isLoaded ? 'loaded' : ''}`} style={{ maxWidth: '1100px' }}>
                    {/* Title Section */}
                    <div className='notion-title-block'>
                        <h1 className='notion-title'>Thoughts & Notes</h1>
                        <div className='notion-subtitle'>Exploring distributed systems, AI engineering, and interface design</div>
                    </div>

                    {/* Blog Posts List */}
                    {posts.length > 0 ? (
                        <div className='notion-blog-list'>
                            {posts.map((post) => (
                                <Link key={post.slug} href={`/blog/${post.slug}`} className='notion-blog-item'>
                                    <div className='notion-blog-main'>
                                        <div className='notion-blog-title'>{post.title}</div>
                                        <div className='notion-blog-desc'>{post.description}</div>
                                        <div className='notion-blog-meta'>
                                            <div className='notion-blog-meta-item'>
                                                <CalendarIcon className='notion-blog-meta-icon' />
                                                <span>{post.date}</span>
                                            </div>
                                            {viewCounts[post.slug] > 0 && (
                                                <div className='notion-blog-meta-item'>
                                                    <EyeIcon className='notion-blog-meta-icon' />
                                                    <span>{formatNumber(viewCounts[post.slug])} views</span>
                                                </div>
                                            )}
                                        </div>
                                        {post.tags.length > 0 && (
                                            <div className='notion-blog-tags'>
                                                {post.tags.map((tag) => (
                                                    <span key={tag} className='notion-blog-tag'>
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className='notion-empty-state'>
                            <div className='notion-empty-icon'>📭</div>
                            <div className='notion-empty-title'>No posts yet</div>
                            <div className='notion-empty-desc'>Check back soon for new content</div>
                        </div>
                    )}

                    {/* Footer */}
                    <footer className='notion-footer'>
                        © 2026 {strings.NAME}
                    </footer>
                </div>
            </main>
        </>
    );
}
