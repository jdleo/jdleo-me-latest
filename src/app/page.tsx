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
            <main className={`jd-home ${isLoaded ? 'is-loaded' : ''}`}>
                <header className='jd-nav-wrap'>
                    <a href='/' className='jd-logo' aria-label='John Leonardo home'>
                        John Leonardo
                    </a>
                    <nav className='jd-nav' aria-label='Primary'>
                        {notebookLinks.map((link) => (
                            <a key={link.label} href={link.href} className='jd-nav-link'>
                                {link.label}
                            </a>
                        ))}
                        <a href={strings.GITHUB_URL} target='_blank' rel='noreferrer' className='jd-nav-link'>
                            GitHub
                        </a>
                    </nav>
                    <div className='jd-nav-actions'>
                        <a href={strings.LINKEDIN_URL} target='_blank' rel='noreferrer' className='jd-login'>
                            LinkedIn
                        </a>
                        <a href={`mailto:${strings.EMAIL}`} className='jd-top-cta'>
                            Contact
                        </a>
                    </div>
                </header>

                <section className='jd-hero' aria-labelledby='home-title'>
                    <div className='jd-hero-copy'>
                        <a href='/blog' className='jd-pill'>
                            <span>Latest writing</span>
                            <ArrowUpRightIcon aria-hidden='true' />
                        </a>
                        <h1 id='home-title'>{strings.NAME}</h1>
                        <p className='jd-role'>Senior Software Engineer</p>
                        <p className='jd-lede'>{strings.SUBTITLE}</p>

                        <div className='jd-actions'>
                            <a href='/apps' className='jd-primary'>
                                Browse apps
                            </a>
                            <a href='/blog' className='jd-secondary'>
                                Read the blog
                            </a>
                        </div>

                        <div className='jd-meta'>
                            <span>SF Bay Area</span>
                            <span>Roblox</span>
                            <span>
                                <EyeIcon aria-hidden='true' />
                                {formatNumber(pageViewCount)} views
                            </span>
                        </div>
                    </div>

                    <div className='jd-hero-art' aria-hidden='true'>
                        <div className='jd-cube-stage'>
                            <div className='jd-cube'>
                                {Array.from({ length: 9 }).map((_, index) => (
                                    <span key={index} className={`jd-cube-cell cell-${index}`} />
                                ))}
                            </div>
                            <div className='jd-cube-shadow' />
                        </div>
                    </div>
                </section>

                <section className='jd-work' aria-label='Homepage links'>
                    {latestPost && (
                        <a href={`/blog/${latestPost.slug}`} className='jd-work-card jd-work-card-wide'>
                            <div className='jd-card-eyebrow'>
                                <PencilSquareIcon aria-hidden='true' />
                                Latest writing
                            </div>
                            <h3>{latestPost.title}</h3>
                            <p>{latestPost.description}</p>
                            <span>{formatDate(latestPost.date)}</span>
                        </a>
                    )}

                    <div className='jd-work-card'>
                        <div className='jd-card-eyebrow'>Projects</div>
                        <ul>
                            {featuredProjects.map((project) => (
                                <li key={project.label}>
                                    <a href={project.href} target='_blank' rel='noreferrer'>
                                        {project.label}
                                    </a>
                                    <span>{project.description}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className='jd-work-card'>
                        <div className='jd-card-eyebrow'>iPhone Apps</div>
                        <ul>
                            {iosApps.map((app) => (
                                <li key={app.label}>
                                    <a href={app.href} target='_blank' rel='noreferrer'>
                                        {app.label}
                                    </a>
                                    <span>{app.description}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <footer className='jd-footer'>
                    <span>© 2026 {strings.NAME}</span>
                    <a href={`mailto:${strings.EMAIL}`}>{strings.EMAIL}</a>
                </footer>
            </main>
        </>
    );
}
