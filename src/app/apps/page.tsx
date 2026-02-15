'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { strings } from '../constants/strings';
import { apps } from '../constants/apps';
import { WebVitals } from '@/components/SEO/WebVitals';
import {
    DevicePhoneMobileIcon,
    PencilSquareIcon,
    DocumentTextIcon,
    ChatBubbleLeftRightIcon,
    UserIcon,
    MagnifyingGlassIcon,
    BookOpenIcon,
    CircleStackIcon,
    ChartBarIcon,
    TrophyIcon,
    LinkIcon,
    SparklesIcon,
    CommandLineIcon,
    CubeIcon,
    CubeTransparentIcon,
    LockClosedIcon,
    EyeIcon,
    CalculatorIcon,
    ArrowTrendingUpIcon,
    SignalIcon,
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
        'AI Diagram Generator': SparklesIcon,
        'Resume Parser': DocumentTextIcon,
        'Color Gamble': CubeIcon,
        'Sort Viz': CommandLineIcon,
        'Blockchain 101': CubeTransparentIcon,
        'Hash Lab': LockClosedIcon,
        'Privacy Scanner': EyeIcon,
        'California Tax Calculator': CalculatorIcon,
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
            <main className='notion-page'>
                {/* Header */}
                <header className={`notion-header ${isLoaded ? 'loaded' : ''}`}>
                    <div className='notion-nav' style={{ justifyContent: 'space-between', maxWidth: '1100px' }}>
                        <Link href='/' className='notion-nav-link' style={{ fontWeight: 600 }}>
                            {strings.NAME}
                        </Link>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Link href='/apps' className='notion-nav-link' style={{ color: '#37352f' }}>
                                <DevicePhoneMobileIcon className='notion-nav-icon' />
                                Apps
                            </Link>
                            <Link href='/blog' className='notion-nav-link'>
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
                        <h1 className='notion-title'>Applications & Tools</h1>
                        <div className='notion-subtitle'>Random apps I made that might have some value to somebody</div>
                    </div>

                    {/* All Apps List */}
                    <div className='notion-apps-list'>
                        {apps.map((app) => {
                            const IconComponent = getAppIcon(app.title);
                            return (
                                <Link key={app.title} href={app.href} className='notion-app-item'>
                                    <div className='notion-app-icon-wrapper'>
                                        <IconComponent className='notion-app-icon' />
                                    </div>
                                    <div className='notion-app-info'>
                                        <div className='notion-app-name'>{app.title}</div>
                                        <div className='notion-app-desc'>{app.subtitle}</div>
                                    </div>
                                    <div className='notion-app-arrow'>→</div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <footer className='notion-footer'>
                        © 2026 {strings.NAME}
                    </footer>
                </div>
            </main>
        </>
    );
}
