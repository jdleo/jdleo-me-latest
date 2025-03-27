'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { strings } from './constants/strings';

export default function Home() {
    const [pageViewCount, setPageViewCount] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
        axios
            .get('/api/view')
            .then(res => {
                setPageViewCount(res.data.views);
            })
            .catch(error => {
                console.error(error);
                setPageViewCount(0);
            });
    }, []);

    return (
        <div className='min-h-screen bg-[color:var(--background)] overflow-hidden orbital-grid'>
            {/* Background gradient effects */}
            <div className='fixed inset-0 bg-[color:var(--background)] z-[-2] pointer-events-none' />
            <div
                className='fixed top-[-50%] left-[-20%] w-[140%] h-[140%] z-[-1] opacity-30 animate-spin-slow pointer-events-none'
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(94, 106, 210, 0.1) 0%, transparent 70%)',
                    transformOrigin: 'center center',
                    animationDuration: '120s',
                }}
            />

            {/* Header */}
            <header className='absolute top-0 right-0 p-4 sm:p-6 z-10 w-full flex justify-end'>
                <nav className='flex gap-4 sm:gap-6 text-[color:var(--foreground)] text-opacity-70 text-sm sm:text-base'>
                    <a href='/apps' className='linear-link relative z-10'>
                        Mini Apps
                    </a>
                    <a href={`mailto:${strings.EMAIL}`} className='linear-link relative z-10'>
                        Email
                    </a>
                    <a
                        href={strings.LINKEDIN_URL}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='linear-link relative z-10'
                    >
                        LinkedIn
                    </a>
                    <a
                        href={strings.GITHUB_URL}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='linear-link relative z-10'
                    >
                        GitHub
                    </a>
                </nav>
            </header>

            <main className='flex flex-col items-center justify-center min-h-screen px-4 -mt-12'>
                {/* Orbital Animation */}
                <div
                    className={`mb-8 sm:mb-12 transition-all duration-700 ${
                        isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}
                >
                    <div className='relative w-[220px] h-[220px] sm:w-[300px] sm:h-[300px]'>
                        {/* Central Core */}
                        <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] rounded-full bg-gradient-to-br from-[color:var(--primary)] to-blue-400 shadow-orbital-glow z-10 animate-pulse-slow pointer-events-none'></div>

                        {/* Orbital Ring 1 */}
                        <div
                            className='absolute inset-0 animate-spin-slow pointer-events-none'
                            style={{ animationDuration: '20s' }}
                        >
                            <div className='absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30px] h-[30px] sm:w-[40px] sm:h-[40px] rounded-full bg-gradient-to-r from-pink-500 to-purple-500 shadow-orbital-glow-sm pointer-events-none'></div>
                            <div className='absolute inset-0 rounded-full border border-white border-opacity-10 animate-pulse-slow pointer-events-none'></div>
                        </div>

                        {/* Orbital Ring 2 */}
                        <div
                            className='absolute inset-[-40px] sm:inset-[-60px] animate-spin-reverse pointer-events-none'
                            style={{ animationDuration: '25s' }}
                        >
                            <div className='absolute right-[25%] top-1/2 -translate-y-1/2 w-[25px] h-[25px] sm:w-[35px] sm:h-[35px] rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 shadow-orbital-glow-sm pointer-events-none'></div>
                            <div
                                className='absolute inset-0 rounded-full border border-white border-opacity-10 rotate-45 animate-pulse-slow pointer-events-none'
                                style={{ animationDelay: '1s' }}
                            ></div>
                        </div>

                        {/* Orbital Ring 3 */}
                        <div
                            className='absolute inset-[-80px] sm:inset-[-120px] animate-spin-slow pointer-events-none'
                            style={{ animationDuration: '30s' }}
                        >
                            <div className='absolute bottom-[25%] left-1/2 -translate-x-1/2 w-[20px] h-[20px] sm:w-[30px] sm:h-[30px] rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 shadow-orbital-glow-sm pointer-events-none'></div>
                            <div
                                className='absolute inset-0 rounded-full border border-white border-opacity-10 rotate-[30deg] animate-pulse-slow pointer-events-none'
                                style={{ animationDelay: '2s' }}
                            ></div>
                        </div>

                        {/* Particles */}
                        {[...Array(15)].map((_, i) => (
                            <div
                                key={i}
                                className='absolute rounded-full animate-float pointer-events-none'
                                style={{
                                    width: `${Math.random() * 4 + 2}px`,
                                    height: `${Math.random() * 4 + 2}px`,
                                    backgroundColor: `rgba(${150 + Math.random() * 100}, ${
                                        150 + Math.random() * 100
                                    }, ${200 + Math.random() * 55}, ${0.5 + Math.random() * 0.5})`,
                                    boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(${150 + Math.random() * 100}, ${
                                        150 + Math.random() * 100
                                    }, ${200 + Math.random() * 55}, 0.5)`,
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDuration: `${Math.random() * 10 + 10}s`,
                                    animationDelay: `${Math.random() * 5}s`,
                                }}
                            />
                        ))}

                        {/* Glow Effect */}
                        <div
                            className='absolute inset-0 rounded-full opacity-30 animate-glow pointer-events-none'
                            style={{
                                background:
                                    'radial-gradient(circle, rgba(94, 106, 210, 0.4) 0%, rgba(125, 211, 252, 0.2) 50%, transparent 70%)',
                                filter: 'blur(30px)',
                            }}
                        ></div>
                    </div>
                </div>

                <div
                    className={`flex flex-col items-center gap-3 sm:gap-4 transition-all duration-700 delay-200 ${
                        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                >
                    <h1 className='text-[color:var(--foreground)] font-semibold text-3xl sm:text-6xl text-center'>
                        <span className='gradient-text'>{strings.NAME}</span>
                    </h1>
                    <p className='text-[color:var(--foreground)] text-opacity-80 font-normal text-sm sm:text-lg max-w-[90%] sm:max-w-[600px] text-center leading-relaxed'>
                        {strings.SUBTITLE}
                    </p>
                </div>

                <div
                    className={`flex gap-4 mt-6 transition-all duration-700 delay-300 ${
                        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                >
                    <a
                        href={`mailto:${strings.EMAIL}`}
                        className='px-6 py-3 rounded-lg bg-[color:var(--secondary)] border border-[color:var(--border)] text-[color:var(--foreground)] font-bold hover:bg-opacity-80 transition-all'
                    >
                        email me
                    </a>
                    <a
                        href='/apps'
                        className='relative px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-bold overflow-hidden group transition-all shadow-orbital-glow-sm hover:shadow-orbital-glow hover:scale-105'
                    >
                        <span className='relative z-10'>go to apps</span>
                        <span className='absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300'></span>
                    </a>
                </div>

                <div
                    className={`absolute bottom-6 sm:bottom-4 transition-all duration-700 delay-400 ${
                        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                >
                    <div className='px-4 py-1.5 rounded-full glass-card border border-[color:var(--border)] flex items-center gap-2'>
                        <span className='text-[color:var(--foreground)] text-opacity-50 text-sm'>👀</span>
                        <span className='text-[color:var(--foreground)] text-opacity-50 text-sm'>
                            {pageViewCount.toLocaleString()} views
                        </span>
                    </div>
                </div>
            </main>
        </div>
    );
}
