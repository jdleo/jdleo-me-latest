'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { strings } from '../../constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
} from 'chart.js';
import {
    LinkIcon,
    ChartBarIcon,
    ClipboardIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend);

export default function LinkShortener() {
    const [url, setUrl] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [isShortening, setIsShortening] = useState(false);
    const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
    const [analyticsPassword, setAnalyticsPassword] = useState<string | null>(null);
    const [analyticsPasswordInput, setAnalyticsPasswordInput] = useState('');
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [analyticsData, setAnalyticsData] = useState<any[]>([]);
    const [analyticsAuthenticated, setAnalyticsAuthenticated] = useState(false);
    const [analyticsOriginalUrl, setAnalyticsOriginalUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleShorten = async () => {
        if (!url.trim()) return;
        setIsShortening(true);
        try {
            const response = await fetch('/api/link-shortener', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url.trim() }),
            });
            const data = await response.json();
            if (response.ok) {
                setShortenedUrl(data.shortenedUrl);
                setAnalyticsPassword(data.password);
                setAnalyticsAuthenticated(false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsShortening(false);
        }
    };

    const handleViewAnalytics = async () => {
        if (!analyticsPasswordInput.trim()) return;
        setAnalyticsLoading(true);
        try {
            const response = await fetch('/api/link-shortener', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: analyticsPasswordInput.trim() }),
            });
            const data = await response.json();
            if (response.ok) {
                setAnalyticsData(data.visitData || []);
                setAnalyticsOriginalUrl(data.url || null);
                setAnalyticsAuthenticated(true);
                setShortenedUrl(null);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const chartData = {
        labels: analyticsData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        datasets: [{
            label: 'Clicks',
            data: analyticsData.map(d => d.clicks),
            borderColor: '#111110',
            backgroundColor: 'rgba(17, 17, 16, 0.05)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: '#f7f7f2',
            pointBorderColor: '#111110',
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#111110',
                bodyColor: '#4d4d4a',
                borderColor: '#e2e2da',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 10,
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#82827c', font: { size: 10, family: 'sans-serif' } }
            },
            y: {
                grid: { color: '#e7e7e0' },
                ticks: { color: '#82827c', font: { size: 10, family: 'sans-serif' }, stepSize: 1 }
            }
        }
    };

    const copyToClipboard = (text: string, tag: string) => {
        navigator.clipboard.writeText(text);
        setCopied(tag);
        setTimeout(() => setCopied(null), 1500);
    };

    return (
        <>
            <WebVitals />
            <main className='el-page'>
                <header className='el-nav'>
                    <Link href='/' className='el-logo' aria-label='John Leonardo home'>
                        John Leonardo
                    </Link>
                    <nav className='el-nav-links' aria-label='Primary navigation'>
                        <Link href='/apps' className='el-nav-link'>Apps</Link>
                        <Link href='/blog' className='el-nav-link'>Blog</Link>
                        <Link href='/apps/resume' className='el-nav-link'>Resume</Link>
                    </nav>
                    <div className='el-nav-actions'>
                        <Link href='/apps/chat' className='el-nav-link'>Chat</Link>
                        <Link href={`mailto:${strings.EMAIL}`} className='el-btn el-btn-dark el-btn-sm'>
                            Contact
                        </Link>
                    </div>
                </header>

                <section className='el-hero el-hero-page'>
                    <div className='el-hero-inner'>
                        <div className='el-hero-copy'>
                            <h1>Link Shortener</h1>
                            <p className='el-hero-sub'>
                                Create short links with built-in analytics tracking.
                            </p>
                        </div>
                    </div>
                </section>

                <section className='el-section el-sentiment'>
                    {!shortenedUrl && !analyticsAuthenticated && (
                        <>
                            <div className='el-chart-block'>
                                <div className='el-chart-title'>
                                    <span className='el-chart-title-label'>
                                        <LinkIcon aria-hidden='true' />
                                        Create Short Link
                                    </span>
                                </div>
                                <div className='el-file-card'>
                                    <input
                                        value={url}
                                        onChange={e => setUrl(e.target.value)}
                                        placeholder='Enter URL to shorten...'
                                        className='el-textarea el-el-input'
                                    />
                                    <button
                                        onClick={handleShorten}
                                        disabled={isShortening || !url.trim()}
                                        className='el-btn el-btn-dark el-generate-btn'
                                    >
                                        <LinkIcon aria-hidden='true' />
                                        {isShortening ? 'Shortening...' : 'Generate Link'}
                                    </button>
                                </div>
                            </div>

                            <div className='el-chart-block'>
                                <div className='el-chart-title'>
                                    <span className='el-chart-title-label'>
                                        <ChartBarIcon aria-hidden='true' />
                                        View Analytics
                                    </span>
                                </div>
                                <div className='el-file-card'>
                                    <input
                                        type='password'
                                        value={analyticsPasswordInput}
                                        onChange={e => setAnalyticsPasswordInput(e.target.value)}
                                        placeholder='Enter access key...'
                                        className='el-textarea el-el-input'
                                    />
                                    <button
                                        onClick={handleViewAnalytics}
                                        disabled={analyticsLoading || !analyticsPasswordInput.trim()}
                                        className='el-btn el-btn-light el-generate-btn'
                                    >
                                        <ChartBarIcon aria-hidden='true' />
                                        {analyticsLoading ? 'Loading...' : 'View Stats'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {shortenedUrl && !analyticsAuthenticated && (
                        <div className='el-chart-block'>
                            <div className='el-chart-title'>
                                <span className='el-chart-title-label'>
                                    <CheckIcon aria-hidden='true' />
                                    Link Created
                                </span>
                                <span className='el-chart-pill'>save your key</span>
                            </div>
                            <div className='el-file-card'>
                                <div className='ecl-copy-label'>Short Link</div>
                                <div className='el-copy-row'>
                                    <div className='el-copy-box'>{shortenedUrl}</div>
                                    <button
                                        onClick={() => copyToClipboard(shortenedUrl, 'link')}
                                        className='el-btn el-btn-dark el-btn-sm'
                                    >
                                        <ClipboardIcon aria-hidden='true' />
                                        {copied === 'link' ? 'Copied' : 'Copy'}
                                    </button>
                                </div>

                                <div className='ecl-copy-label ecl-copy-label-key'>
                                    Analytics Key
                                    <span className='el-key-tag'>save this</span>
                                </div>
                                <div className='el-copy-row'>
                                    <div className='el-copy-box el-copy-box-key'>{analyticsPassword}</div>
                                    <button
                                        onClick={() => copyToClipboard(analyticsPassword!, 'key')}
                                        className='el-btn el-btn-light el-btn-sm'
                                    >
                                        <ClipboardIcon aria-hidden='true' />
                                        {copied === 'key' ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                                <p className='ecl-key-warning'>
                                    This key is the only way to view analytics for this link. If you lose it, the stats are gone.
                                </p>
                            </div>
                        </div>
                    )}

                    {analyticsAuthenticated && (
                        <>
                            <div className='el-chart-block'>
                                <div className='el-chart-title'>
                                    <span className='el-chart-title-label'>
                                        <ChartBarIcon aria-hidden='true' />
                                        Analytics Dashboard
                                    </span>
                                    <button
                                        onClick={() => { setAnalyticsAuthenticated(false); setAnalyticsData([]); }}
                                        className='el-btn el-btn-light el-btn-sm'
                                    >
                                        Close
                                    </button>
                                </div>
                                <div className='el-copy-box el-copy-box-url'>{analyticsOriginalUrl}</div>
                            </div>

                            <div className='el-stat-grid'>
                                <div className='el-stat-card'>
                                    <span className='el-stat-label'>Total Clicks</span>
                                    <div className='el-stat-value'>
                                        {analyticsData.reduce((s, d) => s + d.clicks, 0).toLocaleString()}
                                    </div>
                                </div>
                                <div className='el-stat-card'>
                                    <span className='el-stat-label'>Daily Average</span>
                                    <div className='el-stat-value'>
                                        {(analyticsData.reduce((s, d) => s + d.clicks, 0) / (analyticsData.length || 1)).toFixed(1)}
                                    </div>
                                </div>
                            </div>

                            <div className='el-chart-block'>
                                <div className='el-chart-title'>
                                    <span className='el-chart-title-label'>
                                        Click Activity (30 Days)
                                    </span>
                                </div>
                                <div className='el-chart-card'>
                                    <div className='el-chart-inner'>
                                        <Line data={chartData} options={chartOptions} />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </section>

                <footer className='el-footer'>
                    <div className='el-footer-inner'>
                        <span className='el-footer-logo'>John Leonardo</span>
                        <div className='el-footer-links'>
                            <a href={strings.GITHUB_URL} target='_blank' rel='noreferrer'>GitHub</a>
                            <a href={strings.LINKEDIN_URL} target='_blank' rel='noreferrer'>LinkedIn</a>
                            <a href={`mailto:${strings.EMAIL}`}>{strings.EMAIL}</a>
                        </div>
                        <span className='el-footer-copy'>© 2026. All rights reserved.</span>
                    </div>
                </footer>
            </main>
        </>
    );
}
