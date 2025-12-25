'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                setShortenedUrl(null); // Clear shorten result view if switch to analytics
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
            borderColor: '#8b5cf6', // purple-500
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: '#8b5cf6',
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

    return (
        <>
            <WebVitals />
            <main className='relative h-screen bg-[#fafbff] overflow-hidden selection:bg-[var(--purple-2)] selection:text-[var(--purple-4)] flex flex-col md:flex-row'>

                {/* Mobile Header */}
                <header className='md:hidden flex items-center justify-between p-4 border-b border-[var(--border-light)] bg-white/80 backdrop-blur-md z-50'>
                    <Link href='/apps' className='text-sm font-bold uppercase tracking-widest text-muted hover:text-[var(--purple-4)]'>
                        ← Apps
                    </Link>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className='px-3 py-1.5 bg-white border border-[var(--border-light)] rounded-full shadow-sm text-xs font-bold uppercase tracking-wider text-[var(--fg-4)] flex items-center gap-1.5'
                    >
                        <span>Menu</span>
                        <span className='text-[10px]'>▼</span>
                    </button>
                </header>

                {/* Left Sidebar (Desktop) */}
                <aside className='hidden md:flex flex-col w-80 h-full border-r border-[var(--border-light)] bg-white/50 backdrop-blur-xl z-20'>
                    <div className='p-6 border-b border-[var(--border-light)]'>
                        <div className='flex items-center gap-3 mb-6'>
                            <div className='w-3 h-3 rounded-full bg-[var(--purple-4)]' />
                            <span className='font-bold uppercase tracking-widest text-sm text-[var(--fg-4)]'>Control Center</span>
                        </div>
                        <nav className='flex flex-col gap-2'>
                            <Link href='/apps' className='text-xs font-bold uppercase tracking-wider text-muted hover:text-[var(--purple-4)] transition-colors flex items-center gap-2'>
                                <span>←</span> Back to Apps
                            </Link>
                        </nav>
                    </div>

                    <div className='flex-grow overflow-y-auto p-6 space-y-8'>
                        <div>
                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Create Link</h3>
                            <div className='space-y-3'>
                                <input
                                    value={url}
                                    onChange={e => setUrl(e.target.value)}
                                    placeholder='Enter URL to shorten...'
                                    className='w-full bg-white border border-[var(--border-light)] rounded-xl p-3 text-sm text-[var(--fg-4)] focus:border-[var(--purple-4)] focus:ring-2 focus:ring-[var(--purple-1)] outline-none transition-all placeholder:text-muted/50'
                                />
                                <button
                                    onClick={handleShorten}
                                    disabled={isShortening || !url.trim()}
                                    className='w-full py-3 bg-[var(--fg-4)] hover:bg-[var(--purple-4)] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
                                >
                                    {isShortening ? 'Shortening...' : 'Generate Link'}
                                </button>
                            </div>
                        </div>

                        <div className='pt-6 border-t border-[var(--border-light)]'>
                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Analytics Access</h3>
                            <div className='space-y-3'>
                                <input
                                    type='password'
                                    value={analyticsPasswordInput}
                                    onChange={e => setAnalyticsPasswordInput(e.target.value)}
                                    placeholder='Enter access key...'
                                    className='w-full bg-white border border-[var(--border-light)] rounded-xl p-3 text-sm text-[var(--fg-4)] focus:border-[var(--purple-4)] focus:ring-2 focus:ring-[var(--purple-1)] outline-none transition-all placeholder:text-muted/50'
                                />
                                <button
                                    onClick={handleViewAnalytics}
                                    disabled={analyticsLoading || !analyticsPasswordInput.trim()}
                                    className='w-full py-3 bg-white border border-[var(--border-light)] hover:border-[var(--purple-4)] text-[var(--fg-4)] hover:text-[var(--purple-4)] font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
                                >
                                    {analyticsLoading ? 'Loading...' : 'View Stats'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className='p-4 border-t border-[var(--border-light)]'>
                        <div className='p-4 bg-[var(--bg-2)] rounded-xl'>
                            <div className='text-[10px] text-muted uppercase tracking-wider font-bold mb-1'>Service Status</div>
                            <div className='flex items-center gap-2'>
                                <div className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
                                <span className='text-xs font-medium text-[var(--fg-4)]'>Operational</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className='flex-grow flex flex-col h-full relative bg-[#fafbff] overflow-hidden'>
                    {/* Floating decorations */}
                    <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--purple-1)] opacity-40 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2' />

                    <div className='flex-grow overflow-y-auto p-4 md:p-8 scrollbar-hide z-10'>
                        {/* Empty State */}
                        {!shortenedUrl && !analyticsAuthenticated && (
                            <div className='h-full flex flex-col items-center justify-center opacity-100 text-center max-w-sm mx-auto p-8'>
                                <div className='w-20 h-20 bg-[var(--purple-1)] rounded-full flex items-center justify-center mb-6 text-4xl opacity-40'>🔗</div>
                                <h2 className='text-3xl font-bold text-[var(--fg-4)] mb-2'>Ready to Shorten</h2>
                                <p className='text-muted max-w-sm font-medium mb-8'>Use the sidebar to create new short links or view analytics for existing ones.</p>

                                {/* Mobile Input Card (Visible only on mobile/empty state) */}
                                <div className='block md:hidden w-full bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-[var(--purple-4)] relative overflow-hidden'>
                                    <div className="absolute top-0 left-0 w-full h-1 bg-[var(--purple-4)]" />
                                    <input
                                        value={url}
                                        onChange={e => setUrl(e.target.value)}
                                        placeholder='Paste URL here...'
                                        className='w-full bg-[var(--bg-2)] border border-[var(--border-light)] rounded-xl p-3 text-sm text-[var(--fg-4)] focus:border-[var(--purple-4)] focus:ring-2 focus:ring-[var(--purple-1)] outline-none mb-3 placeholder:text-muted/50'
                                    />
                                    <button
                                        onClick={() => handleShorten()}
                                        disabled={isShortening || !url.trim()}
                                        className='w-full py-3 bg-[var(--purple-4)] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50'
                                    >
                                        {isShortening ? 'Shortening...' : 'Generate Short Link'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Result View */}
                        {shortenedUrl && !analyticsAuthenticated && (
                            <div className='max-w-2xl mx-auto w-full animate-fade-in-up pt-12'>
                                <div className='bg-white rounded-2xl shadow-lg border border-[var(--border-light)] overflow-hidden'>
                                    <div className='p-6 border-b border-[var(--border-light)] bg-[var(--bg-2)] flex justify-between items-center'>
                                        <div className='flex items-center gap-3'>
                                            <div className='w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold'>✓</div>
                                            <span className='text-sm font-bold uppercase tracking-widest text-[var(--fg-4)]'>Link Created</span>
                                        </div>
                                    </div>

                                    <div className='p-8 space-y-8'>
                                        <div className='space-y-2'>
                                            <label className='text-xs font-bold uppercase tracking-wider text-muted'>Short Link</label>
                                            <div className='flex items-center gap-3'>
                                                <div className='flex-grow bg-[var(--bg-2)] p-4 rounded-xl border border-[var(--border-light)] text-[var(--purple-4)] font-medium font-mono text-sm break-all'>
                                                    {shortenedUrl}
                                                </div>
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(shortenedUrl)}
                                                    className='p-4 bg-[var(--fg-4)] hover:bg-[var(--purple-4)] text-white rounded-xl transition-all shadow-md active:scale-95'
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                        </div>

                                        <div className='space-y-2'>
                                            <div className='flex justify-between items-center'>
                                                <label className='text-xs font-bold uppercase tracking-wider text-muted'>Analytics Key</label>
                                                <span className='text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-wider'>Save This</span>
                                            </div>
                                            <div className='flex items-center gap-3'>
                                                <div className='flex-grow bg-red-50 p-4 rounded-xl border border-red-100 text-red-600 font-bold font-mono text-sm break-all'>
                                                    {analyticsPassword}
                                                </div>
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(analyticsPassword!)}
                                                    className='p-4 bg-white border border-[var(--border-light)] hover:border-red-200 text-red-500 rounded-xl transition-all shadow-sm active:scale-95 hover:bg-red-50'
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Analytics Dashboard */}
                        {analyticsAuthenticated && (
                            <div className='max-w-4xl mx-auto w-full space-y-8 animate-fade-in-up pb-12'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <h1 className='text-2xl font-bold text-[var(--fg-4)]'>Analytics Dashboard</h1>
                                        <p className='text-sm text-muted mt-1 truncate max-w-md'>{analyticsOriginalUrl}</p>
                                    </div>
                                    <button
                                        onClick={() => { setAnalyticsAuthenticated(false); setAnalyticsData([]); }}
                                        className='px-4 py-2 bg-white border border-[var(--border-light)] rounded-lg text-xs font-bold uppercase tracking-wider text-muted hover:text-red-500 hover:border-red-100 transition-colors'
                                    >
                                        Close
                                    </button>
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div className='bg-white p-6 rounded-2xl border border-[var(--border-light)] shadow-sm'>
                                        <span className='text-[10px] font-bold uppercase tracking-wider text-muted block mb-2'>Total Clicks</span>
                                        <div className='text-4xl font-bold text-[var(--purple-4)]'>
                                            {analyticsData.reduce((s, d) => s + d.clicks, 0).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className='bg-white p-6 rounded-2xl border border-[var(--border-light)] shadow-sm'>
                                        <span className='text-[10px] font-bold uppercase tracking-wider text-muted block mb-2'>Avg. Daily</span>
                                        <div className='text-4xl font-bold text-[var(--fg-4)]'>
                                            {(analyticsData.reduce((s, d) => s + d.clicks, 0) / (analyticsData.length || 1)).toFixed(1)}
                                        </div>
                                    </div>
                                </div>

                                <div className='bg-white p-6 md:p-8 rounded-2xl border border-[var(--border-light)] shadow-sm'>
                                    <div className='mb-6'>
                                        <h3 className='text-sm font-bold uppercase tracking-wider text-[var(--fg-4)]'>Click Activity (30 Days)</h3>
                                    </div>
                                    <div className='h-72'>
                                        <Line data={chartData} options={chartOptions} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className='fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 md:hidden' onClick={() => setIsMobileMenuOpen(false)}>
                        <div className='w-full max-w-sm bg-white rounded-2xl shadow-2xl animate-slide-up overflow-hidden border border-[var(--border-light)]' onClick={e => e.stopPropagation()}>
                            <div className='p-4 border-b border-[var(--border-light)] flex justify-between items-center bg-[var(--bg-2)]'>
                                <span className='text-xs font-bold uppercase tracking-widest text-[var(--fg-4)]'>Control Center</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className='w-6 h-6 rounded-full bg-white border border-[var(--border-light)] flex items-center justify-center text-muted'>✕</button>
                            </div>
                            <div className='p-4 space-y-6'>
                                <div>
                                    <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Create Link</h3>
                                    <div className='space-y-3'>
                                        <input
                                            value={url}
                                            onChange={e => setUrl(e.target.value)}
                                            placeholder='Enter URL to shorten...'
                                            className='w-full bg-[var(--bg-2)] border border-[var(--border-light)] rounded-xl p-3 text-sm text-[var(--fg-4)] outline-none'
                                        />
                                        <button
                                            onClick={() => { handleShorten(); setIsMobileMenuOpen(false); }}
                                            disabled={isShortening || !url.trim()}
                                            className='w-full py-3 bg-[var(--fg-4)] text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-md'
                                        >
                                            Generate
                                        </button>
                                    </div>
                                </div>
                                <div className='pt-6 border-t border-[var(--border-light)]'>
                                    <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Analytics</h3>
                                    <div className='space-y-3'>
                                        <input
                                            type='password'
                                            value={analyticsPasswordInput}
                                            onChange={e => setAnalyticsPasswordInput(e.target.value)}
                                            placeholder='Enter access key...'
                                            className='w-full bg-[var(--bg-2)] border border-[var(--border-light)] rounded-xl p-3 text-sm text-[var(--fg-4)] outline-none'
                                        />
                                        <button
                                            onClick={() => { handleViewAnalytics(); setIsMobileMenuOpen(false); }}
                                            disabled={analyticsLoading || !analyticsPasswordInput.trim()}
                                            className='w-full py-3 bg-white border border-[var(--border-light)] text-[var(--fg-4)] font-bold text-xs uppercase tracking-widest rounded-xl shadow-sm'
                                        >
                                            View Stats
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
