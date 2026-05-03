'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { strings } from '../constants/strings';
import { apps } from '../constants/apps';
import { WebVitals } from '@/components/SEO/WebVitals';
import {
    DocumentTextIcon,
    ChatBubbleLeftRightIcon,
    UserIcon,
    MagnifyingGlassIcon,
    BookOpenIcon,
    CircleStackIcon,
    ChartBarIcon,
    TrophyIcon,
    LinkIcon,
    BoltIcon,
    CommandLineIcon,
    CubeIcon,
    CubeTransparentIcon,
    LockClosedIcon,
    EyeIcon,
    CalculatorIcon,
    ArrowTrendingUpIcon,
    SignalIcon,
    ArrowUpRightIcon,
} from '@heroicons/react/24/outline';

// Map apps to their icons
const getAppIcon = (title: string) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
        'AI Chat': ChatBubbleLeftRightIcon,
        'Chat w/ John': UserIcon,
        'Resume Screen': MagnifyingGlassIcon,
        'PDF Chat (Embeddings)': BookOpenIcon,
        'Knowledge Graph': CircleStackIcon,
        'LLM Serialization': ChartBarIcon,
        'LLM Leaderboard': TrophyIcon,
        'Link Shortener': LinkIcon,
        'AI Diagram Generator': BoltIcon,
        'Resume Parser': DocumentTextIcon,
        'Color Gamble': CubeIcon,
        'Sort Viz': CommandLineIcon,
        'Blockchain 101': CubeTransparentIcon,
        'Hash Lab': LockClosedIcon,
        'Privacy Scanner': EyeIcon,
        '2026 California Tax Calculator': CalculatorIcon,
        'Founder Dilution': ArrowTrendingUpIcon,
        'AI Sentiment': SignalIcon,
    };
    return iconMap[title] || DocumentTextIcon;
};

export default function Apps() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <WebVitals />
            <main className={`resend-home resend-apps-home ${isLoaded ? 'is-loaded' : ''}`}>
                <header className='resend-nav-wrap'>
                    <Link href='/' className='resend-logo' aria-label='John Leonardo home'>
                        {strings.NAME}
                    </Link>
                    <nav className='resend-nav' aria-label='Apps navigation'>
                        <Link href='/' className='resend-nav-link'>
                            Home
                        </Link>
                        <Link href='/blog' className='resend-nav-link'>
                            Blog
                        </Link>
                        <Link href='/apps/resume' className='resend-nav-link'>
                            Resume
                        </Link>
                        <a href={strings.GITHUB_URL} target='_blank' rel='noreferrer' className='resend-nav-link'>
                            GitHub
                        </a>
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
                    <section className='resend-blog-hero resend-apps-hero'>
                        <h1>Apps</h1>
                        <p>Random apps I made that might have some value to somebody.</p>
                    </section>

                    <section className='resend-app-grid' aria-label='Applications and tools'>
                        {apps.map((app) => {
                            const IconComponent = getAppIcon(app.title);
                            return (
                                <Link key={app.title} href={app.href} className='resend-app-card'>
                                    <div className='resend-app-card-icon'>
                                        <IconComponent aria-hidden='true' />
                                    </div>
                                    <div className='resend-app-card-body'>
                                        <h2>{app.title}</h2>
                                        <p>{app.subtitle}</p>
                                    </div>
                                    <ArrowUpRightIcon className='resend-app-card-arrow' aria-hidden='true' />
                                </Link>
                            );
                        })}
                    </section>

                    <footer className='resend-footer'>
                        <span>© 2026 {strings.NAME}</span>
                        <a href={`mailto:${strings.EMAIL}`}>{strings.EMAIL}</a>
                    </footer>
                </article>
            </main>
        </>
    );
}
