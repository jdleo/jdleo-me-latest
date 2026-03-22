'use client';

import { useEffect, useState } from 'react';
import {
    ArrowUpRightIcon,
    EyeIcon,
    PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { WebVitals } from '@/components/SEO/WebVitals';
import { getAllBlogPosts, BlogPost } from '@/blog/registry';
import { strings } from './constants/strings';

const featuredProjects = [
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

const notebookLinks = [
    { label: 'Apps', href: '/apps' },
    { label: 'Blog', href: '/blog' },
    { label: 'Resume', href: '/apps/resume' },
];

export default function Home() {
    const [pageViewCount, setPageViewCount] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [latestPost, setLatestPost] = useState<BlogPost | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 80);

        fetch('/api/view')
            .then((res) => res.json())
            .then((data) => {
                const views = Number(data.views) || 0;
                setPageViewCount(views);
            })
            .catch((error) => {
                console.error('Failed to fetch view count:', error);
                setPageViewCount(0);
            });

        const posts = getAllBlogPosts();
        if (posts.length > 0) {
            setLatestPost(posts[0]);
        }

        return () => clearTimeout(timer);
    }, []);

    const formatNumber = (num: number | string) => {
        const number = Number(num) || 0;
        return number.toLocaleString('en-US');
    };

    const formatDate = (date: string) =>
        new Intl.DateTimeFormat('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        }).format(new Date(date));

    return (
        <>
            <WebVitals />
            <main className='obsidian-home'>
                <div className='obsidian-orb obsidian-orb-left' />
                <div className='obsidian-orb obsidian-orb-right' />

                <article className={`obsidian-sheet ${isLoaded ? 'is-loaded' : ''}`}>
                    <header className='obsidian-topbar obsidian-topbar-home'>
                        <nav className='obsidian-nav' aria-label='Primary'>
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

                    <section className='obsidian-intro'>
                        <h1 className='obsidian-title'>{strings.NAME}</h1>
                        <p className='obsidian-subtitle'>Senior Software Engineer</p>
                        <p className='obsidian-lede'>{strings.SUBTITLE}</p>

                        <div className='obsidian-meta'>
                            <span>SF Bay Area</span>
                            <span>Senior Engineer at Roblox</span>
                            <span className='obsidian-meta-views'>
                                <EyeIcon className='obsidian-meta-icon' />
                                {formatNumber(pageViewCount)} page views
                            </span>
                        </div>
                    </section>

                    <section className='obsidian-section'>
                        <h2>Elsewhere</h2>
                        <p className='obsidian-inline-list'>
                            <a href={strings.GITHUB_URL} target='_blank' rel='noreferrer'>
                                GitHub
                            </a>
                            <span>/</span>
                            <a href={strings.LINKEDIN_URL} target='_blank' rel='noreferrer'>
                                LinkedIn
                            </a>
                            <span>/</span>
                            <a href={`mailto:${strings.EMAIL}`}>Email</a>
                            <span>/</span>
                            <a href='https://calendly.com/jleonardo-roblox?ref=jdleo.me' target='_blank' rel='noreferrer'>
                                Mentorship
                            </a>
                        </p>
                    </section>

                    {latestPost && (
                        <section className='obsidian-section'>
                            <div className='obsidian-section-heading'>
                                <h2>Latest Writing</h2>
                                <a href='/blog' className='obsidian-section-link'>
                                    All posts
                                    <ArrowUpRightIcon className='obsidian-inline-icon' />
                                </a>
                            </div>
                            <a href={`/blog/${latestPost.slug}`} className='obsidian-entry-link'>
                                <div className='obsidian-entry-header'>
                                    <PencilSquareIcon className='obsidian-entry-icon' />
                                    <span>{formatDate(latestPost.date)}</span>
                                </div>
                                <h3>{latestPost.title}</h3>
                                <p>{latestPost.description}</p>
                            </a>
                        </section>
                    )}

                    <section className='obsidian-section'>
                        <h2>Things I&apos;m Building</h2>
                        <ul className='obsidian-list'>
                            {featuredProjects.map((project) => (
                                <li key={project.label}>
                                    <a href={project.href} target='_blank' rel='noreferrer'>
                                        {project.label}
                                    </a>{' '}
                                    <span>- </span>
                                    <span>{project.description}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className='obsidian-section'>
                        <h2>iPhone Apps</h2>
                        <ul className='obsidian-list obsidian-list-compact'>
                            {iosApps.map((app) => (
                                <li key={app.label}>
                                    <a href={app.href} target='_blank' rel='noreferrer'>
                                        {app.label}
                                    </a>{' '}
                                    <span>- </span>
                                    <span>{app.description}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className='obsidian-section obsidian-section-closing'>
                        <h2>Open Tabs</h2>
                        <p>
                            If you want the broader catalog, the apps index is the fastest path. If you want
                            the thinking behind the work, the blog is where I put the longer writeups.
                        </p>
                        <p className='obsidian-inline-list'>
                            <a href='/apps'>Browse apps</a>
                            <span>/</span>
                            <a href='/blog'>Read the blog</a>
                            <span>/</span>
                            <a href={`mailto:${strings.EMAIL}`}>Start a conversation</a>
                        </p>
                    </section>

                    <footer className='obsidian-footer'>© 2026 {strings.NAME}</footer>
                </article>
            </main>
        </>
    );
}
