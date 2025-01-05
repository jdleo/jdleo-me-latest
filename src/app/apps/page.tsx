'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { strings } from '../constants/strings';
import { apps } from '../constants/apps';

export default function Apps() {
    useEffect(() => {
        if (window.matchMedia('(hover: none)').matches) {
            const observer = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('mobile-glow');
                        } else {
                            entry.target.classList.remove('mobile-glow');
                        }
                    });
                },
                { threshold: 0.7 }
            );

            document.querySelectorAll('.app-card').forEach(card => {
                observer.observe(card);
            });

            return () => observer.disconnect();
        }
    }, []);

    return (
        <div className='flex min-h-screen bg-[#1d1d1d] overflow-hidden'>
            <header className='absolute top-0 right-0 p-4 sm:p-6'>
                <nav className='flex gap-4 sm:gap-6 text-white/70 font-nunito text-sm sm:text-base'>
                    <Link href='/' className='hover:text-white transition-colors'>
                        Home
                    </Link>
                    <a href={`mailto:${strings.EMAIL}`} className='hover:text-white transition-colors'>
                        Email
                    </a>
                    <a
                        href={strings.LINKEDIN_URL}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='hover:text-white transition-colors'
                    >
                        LinkedIn
                    </a>
                    <a
                        href={strings.GITHUB_URL}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='hover:text-white transition-colors'
                    >
                        GitHub
                    </a>
                </nav>
            </header>

            <main className='flex-1 flex flex-col items-center px-4 pt-24 pb-12 sm:pt-32 sm:pb-16'>
                <p className='text-white/80 font-nunito font-normal text-sm sm:text-lg max-w-[90%] sm:max-w-[700px] text-center leading-relaxed mb-12'>
                    Here are some mini apps I built directly into this website for fun. They&apos;re all open source.
                    Enjoy!
                </p>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-[1200px] w-full px-4 sm:px-6'>
                    {apps.map(app => (
                        <Link
                            key={app.title}
                            href={app.href}
                            className='app-card group relative p-6 rounded-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1'
                        >
                            <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 blur-xl' />
                            <div className='absolute inset-0 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl' />
                            <div className='relative flex items-start gap-4'>
                                <span className='text-4xl group-hover:scale-110 transition-transform duration-300'>
                                    {app.emoji}
                                </span>
                                <div>
                                    <h2 className='text-white font-nunito font-bold text-xl mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:via-pink-400 group-hover:to-blue-400'>
                                        {app.title}
                                    </h2>
                                    <p className='text-white/70 font-nunito text-sm leading-relaxed'>{app.subtitle}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
