'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { strings } from './constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import { getAllBlogPosts, BlogPost } from '@/blog/registry';
import {
    DevicePhoneMobileIcon,
    PencilSquareIcon,
    DocumentTextIcon,
    UserIcon,
    MapPinIcon,
    BriefcaseIcon,
    EyeIcon,
    LinkIcon,
    EnvelopeIcon,
    CalendarDaysIcon,
    ArrowRightIcon,
    RocketLaunchIcon,
    SparklesIcon,
    ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

export default function Home() {
    const [pageViewCount, setPageViewCount] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [latestPost, setLatestPost] = useState<BlogPost | null>(null);

    const formatNumber = (num: number | string) => {
        const number = Number(num) || 0;
        return number.toLocaleString('en-US');
    };

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);

        axios
            .get('/api/view')
            .then(res => {
                const views = Number(res.data.views) || 0;
                setPageViewCount(views);
            })
            .catch(error => {
                console.error('Failed to fetch view count:', error);
                setPageViewCount(0);
            });

        const posts = getAllBlogPosts();
        if (posts.length > 0) {
            setLatestPost(posts[0]);
        }

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <WebVitals />
            <main className='notion-page'>
                {/* Notion-style Header */}
                <header className={`notion-header ${isLoaded ? 'loaded' : ''}`}>
                    <div className='notion-nav'>
                        <a href='/apps' className='notion-nav-link'>
                            <DevicePhoneMobileIcon className='notion-nav-icon' />
                            Apps
                        </a>
                        <a href='/blog' className='notion-nav-link'>
                            <PencilSquareIcon className='notion-nav-icon' />
                            Blog
                        </a>
                        <a href='/apps/resume' className='notion-nav-link'>
                            <DocumentTextIcon className='notion-nav-icon' />
                            Resume
                        </a>
                    </div>
                </header>

                <div className={`notion-content ${isLoaded ? 'loaded' : ''}`}>
                    {/* Title Section */}
                    <div className='notion-title-block'>
                        <h1 className='notion-title'>{strings.NAME}</h1>
                        <div className='notion-subtitle'>Senior Software Engineer</div>
                    </div>

                    {/* About Line */}
                    <div className='notion-line'>
                        <div className='notion-line-icon-wrapper'>
                            <UserIcon className='notion-line-icon' />
                        </div>
                        <div className='notion-line-content'>
                            <div className='notion-line-label'>About</div>
                            <div className='notion-line-text'>{strings.SUBTITLE}</div>
                        </div>
                    </div>

                    {/* Location & Role Lines */}
                    <div className='notion-line'>
                        <div className='notion-line-icon-wrapper'>
                            <MapPinIcon className='notion-line-icon' />
                        </div>
                        <div className='notion-line-content'>
                            <div className='notion-line-label'>Location</div>
                            <div className='notion-line-text'>SF Bay Area</div>
                        </div>
                    </div>

                    <div className='notion-line'>
                        <div className='notion-line-icon-wrapper'>
                            <BriefcaseIcon className='notion-line-icon' />
                        </div>
                        <div className='notion-line-content'>
                            <div className='notion-line-label'>Currently</div>
                            <div className='notion-line-text'>Senior Engineer @ Roblox</div>
                        </div>
                    </div>

                    {/* Visitors Line */}
                    <div className='notion-line notion-line-visitors'>
                        <div className='notion-line-icon-wrapper'>
                            <EyeIcon className='notion-line-icon' />
                        </div>
                        <div className='notion-line-content'>
                            <div className='notion-line-label'>Visitors</div>
                            <div className='notion-line-text'>
                                <span className='notion-visitors-count'>{formatNumber(pageViewCount)}</span> total views
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className='notion-divider' />

                    {/* Connect Section */}
                    <div className='notion-section'>
                        <div className='notion-section-title'>
                            <LinkIcon className='notion-section-icon' />
                            Connect
                        </div>
                        <div className='notion-links-grid'>
                            <a href={strings.GITHUB_URL} target='_blank' className='notion-link-item'>
                                <svg className='notion-link-icon' viewBox='0 0 24 24' fill='currentColor'>
                                    <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
                                </svg>
                                <span className='notion-link-label'>GitHub</span>
                            </a>
                            <a href={strings.LINKEDIN_URL} target='_blank' className='notion-link-item'>
                                <svg className='notion-link-icon' viewBox='0 0 24 24' fill='currentColor'>
                                    <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
                                </svg>
                                <span className='notion-link-label'>LinkedIn</span>
                            </a>
                            <a href={`mailto:${strings.EMAIL}`} className='notion-link-item'>
                                <EnvelopeIcon className='notion-link-icon' />
                                <span className='notion-link-label'>Email</span>
                            </a>
                            <a href='https://calendly.com/jleonardo-roblox?ref=jdleo.me' target='_blank' className='notion-link-item'>
                                <CalendarDaysIcon className='notion-link-icon' />
                                <span className='notion-link-label'>Mentorship</span>
                            </a>
                        </div>
                    </div>

                    {/* Writing Section */}
                    {latestPost && (
                        <>
                            <div className='notion-divider' />
                            <div className='notion-section'>
                                <div className='notion-section-title'>
                                    <PencilSquareIcon className='notion-section-icon' />
                                    Latest Writing
                                    <a href='/blog' className='notion-section-action'>
                                        View all
                                        <ArrowRightIcon className='notion-action-arrow' />
                                    </a>
                                </div>
                                <a href={`/blog/${latestPost.slug}`} className='notion-post-line'>
                                    <div className='notion-post-title'>{latestPost.title}</div>
                                    <div className='notion-post-desc'>{latestPost.description}</div>
                                </a>
                            </div>
                        </>
                    )}

                    {/* Projects Section */}
                    <div className='notion-divider' />
                    <div className='notion-section'>
                        <div className='notion-section-title'>
                            <RocketLaunchIcon className='notion-section-icon' />
                            Active Projects
                        </div>

                        {/* Web Projects */}
                        <div className='notion-subsection'>
                            <div className='notion-subsection-title'>Web</div>
                            <div className='notion-project-list'>
                                <a href='https://resume.rodeo?ref=jdleo.me' target='_blank' className='notion-project-item'>
                                    <span className='notion-project-dot' style={{ backgroundColor: '#fb923c' }} />
                                    <div className='notion-project-info'>
                                        <div className='notion-project-name'>Resume Rodeo</div>
                                        <div className='notion-project-desc'>AI Resume Analysis & Optimization</div>
                                    </div>
                                </a>
                                <a href='https://lite.fyi?ref=jdleo.me' target='_blank' className='notion-project-item'>
                                    <span className='notion-project-dot' style={{ backgroundColor: '#60a5fa' }} />
                                    <div className='notion-project-info'>
                                        <div className='notion-project-name'>Lite.fyi</div>
                                        <div className='notion-project-desc'>Fastest Link Shortener</div>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* iOS Projects */}
                        <div className='notion-subsection'>
                            <div className='notion-subsection-title'>iOS</div>
                            <div className='notion-project-list'>
                                {[
                                    { name: 'Convo', desc: 'AI Chat Agents', url: 'https://apps.apple.com/us/app/convo-ai-chat-agents/id6753784349?ref=jdleo.me', color: '#818cf8' },
                                    { name: 'Tale', desc: 'Story Generator', url: 'https://apps.apple.com/us/app/tale-ai-story-generator/id6753922553?ref=jdleo.me', color: '#c084fc' },
                                    { name: 'Grasp', desc: 'Learn Anything', url: 'https://apps.apple.com/us/app/grasp-learn-anything-with-ai/id6754008830?ref=jdleo.me', color: '#34d399' },
                                    { name: 'Wave', desc: 'Social Discovery', url: 'https://apps.apple.com/us/app/wave-meet-friends-chat/id6754500401?ref=jdleo.me', color: '#f472b6' },
                                    { name: 'Prism', desc: 'AI Photos & Art Edits', url: 'https://apps.apple.com/us/app/prism-ai-photos-art-edits/id6757168364?ref=jdleo.me', color: '#22d3ee' },
                                ].map((app) => (
                                    <a key={app.name} href={app.url} target='_blank' className='notion-project-item'>
                                        <span className='notion-project-dot' style={{ backgroundColor: app.color }} />
                                        <div className='notion-project-info'>
                                            <div className='notion-project-name'>{app.name}</div>
                                            <div className='notion-project-desc'>{app.desc}</div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className='notion-divider' />
                    <div className='notion-actions'>
                        <a href='/apps' className='notion-action-btn notion-action-primary'>
                            <SparklesIcon className='notion-action-icon' />
                            View All Projects
                        </a>
                        <a href={`mailto:${strings.EMAIL}`} className='notion-action-btn'>
                            <ChatBubbleLeftRightIcon className='notion-action-icon' />
                            Get in Touch
                        </a>
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
