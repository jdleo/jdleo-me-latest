'use client';

import Link from 'next/link';
import { strings } from '../../constants/strings';
import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/SEO/Breadcrumbs';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function LinkShortener() {
    const [url, setUrl] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [isShortening, setIsShortening] = useState(false);
    const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [analyticsPassword, setAnalyticsPassword] = useState<string | null>(null);
    const [passwordCopied, setPasswordCopied] = useState(false);
    const [showAnalyticsView, setShowAnalyticsView] = useState(false);
    const [analyticsPasswordInput, setAnalyticsPasswordInput] = useState('');
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [analyticsData, setAnalyticsData] = useState<any[]>([]);
    const [analyticsError, setAnalyticsError] = useState<string | null>(null);
    const [analyticsAuthenticated, setAnalyticsAuthenticated] = useState(false);
    const [analyticsOriginalUrl, setAnalyticsOriginalUrl] = useState<string | null>(null);

    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'Apps', href: '/apps' },
        { label: 'Link Shortener', href: '/apps/link-shortener' },
    ];

    useEffect(() => {
        // Small delay for smoother loading animation
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleShorten = async () => {
        if (!url.trim()) return;

        setIsShortening(true);
        setShortenedUrl(null);
        setAnalyticsPassword(null);

        try {
            const response = await fetch('/api/link-shortener', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to shorten link');
            }

            setShortenedUrl(data.shortenedUrl);
            setAnalyticsPassword(data.password);
        } catch (error) {
            console.error('Shortening error:', error);
            // For now, show error in console. You might want to add error state
        } finally {
            setIsShortening(false);
        }
    };

    const handleCopy = async () => {
        if (!shortenedUrl) return;

        try {
            await navigator.clipboard.writeText(shortenedUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const handlePasswordCopy = async () => {
        if (!analyticsPassword) return;

        try {
            await navigator.clipboard.writeText(analyticsPassword);
            setPasswordCopied(true);
            setTimeout(() => setPasswordCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy password: ', err);
        }
    };

    const handleViewAnalytics = async () => {
        if (!analyticsPasswordInput.trim()) return;

        setAnalyticsLoading(true);
        setAnalyticsError(null);

        try {
            const response = await fetch('/api/link-shortener', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: analyticsPasswordInput.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load analytics');
            }

            setAnalyticsData(data.visitData || []);
            setAnalyticsOriginalUrl(data.url || null);
            setAnalyticsAuthenticated(true);
        } catch (error) {
            console.error('Analytics loading error:', error);
            setAnalyticsError(error instanceof Error ? error.message : 'Failed to load analytics');
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const handleCloseAnalytics = () => {
        setShowAnalyticsView(false);
        setAnalyticsPasswordInput('');
        setAnalyticsData([]);
        setAnalyticsLoading(false);
        setAnalyticsError(null);
        setAnalyticsAuthenticated(false);
        setAnalyticsOriginalUrl(null);
    };

    const getChartData = (data: any[]) => {
        // If no data, return empty chart
        if (!data || data.length === 0) {
            return {
                labels: [],
                datasets: [
                    {
                        label: 'Clicks',
                        data: [],
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: 'rgb(59, 130, 246)',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    },
                ],
            };
        }

        return {
            labels: data.map((day: any) => {
                const date = new Date(day.date);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }),
            datasets: [
                {
                    label: 'Clicks',
                    data: data.map((day: any) => day.clicks),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgb(59, 130, 246)',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
            ],
        };
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: 'rgba(59, 130, 246, 0.5)',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    title: function (context: any) {
                        const dataIndex = context[0].dataIndex;
                        const day = analyticsData[dataIndex];
                        if (!day) return '';
                        const date = new Date(day.date);
                        return `${date.toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                        })}`;
                    },
                    label: function (context: any) {
                        return `Clicks: ${context.parsed.y}`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: 'rgba(0, 0, 0, 0.6)',
                    font: {
                        size: 12,
                    },
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                },
                ticks: {
                    color: 'rgba(0, 0, 0, 0.6)',
                    font: {
                        size: 12,
                    },
                },
            },
        },
        interaction: {
            intersect: false,
            mode: 'index' as const,
        },
    };

    return (
        <div className='min-h-screen bg-[var(--color-bg-light)] relative'>
            {/* Breadcrumbs for SEO */}
            <Breadcrumbs items={breadcrumbItems} />

            {/* Subtle background gradients */}
            <div
                className='fixed inset-0 opacity-40 pointer-events-none'
                style={{
                    background:
                        'radial-gradient(ellipse at 30% 20%, rgba(94, 106, 210, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 60%)',
                }}
            />

            {/* Navigation Bar */}
            <nav className='nav-container'>
                <div className='nav-content'>
                    <Link href='/' className='nav-logo'>
                        JL
                    </Link>
                    <div className='nav-links'>
                        <Link href='/apps' className='nav-link'>
                            Apps
                        </Link>
                        <Link href='/' className='nav-link'>
                            Home
                        </Link>
                        <a href={strings.LINKEDIN_URL} target='_blank' rel='noopener noreferrer' className='nav-link'>
                            LinkedIn
                        </a>
                        <a href={strings.GITHUB_URL} target='_blank' rel='noopener noreferrer' className='nav-link'>
                            GitHub
                        </a>
                    </div>
                </div>
            </nav>

            {/* Link Shortener View */}
            {!showAnalyticsView && (
                <main className='main-content'>
                    <div className='container-responsive max-w-4xl'>
                        {/* Hero Section */}
                        <section className={`text-center mb-8 animate-reveal ${isLoaded ? '' : 'opacity-0'}`}>
                            <h1 className='text-h1 gradient-text mb-4'>Link Shortener</h1>
                            <p className='text-body opacity-80 max-w-2xl mx-auto'>
                                Create short links for your URLs with free analytics.
                            </p>
                        </section>

                        {/* Link Shortener Section */}
                        <div className={`animate-reveal animate-reveal-delay-1 ${isLoaded ? '' : 'opacity-0'}`}>
                            <div className='glass-card-enhanced p-6 md:p-8 mb-8 relative'>
                                <div className='absolute top-6 right-6'>
                                    <button
                                        onClick={() => setShowAnalyticsView(true)}
                                        className='text-sm px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-200 flex items-center gap-2'
                                    >
                                        📊 View Analytics
                                    </button>
                                </div>
                                <h2 className='text-h3 mb-6'>Shorten Your Link</h2>

                                <div className='space-y-6'>
                                    {/* URL Input */}
                                    <div>
                                        <label htmlFor='url-input' className='block text-body font-medium mb-2'>
                                            Enter your URL
                                        </label>
                                        <input
                                            type='url'
                                            id='url-input'
                                            value={url}
                                            onChange={e => setUrl(e.target.value)}
                                            placeholder='https://example.com/your-long-url-here'
                                            className='w-full p-3 rounded-xl bg-white border border-gray-200 text-body placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                                        />
                                    </div>

                                    {/* Shorten Button */}
                                    <button
                                        onClick={handleShorten}
                                        disabled={!url.trim() || isShortening}
                                        className='w-full button-primary flex items-center justify-center gap-2'
                                    >
                                        {isShortening ? (
                                            <>
                                                <svg className='w-4 h-4 animate-spin' fill='none' viewBox='0 0 24 24'>
                                                    <circle
                                                        className='opacity-25'
                                                        cx='12'
                                                        cy='12'
                                                        r='10'
                                                        stroke='currentColor'
                                                        strokeWidth='4'
                                                    ></circle>
                                                    <path
                                                        className='opacity-75'
                                                        fill='currentColor'
                                                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                                    ></path>
                                                </svg>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                Shorten Link
                                                <svg
                                                    className='w-4 h-4'
                                                    fill='none'
                                                    stroke='currentColor'
                                                    viewBox='0 0 24 24'
                                                >
                                                    <path
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                        strokeWidth={2}
                                                        d='M9 5l7 7-7 7'
                                                    />
                                                </svg>
                                            </>
                                        )}
                                    </button>

                                    {/* Result Area */}
                                    <div className='pt-4 border-t border-gray-200'>
                                        {shortenedUrl ? (
                                            <div className='space-y-3'>
                                                <div className='flex items-center gap-2 p-3 bg-gray-50 rounded-lg border'>
                                                    <input
                                                        type='text'
                                                        value={shortenedUrl}
                                                        readOnly
                                                        className='flex-1 bg-transparent text-body font-mono text-sm border-none outline-none'
                                                    />
                                                    <button
                                                        onClick={handleCopy}
                                                        className='button-primary text-xs px-3 py-2 flex items-center gap-1'
                                                    >
                                                        {copied ? (
                                                            <>
                                                                <svg
                                                                    className='w-3 h-3'
                                                                    fill='none'
                                                                    stroke='currentColor'
                                                                    viewBox='0 0 24 24'
                                                                >
                                                                    <path
                                                                        strokeLinecap='round'
                                                                        strokeLinejoin='round'
                                                                        strokeWidth={2}
                                                                        d='M5 13l4 4L19 7'
                                                                    />
                                                                </svg>
                                                                Copied!
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg
                                                                    className='w-3 h-3'
                                                                    fill='none'
                                                                    stroke='currentColor'
                                                                    viewBox='0 0 24 24'
                                                                >
                                                                    <path
                                                                        strokeLinecap='round'
                                                                        strokeLinejoin='round'
                                                                        strokeWidth={2}
                                                                        d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                                                                    />
                                                                </svg>
                                                                Copy
                                                            </>
                                                        )}
                                                    </button>
                                                </div>

                                                {/* Analytics Password Section */}
                                                {analyticsPassword && (
                                                    <div className='space-y-2'>
                                                        <div className='flex items-center justify-between'>
                                                            <label className='text-body text-sm font-medium'>
                                                                Analytics Password
                                                            </label>
                                                            <span className='text-xs text-red-600 font-medium'>
                                                                Save this securely!
                                                            </span>
                                                        </div>
                                                        <div className='flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg'>
                                                            <input
                                                                type='text'
                                                                value={analyticsPassword}
                                                                readOnly
                                                                className='flex-1 bg-transparent text-body font-mono text-sm border-none outline-none text-amber-900'
                                                            />
                                                            <button
                                                                onClick={handlePasswordCopy}
                                                                className='button-primary text-xs px-3 py-2 flex items-center gap-1'
                                                            >
                                                                {passwordCopied ? (
                                                                    <>
                                                                        <svg
                                                                            className='w-3 h-3'
                                                                            fill='none'
                                                                            stroke='currentColor'
                                                                            viewBox='0 0 24 24'
                                                                        >
                                                                            <path
                                                                                strokeLinecap='round'
                                                                                strokeLinejoin='round'
                                                                                strokeWidth={2}
                                                                                d='M5 13l4 4L19 7'
                                                                            />
                                                                        </svg>
                                                                        Copied!
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <svg
                                                                            className='w-3 h-3'
                                                                            fill='none'
                                                                            stroke='currentColor'
                                                                            viewBox='0 0 24 24'
                                                                        >
                                                                            <path
                                                                                strokeLinecap='round'
                                                                                strokeLinejoin='round'
                                                                                strokeWidth={2}
                                                                                d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                                                                            />
                                                                        </svg>
                                                                        Copy
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                        <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                                                            <div className='flex items-start gap-2'>
                                                                <svg
                                                                    className='w-4 h-4 text-red-600 mt-0.5 flex-shrink-0'
                                                                    fill='none'
                                                                    stroke='currentColor'
                                                                    viewBox='0 0 24 24'
                                                                >
                                                                    <path
                                                                        strokeLinecap='round'
                                                                        strokeLinejoin='round'
                                                                        strokeWidth={2}
                                                                        d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                                                                    />
                                                                </svg>
                                                                <div className='text-red-800 text-xs'>
                                                                    <strong>Important:</strong> If you lose this
                                                                    password, you'll never be able to view the analytics
                                                                    for this link again. Store it securely!
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className='text-center'>
                                                <p className='text-body opacity-60 text-sm'>
                                                    Your shortened link will appear here
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            )}

            {/* Analytics View */}
            {showAnalyticsView && (
                <main className='main-content'>
                    <div className='container-responsive max-w-4xl'>
                        {/* Analytics Header */}
                        <section className={`text-center mb-8 animate-reveal ${isLoaded ? '' : 'opacity-0'}`}>
                            <h1 className='text-h1 gradient-text mb-4'>Link Analytics</h1>
                            <p className='text-body opacity-80 max-w-2xl mx-auto'>
                                View detailed analytics and performance metrics for your shortened links.
                            </p>
                        </section>

                        {/* Analytics Content */}
                        <div className={`animate-reveal animate-reveal-delay-1 ${isLoaded ? '' : 'opacity-0'}`}>
                            <div className='glass-card-enhanced p-6 md:p-8 mb-8'>
                                {/* Back Button */}
                                <div className='flex justify-start mb-6'>
                                    <button
                                        onClick={handleCloseAnalytics}
                                        className='text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2'
                                    >
                                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M15 19l-7-7 7-7'
                                            />
                                        </svg>
                                        Back to Link Shortener
                                    </button>
                                </div>

                                {/* Shortened Link Display */}
                                {shortenedUrl && (
                                    <div className='mb-6'>
                                        <div className='flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                                            <input
                                                type='text'
                                                value={shortenedUrl}
                                                readOnly
                                                className='flex-1 bg-transparent text-body font-mono text-sm border-none outline-none text-blue-900'
                                            />
                                            <button
                                                onClick={handleCopy}
                                                className='button-primary text-xs px-3 py-2 flex items-center gap-1'
                                            >
                                                {copied ? (
                                                    <>
                                                        <svg
                                                            className='w-3 h-3'
                                                            fill='none'
                                                            stroke='currentColor'
                                                            viewBox='0 0 24 24'
                                                        >
                                                            <path
                                                                strokeLinecap='round'
                                                                strokeLinejoin='round'
                                                                strokeWidth={2}
                                                                d='M5 13l4 4L19 7'
                                                            />
                                                        </svg>
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg
                                                            className='w-3 h-3'
                                                            fill='none'
                                                            stroke='currentColor'
                                                            viewBox='0 0 24 24'
                                                        >
                                                            <path
                                                                strokeLinecap='round'
                                                                strokeLinejoin='round'
                                                                strokeWidth={2}
                                                                d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                                                            />
                                                        </svg>
                                                        Copy
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <p className='text-small opacity-60 mt-2'>Analytics for this shortened link</p>
                                    </div>
                                )}

                                {/* Original URL Display (only after authentication) */}
                                {analyticsAuthenticated && analyticsOriginalUrl && (
                                    <div className='mb-6'>
                                        <label className='block text-body text-sm font-medium mb-2'>Original URL</label>
                                        <div className='flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg'>
                                            <input
                                                type='text'
                                                value={analyticsOriginalUrl}
                                                readOnly
                                                className='flex-1 bg-transparent text-body font-mono text-sm border-none outline-none text-green-900'
                                            />
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(analyticsOriginalUrl);
                                                }}
                                                className='button-primary text-xs px-3 py-2 flex items-center gap-1'
                                            >
                                                <svg
                                                    className='w-3 h-3'
                                                    fill='none'
                                                    stroke='currentColor'
                                                    viewBox='0 0 24 24'
                                                >
                                                    <path
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                        strokeWidth={2}
                                                        d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                                                    />
                                                </svg>
                                                Copy
                                            </button>
                                        </div>
                                        <p className='text-small opacity-60 mt-2'>
                                            The original URL this shortened link redirects to
                                        </p>
                                    </div>
                                )}

                                {!analyticsAuthenticated ? (
                                    <div className='space-y-6'>
                                        {/* Password Input */}
                                        <div>
                                            <label
                                                htmlFor='analytics-password'
                                                className='block text-body font-medium mb-2'
                                            >
                                                Enter Analytics Password
                                            </label>
                                            <input
                                                type='password'
                                                id='analytics-password'
                                                value={analyticsPasswordInput}
                                                onChange={e => setAnalyticsPasswordInput(e.target.value)}
                                                placeholder='Enter your analytics password'
                                                className='w-full p-3 rounded-xl bg-white border border-gray-200 text-body placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                                            />
                                        </div>

                                        {/* Error Display */}
                                        {analyticsError && (
                                            <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                                                <div className='flex items-start gap-2'>
                                                    <svg
                                                        className='w-4 h-4 text-red-600 mt-0.5 flex-shrink-0'
                                                        fill='none'
                                                        stroke='currentColor'
                                                        viewBox='0 0 24 24'
                                                    >
                                                        <path
                                                            strokeLinecap='round'
                                                            strokeLinejoin='round'
                                                            strokeWidth={2}
                                                            d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                                                        />
                                                    </svg>
                                                    <div className='text-red-800 text-sm'>{analyticsError}</div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Submit Button */}
                                        <button
                                            onClick={handleViewAnalytics}
                                            disabled={!analyticsPasswordInput.trim() || analyticsLoading}
                                            className='w-full button-primary flex items-center justify-center gap-2'
                                        >
                                            {analyticsLoading ? (
                                                <>
                                                    <svg
                                                        className='w-4 h-4 animate-spin'
                                                        fill='none'
                                                        viewBox='0 0 24 24'
                                                    >
                                                        <circle
                                                            className='opacity-25'
                                                            cx='12'
                                                            cy='12'
                                                            r='10'
                                                            stroke='currentColor'
                                                            strokeWidth='4'
                                                        ></circle>
                                                        <path
                                                            className='opacity-75'
                                                            fill='currentColor'
                                                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                                        ></path>
                                                    </svg>
                                                    Loading Analytics...
                                                </>
                                            ) : (
                                                <>📊 Load Analytics</>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className='space-y-6'>
                                        {/* Analytics Summary */}
                                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                            <div className='glass-card p-4 text-center'>
                                                <div className='text-h4 text-blue-600'>
                                                    {analyticsData.length > 0
                                                        ? analyticsData.reduce(
                                                              (sum: number, day: any) => sum + day.clicks,
                                                              0
                                                          )
                                                        : 0}
                                                </div>
                                                <div className='text-small opacity-60'>Total Clicks (30d)</div>
                                            </div>
                                            <div className='glass-card p-4 text-center'>
                                                <div className='text-h4 text-green-600'>
                                                    {analyticsData.length > 0
                                                        ? Math.round(
                                                              analyticsData.reduce(
                                                                  (sum: number, day: any) => sum + day.clicks,
                                                                  0
                                                              ) / 30
                                                          )
                                                        : 0}
                                                </div>
                                                <div className='text-small opacity-60'>Daily Average</div>
                                            </div>
                                            <div className='glass-card p-4 text-center'>
                                                <div className='text-h4 text-purple-600'>
                                                    {analyticsData.length > 0
                                                        ? Math.max(...analyticsData.map((day: any) => day.clicks))
                                                        : 0}
                                                </div>
                                                <div className='text-small opacity-60'>Peak Day</div>
                                            </div>
                                        </div>

                                        {/* Chart */}
                                        <div className='glass-card-enhanced p-6'>
                                            <h3 className='text-h4 mb-4'>Clicks Over Last 30 Days</h3>
                                            <div className='bg-white rounded-lg p-4'>
                                                {analyticsData.length > 0 ? (
                                                    <Line data={getChartData(analyticsData)} options={chartOptions} />
                                                ) : (
                                                    <div className='text-center py-12'>
                                                        <div className='text-4xl mb-4'>📈</div>
                                                        <p className='text-body opacity-60 mb-2'>No click data yet</p>
                                                        <p className='text-small opacity-50'>
                                                            Share your shortened link to start tracking visits
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Recent Activity */}
                                        <div className='glass-card-enhanced p-6'>
                                            <h3 className='text-h4 mb-4'>Recent Activity</h3>
                                            <div className='space-y-3'>
                                                {analyticsData.length > 0 ? (
                                                    analyticsData
                                                        .slice(-7)
                                                        .reverse()
                                                        .map((day: any, index: number) => (
                                                            <div
                                                                key={index}
                                                                className='flex items-center justify-between p-3 glass-card-subtle rounded-lg'
                                                            >
                                                                <div className='flex items-center gap-3'>
                                                                    <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                                                                    <span className='text-body text-sm'>
                                                                        {new Date(day.date).toLocaleDateString(
                                                                            'en-US',
                                                                            {
                                                                                weekday: 'short',
                                                                                month: 'short',
                                                                                day: 'numeric',
                                                                            }
                                                                        )}
                                                                    </span>
                                                                    <span className='text-small opacity-60'>
                                                                        (
                                                                        {new Date(day.date).toLocaleDateString(
                                                                            'en-US',
                                                                            {
                                                                                month: 'numeric',
                                                                                day: 'numeric',
                                                                                year: 'numeric',
                                                                            }
                                                                        )}
                                                                        )
                                                                    </span>
                                                                </div>
                                                                <span className='text-body font-medium'>
                                                                    {day.clicks} clicks
                                                                </span>
                                                            </div>
                                                        ))
                                                ) : (
                                                    <div className='text-center py-8'>
                                                        <div className='text-3xl mb-3'>📅</div>
                                                        <p className='text-body opacity-60 mb-1'>No recent activity</p>
                                                        <p className='text-small opacity-50'>
                                                            Activity will appear here once your link gets clicks
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            )}
        </div>
    );
}
