'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

import { strings } from './constants/strings';

export default function Home() {
    const [pageViewCount, setPageViewCount] = useState(0);

    useEffect(() => {
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
        <div className='flex min-h-screen bg-[#1d1d1d]'>
            <header className='absolute top-0 right-0 p-4 sm:p-6'>
                <nav className='flex gap-4 sm:gap-6 text-white/70 font-nunito text-sm sm:text-base'>
                    <a
                        href='/apps'
                        className='bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity'
                    >
                        Mini Apps
                    </a>
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

            <main className='flex-1 flex flex-col gap-8 sm:gap-12 items-center justify-center px-4 -mt-12'>
                <div className='w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] relative animate-rotate'>
                    <div
                        className='absolute inset-0 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] animate-morph shadow-xl'
                        style={{
                            background: 'rgba(240, 240, 245, 0.9)',
                            boxShadow: `
                0 0 50px rgba(138, 43, 226, 0.2),
                0 0 100px rgba(72, 61, 139, 0.1)
              `,
                            filter: 'brightness(1.1) contrast(1.05)',
                        }}
                    />
                </div>
                <div className='flex flex-col items-center gap-3 sm:gap-4'>
                    <h1 className='text-white font-nunito font-semibold text-3xl sm:text-6xl text-center'>
                        {strings.NAME}
                    </h1>
                    <p className='text-white/80 font-nunito font-normal text-sm sm:text-lg max-w-[90%] sm:max-w-[600px] text-center leading-relaxed'>
                        {strings.SUBTITLE}
                    </p>
                </div>
                <div className='flex gap-4 mt-4'>
                    <a
                        href={`mailto:${strings.EMAIL}`}
                        className='px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white font-nunito font-bold'
                    >
                        email me
                    </a>
                    <a
                        href='/apps'
                        className='px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-nunito font-bold hover:opacity-90 transition-opacity'
                    >
                        go to apps
                    </a>
                </div>
                <p className='text-white/50 font-nunito text-sm absolute bottom-6 sm:bottom-4'>
                    👀 This page has been viewed {pageViewCount.toLocaleString()} times.
                </p>
            </main>
        </div>
    );
}
