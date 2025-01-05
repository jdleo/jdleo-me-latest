'use client';

import Link from 'next/link';
import { strings } from '../../constants/strings';

export default function Blockchain() {
    return (
        <div className='flex min-h-screen bg-[#1d1d1d] overflow-hidden'>
            <header className='absolute top-0 right-0 p-4 sm:p-6'>
                <nav className='flex gap-4 sm:gap-6 text-white/70 font-nunito text-sm sm:text-base'>
                    <Link href='/apps' className='hover:text-white transition-colors'>
                        Apps
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

            <main className='flex-1 flex items-center justify-center'>
                <h1 className='text-white font-nunito'>Blockchain Demo (Coming Soon)</h1>
            </main>
        </div>
    );
}
