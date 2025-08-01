import Link from 'next/link';
import { generateMetadata as createMetadata } from '@/lib/metadata';
import { apps } from './constants/apps';

export const metadata = createMetadata({
    title: 'Page Not Found',
    description: "The page you are looking for does not exist. Explore John Leonardo's portfolio and mini apps.",
    noIndex: true,
});

export default function NotFound() {
    const popularApps = apps.slice(0, 3);

    return (
        <div className='min-h-screen bg-[var(--color-bg-light)] relative flex items-center justify-center'>
            {/* Background gradients */}
            <div
                className='fixed inset-0 opacity-40 pointer-events-none'
                style={{
                    background:
                        'radial-gradient(ellipse at 30% 20%, rgba(94, 106, 210, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 60%)',
                }}
            />

            <main className='container-responsive text-center max-w-2xl mx-auto'>
                <div className='glass-card-enhanced p-8 md:p-12'>
                    {/* 404 Header */}
                    <div className='mb-8'>
                        <h1 className='text-display gradient-text mb-4'>404</h1>
                        <h2 className='text-h2 mb-6'>Page Not Found</h2>
                        <p className='text-body opacity-80 mb-8'>
                            Sorry, the page you're looking for doesn't exist. It might have been moved, deleted, or you
                            entered the wrong URL.
                        </p>
                    </div>

                    {/* Navigation Options */}
                    <div className='space-y-6 mb-8'>
                        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                            <Link href='/' className='button-primary group'>
                                <svg
                                    width='16'
                                    height='16'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                >
                                    <path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
                                    <polyline points='9,22 9,12 15,12 15,22' />
                                </svg>
                                <span>Go Home</span>
                            </Link>
                            <Link href='/apps' className='button-secondary group'>
                                <svg
                                    width='16'
                                    height='16'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                >
                                    <rect x='3' y='3' width='7' height='7' />
                                    <rect x='14' y='3' width='7' height='7' />
                                    <rect x='14' y='14' width='7' height='7' />
                                    <rect x='3' y='14' width='7' height='7' />
                                </svg>
                                <span>View Apps</span>
                            </Link>
                        </div>
                    </div>

                    {/* Popular Apps */}
                    <div className='border-t border-white border-opacity-20 pt-6'>
                        <h3 className='text-body font-semibold mb-4 opacity-80'>Popular Mini Apps</h3>
                        <div className='grid gap-3'>
                            {popularApps.map(app => (
                                <Link
                                    key={app.href}
                                    href={app.href}
                                    className='flex items-center gap-3 p-3 glass-card-subtle hover:glass-card transition-all duration-200 rounded-lg text-left'
                                >
                                    <span className='text-lg flex-shrink-0'>{app.emoji}</span>
                                    <div className='flex-1'>
                                        <h4 className='font-medium text-small'>{app.title}</h4>
                                        <p className='text-xs opacity-70'>{app.subtitle}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
