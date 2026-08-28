'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRightIcon, EyeIcon } from '@heroicons/react/24/outline';
import LiquidGhost from '@/components/LiquidGhost';
import { WebVitals } from '@/components/SEO/WebVitals';
import { getAllBlogPosts, BlogPost } from '@/blog/registry';
import { strings } from './constants/strings';

const featuredProjects = [
    {
        label: 'TinySafe',
        description: 'A Qwen3 safety classifier that returns structured moderation verdicts.',
        href: 'https://huggingface.co/jdleo1/tinysafe-3?ref=jdleo.me',
    },
    {
        label: 'WeirdBench',
        description: 'Unconventional LLM benchmarks for modern frontier models.',
        href: 'https://weirdbench.com?ref=jdleo.me',
    },
    {
        label: 'Resume Rodeo',
        description: 'AI resume analysis and optimization.',
        href: 'https://resume.rodeo?ref=jdleo.me',
    },
    {
        label: 'Lite.fyi',
        description: 'A stripped-down link shortener built for speed.',
        href: 'https://lite.fyi?ref=jdleo.me',
    },
    {
        label: 'Stock Quant AI',
        description: 'Equity research workflows with AI in the loop.',
        href: 'https://stockquantai.com?ref=jdleo.me',
    },
];

const iosApps = [
    {
        label: 'Convo',
        description: 'AI chat agents.',
        href: 'https://apps.apple.com/us/app/convo-ai-chat-agents/id6753784349?ref=jdleo.me',
    },
    {
        label: 'Tale',
        description: 'A story generator for quick narrative experiments.',
        href: 'https://apps.apple.com/us/app/tale-ai-story-generator/id6753922553?ref=jdleo.me',
    },
    {
        label: 'Grasp',
        description: 'Learn-anything prompts and explanations.',
        href: 'https://apps.apple.com/us/app/grasp-learn-anything-with-ai/id6754008830?ref=jdleo.me',
    },
    {
        label: 'Plate',
        description: 'AI-assisted calorie tracking.',
        href: 'https://apps.apple.com/us/app/plate-ai-calorie-tracker/id6759228569?ref=jdleo.me',
    },
    {
        label: 'Prism',
        description: 'Photo and art edits with AI.',
        href: 'https://apps.apple.com/us/app/prism-ai-photos-art-edits/id6757168364?ref=jdleo.me',
    },
];

const navLinks = [
    { label: 'Apps', href: '/apps' },
    { label: 'Blog', href: '/blog' },
    { label: 'Resume', href: '/apps/resume' },
    { label: 'GitHub', href: strings.GITHUB_URL, external: true },
];

export default function Home() {
    const [pageViewCount, setPageViewCount] = useState(0);
    const [latestPost, setLatestPost] = useState<BlogPost | null>(null);

    useEffect(() => {
        fetch('/api/view')
            .then((res) => res.json())
            .then((data) => {
                setPageViewCount(Number(data.views) || 0);
            })
            .catch((error) => {
                console.error('Failed to fetch view count:', error);
            });

        const posts = getAllBlogPosts();
        if (posts.length > 0) {
            setLatestPost(posts[0]);
        }
    }, []);

    const formatNumber = (num: number | string) => {
        const number = Number(num) || 0;
        return number.toLocaleString('en-US');
    };

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
                    <a href='/' className='el-logo' aria-label='John Leonardo home'>
                        John Leonardo
                    </a>
                    <nav className='el-nav-links' aria-label='Primary'>
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

                <section className='el-hero'>
                    <div className='el-hero-inner'>
                        <div className='el-hero-copy'>
                            <h1>
                                John Leonardo
                                <span className='el-hero-cursor' aria-hidden='true' />
                            </h1>
                            <p className='el-hero-sub'>{strings.SUBTITLE}</p>

                            <div className='el-hero-actions'>
                                <a href='/apps' className='el-btn el-btn-dark'>
                                    Browse apps
                                    <ArrowUpRightIcon aria-hidden='true' />
                                </a>
                                <a href='/blog' className='el-btn el-btn-light'>
                                    Read the blog
                                </a>
                            </div>

                            <div className='el-hero-meta'>
                                <span>Senior Software Engineer</span>
                                <span className='el-meta-dot' aria-hidden='true' />
                                <span>SF Bay Area</span>
                                <span className='el-meta-dot' aria-hidden='true' />
                                <span>Roblox</span>
                                <span className='el-meta-dot' aria-hidden='true' />
                                <span className='el-meta-views'>
                                    <EyeIcon aria-hidden='true' />
                                    {formatNumber(pageViewCount)} views
                                </span>
                            </div>
                        </div>

                        <div className='el-hero-art'>
                            <LiquidGhost />
                        </div>
                    </div>
                </section>

                <section className='el-section' aria-label='Latest writing'>
                    {latestPost && (
                        <a href={`/blog/${latestPost.slug}`} className='el-latest'>
                            <div className='el-eyebrow'>
                                <span className='el-eyebrow-label'>Latest writing</span>
                                <span className='el-eyebrow-date'>{formatDate(latestPost.date)}</span>
                            </div>
                            <div className='el-latest-row'>
                                <h2>{latestPost.title}</h2>
                                <span className='el-arrow' aria-hidden='true'>
                                    <ArrowUpRightIcon />
                                </span>
                            </div>
                            {latestPost.description && <p>{latestPost.description}</p>}
                        </a>
                    )}
                </section>

                <section className='el-section' aria-label='Projects'>
                    <div className='el-list-head'>
                        <h3>Projects</h3>
                        <a href='/apps' className='el-list-more'>
                            All apps
                            <ArrowUpRightIcon aria-hidden='true' />
                        </a>
                    </div>
                    <ul className='el-list'>
                        {featuredProjects.map((project) => (
                            <li key={project.label}>
                                <a href={project.href} target='_blank' rel='noreferrer' className='el-row'>
                                    <span className='el-row-label'>{project.label}</span>
                                    <span className='el-row-desc'>{project.description}</span>
                                    <span className='el-arrow' aria-hidden='true'>
                                        <ArrowUpRightIcon />
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className='el-section' aria-label='iPhone apps'>
                    <div className='el-list-head'>
                        <h3>iPhone Apps</h3>
                    </div>
                    <ul className='el-list'>
                        {iosApps.map((app) => (
                            <li key={app.label}>
                                <a href={app.href} target='_blank' rel='noreferrer' className='el-row'>
                                    <span className='el-row-label'>{app.label}</span>
                                    <span className='el-row-desc'>{app.description}</span>
                                    <span className='el-arrow' aria-hidden='true'>
                                        <ArrowUpRightIcon />
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
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
