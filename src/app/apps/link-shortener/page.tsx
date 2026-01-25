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
    DevicePhoneMobileIcon,
    PencilSquareIcon,
    DocumentTextIcon,
    LinkIcon,
    ChartBarIcon,
    ClipboardIcon,
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
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: '#6366f1',
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#64748b', font: { size: 10, family: 'sans-serif' } }
            },
            y: {
                grid: { color: 'rgba(0,0,0,0.05)' },
                ticks: { color: '#64748b', font: { size: 10, family: 'sans-serif' }, stepSize: 1 }
            }
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <>
            <WebVitals />
            <main className='notion-page'>
                <header className={`notion-header ${isLoaded ? 'loaded' : ''}`}>
                    <div className='notion-nav' style={{ justifyContent: 'space-between', maxWidth: '1100px' }}>
                        <Link href='/' className='notion-nav-link' style={{ fontWeight: 600 }}>
                            {strings.NAME}
                        </Link>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Link href='/apps' className='notion-nav-link'>
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

                <div className={`notion-content ${isLoaded ? 'loaded' : ''}`} style={{ maxWidth: '900px' }}>
                    <div className='notion-title-block'>
                        <h1 className='notion-title'>Link Shortener</h1>
                        <div className='notion-subtitle'>Create short links with built-in analytics tracking</div>
                    </div>

                    <div className='notion-divider' />

                    {!shortenedUrl && !analyticsAuthenticated && (
                        <>
                            <div className='notion-section'>
                                <div className='notion-section-title'>
                                    <LinkIcon className='notion-section-icon' />
                                    Create Short Link
                                </div>
                                <div style={{ marginTop: '16px' }}>
                                    <input
                                        value={url}
                                        onChange={e => setUrl(e.target.value)}
                                        placeholder='Enter URL to shorten...'
                                        className='notion-input'
                                        style={{
                                            marginBottom: '12px',
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: '6px',
                                            border: '1px solid rgba(55, 53, 47, 0.16)',
                                            backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                            fontSize: '14px',
                                            lineHeight: '20px',
                                            color: '#37352f',
                                            outline: 'none',
                                            transition: 'border-color 0.2s',
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#a78bfa'}
                                        onBlur={(e) => e.target.style.borderColor = 'rgba(55, 53, 47, 0.16)'}
                                    />
                                    <button
                                        onClick={handleShorten}
                                        disabled={isShortening || !url.trim()}
                                        className='notion-action-btn notion-action-primary'
                                    >
                                        <LinkIcon className='notion-action-icon' />
                                        {isShortening ? 'Shortening...' : 'Generate Link'}
                                    </button>
                                </div>
                            </div>

                            <div className='notion-divider' />

                            <div className='notion-section'>
                                <div className='notion-section-title'>
                                    <ChartBarIcon className='notion-section-icon' />
                                    View Analytics
                                </div>
                                <div style={{ marginTop: '16px' }}>
                                    <input
                                        type='password'
                                        value={analyticsPasswordInput}
                                        onChange={e => setAnalyticsPasswordInput(e.target.value)}
                                        placeholder='Enter access key...'
                                        className='notion-input'
                                        style={{
                                            marginBottom: '12px',
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: '6px',
                                            border: '1px solid rgba(55, 53, 47, 0.16)',
                                            backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                            fontSize: '14px',
                                            lineHeight: '20px',
                                            color: '#37352f',
                                            outline: 'none',
                                            transition: 'border-color 0.2s',
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#a78bfa'}
                                        onBlur={(e) => e.target.style.borderColor = 'rgba(55, 53, 47, 0.16)'}
                                    />
                                    <button
                                        onClick={handleViewAnalytics}
                                        disabled={analyticsLoading || !analyticsPasswordInput.trim()}
                                        className='notion-action-btn'
                                    >
                                        <ChartBarIcon className='notion-action-icon' />
                                        {analyticsLoading ? 'Loading...' : 'View Stats'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {shortenedUrl && !analyticsAuthenticated && (
                        <div className='notion-section'>
                            <div className='notion-card' style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(55, 53, 47, 0.09)' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', fontWeight: 700 }}>✓</div>
                                    <span style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Link Created</span>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Short Link</label>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                        <div style={{ flex: 1, padding: '12px 16px', backgroundColor: 'rgba(55, 53, 47, 0.04)', borderRadius: '8px', fontFamily: 'monospace', fontSize: '14px', color: '#6366f1', fontWeight: 500, wordBreak: 'break-all' }}>
                                            {shortenedUrl}
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(shortenedUrl)}
                                            className='notion-action-btn notion-action-primary'
                                            style={{ padding: '12px 16px' }}
                                        >
                                            <ClipboardIcon className='notion-action-icon' />
                                            Copy
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Analytics Key</label>
                                        <span style={{ fontSize: '9px', fontWeight: 700, color: '#dc2626', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>Save This</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ flex: 1, padding: '12px 16px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', fontFamily: 'monospace', fontSize: '14px', color: '#dc2626', fontWeight: 600, wordBreak: 'break-all' }}>
                                            {analyticsPassword}
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(analyticsPassword!)}
                                            className='notion-action-btn'
                                            style={{ padding: '12px 16px', color: '#dc2626' }}
                                        >
                                            <ClipboardIcon className='notion-action-icon' />
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {analyticsAuthenticated && (
                        <div className='notion-section'>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div>
                                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#37352f', marginBottom: '4px' }}>Analytics Dashboard</h2>
                                    <p style={{ fontSize: '13px', color: 'rgba(55, 53, 47, 0.6)', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{analyticsOriginalUrl}</p>
                                </div>
                                <button
                                    onClick={() => { setAnalyticsAuthenticated(false); setAnalyticsData([]); }}
                                    className='notion-action-btn'
                                    style={{ color: '#dc2626' }}
                                >
                                    Close
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                                <div className='notion-card' style={{ padding: '20px' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Clicks</span>
                                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#6366f1', marginTop: '4px' }}>
                                        {analyticsData.reduce((s, d) => s + d.clicks, 0).toLocaleString()}
                                    </div>
                                </div>
                                <div className='notion-card' style={{ padding: '20px' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Daily Average</span>
                                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#37352f', marginTop: '4px' }}>
                                        {(analyticsData.reduce((s, d) => s + d.clicks, 0) / (analyticsData.length || 1)).toFixed(1)}
                                    </div>
                                </div>
                            </div>

                            <div className='notion-card' style={{ padding: '24px' }}>
                                <h3 style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(55, 53, 47, 0.5)', marginBottom: '16px' }}>Click Activity (30 Days)</h3>
                                <div style={{ height: '280px' }}>
                                    <Line data={chartData} options={chartOptions} />
                                </div>
                            </div>
                        </div>
                    )}

                    <footer className='notion-footer'>
                        © 2026 {strings.NAME}
                    </footer>
                </div>
            </main>
        </>
    );
}
