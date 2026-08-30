import Link from 'next/link';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { WebVitals } from '@/components/SEO/WebVitals';
import { strings } from './constants/strings';

const navLinks = [
    { label: 'Apps', href: '/apps' },
    { label: 'Blog', href: '/blog' },
    { label: 'Resume', href: '/apps/resume' },
    { label: 'GitHub', href: strings.GITHUB_URL, external: true },
];

const quickLinks = [
    {
        label: 'Apps',
        description: 'Small tools, toys, and experiments.',
        href: '/apps',
    },
    {
        label: 'Blog',
        description: 'Technical notes and longer writeups.',
        href: '/blog',
    },
    {
        label: 'Resume',
        description: 'Experience and background.',
        href: '/apps/resume',
    },
];

export default function NotFound() {
    return (
        <>
            <WebVitals />
            <main className='el-page'>
                <header className='el-nav'>
                    <Link href='/' className='el-logo' aria-label='John Leonardo home'>
                        John Leonardo
                    </Link>
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

                <section className='el-hero el-hero-page'>
                    <div className='el-hero-inner'>
                        <div className='el-hero-copy'>
                            <div className='el-eyebrow'>
                                <span>Error 404</span>
                                <span>Page not found</span>
                            </div>
                            <h1>
                                Nothing here
                                <span className='el-hero-cursor' aria-hidden='true' />
                            </h1>
                            <p className='el-hero-sub'>
                                The page you're looking for doesn't exist or has been
                                moved. It happens to the best of URLs.
                            </p>

                            <div className='el-hero-actions'>
                                <Link href='/' className='el-btn el-btn-dark'>
                                    Back home
                                    <ArrowUpRightIcon />
                                </Link>
                                <Link href='/apps' className='el-btn el-btn-light'>
                                    Browse apps
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <section className='el-section' aria-label='Quick links'>
                    <div className='el-list-head'>
                        <h3>Quick links</h3>
                    </div>
                    <ul className='el-list'>
                        {quickLinks.map((link) => (
                            <li key={link.href}>
                                <Link href={link.href} className='el-row'>
                                    <span className='el-row-label'>{link.label}</span>
                                    <span className='el-row-desc'>{link.description}</span>
                                    <span className='el-arrow' aria-hidden='true'>
                                        <ArrowUpRightIcon />
                                    </span>
                                </Link>
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
