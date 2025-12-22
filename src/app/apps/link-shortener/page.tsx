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
            borderColor: '#3EAF7C',
            backgroundColor: 'rgba(62, 175, 124, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: '#3EAF7C',
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } } }
        }
    };

    return (
        <>
            <WebVitals />
            <main className='min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4 md:p-8 selection:bg-[var(--color-accent)] selection:text-[var(--color-bg)]'>
                <div className='fixed inset-0 overflow-hidden pointer-events-none'>
                    <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(62,175,124,0.03),transparent_60%)]' />
                </div>

                <div className={`w-full max-w-6xl h-[85vh] transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className='terminal-window flex flex-col h-full'>
                        <div className='terminal-header'>
                            <div className='terminal-controls'>
                                <div className='terminal-control red' />
                                <div className='terminal-control yellow' />
                                <div className='terminal-control green' />
                            </div>
                            <div className='terminal-title'>johnleonardo — ~/link-proxy-node</div>
                        </div>

                        <div className='terminal-split flex-grow overflow-hidden'>
                            {/* Left Sidebar: Logic & Access */}
                            <div className='terminal-pane border-r border-[var(--color-border)] hidden md:flex flex-col gap-8'>
                                <div>
                                    <div className='flex items-center gap-2 mb-6 text-[var(--color-accent)]'>
                                        <span className='terminal-prompt'>➜</span>
                                        <span className='text-sm uppercase tracking-widest font-bold'>Gateway</span>
                                    </div>
                                    <nav className='flex flex-col gap-4 mb-8'>
                                        <Link href='/' className='text-lg hover:text-[var(--color-accent)] transition-colors'>~/home</Link>
                                        <Link href='/apps' className='text-lg hover:text-[var(--color-accent)] transition-colors'>~/apps</Link>
                                    </nav>

                                    <div className='space-y-6 font-mono'>
                                        <div>
                                            <span className='text-[var(--color-text)] opacity-40 text-[10px] uppercase tracking-widest block mb-4'>$ spawn --proxy</span>
                                            <input
                                                value={url}
                                                onChange={e => setUrl(e.target.value)}
                                                placeholder='ENTER_URL...'
                                                className='w-full bg-black/40 border border-[var(--color-border)] rounded p-2 text-xs text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none mb-2'
                                            />
                                            <button
                                                onClick={handleShorten}
                                                disabled={isShortening || !url.trim()}
                                                className='w-full py-2 border border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-[10px] uppercase tracking-widest transition-all rounded'
                                            >
                                                {isShortening ? 'ENCODING...' : '[GENERATE_SHORT_ID]'}
                                            </button>
                                        </div>

                                        <div className='pt-6 border-t border-[var(--color-border)]'>
                                            <span className='text-[var(--color-text)] opacity-40 text-[10px] uppercase tracking-widest block mb-4'>$ view --analytics</span>
                                            <input
                                                type='password'
                                                value={analyticsPasswordInput}
                                                onChange={e => setAnalyticsPasswordInput(e.target.value)}
                                                placeholder='PROXY_PASS_KEY...'
                                                className='w-full bg-black/40 border border-[var(--color-border)] rounded p-2 text-xs text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none mb-2'
                                            />
                                            <button
                                                onClick={handleViewAnalytics}
                                                disabled={analyticsLoading || !analyticsPasswordInput.trim()}
                                                className='w-full py-2 border border-blue-500/30 hover:bg-blue-500/10 text-blue-400 text-[10px] uppercase tracking-widest transition-all rounded'
                                            >
                                                {analyticsLoading ? 'CONNECTING...' : '[FETCH_METRICS]'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className='mt-auto pt-8 border-t border-[var(--color-border)] opacity-30 font-mono text-[9px] uppercase tracking-tighter leading-relaxed'>
                                    "Redirect layer with real-time telemetry and access-controlled observability."
                                </div>
                            </div>

                            {/* Main Display: Results & Visuals */}
                            <div className='terminal-pane bg-black/20 flex flex-col p-8 overflow-y-auto w-full'>
                                {shortenedUrl && !analyticsAuthenticated && (
                                    <div className='max-w-2xl mx-auto w-full animate-reveal'>
                                        <div className='border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-8 rounded-lg space-y-6'>
                                            <div className='flex justify-between items-center border-b border-[var(--color-accent)]/10 pb-4'>
                                                <span className='text-[10px] font-mono text-[var(--color-accent)] uppercase tracking-widest'>Success: Resource_Generated</span>
                                                <span className='text-[9px] font-mono opacity-40 uppercase'>ID: {shortenedUrl.split('/').pop()}</span>
                                            </div>

                                            <div className='space-y-2'>
                                                <label className='text-[10px] font-mono opacity-40 uppercase'>Short_Proxy_Url</label>
                                                <div className='flex items-center gap-2'>
                                                    <div className='flex-grow bg-black/40 p-4 rounded font-mono text-sm text-[var(--color-accent)] break-all border border-[var(--color-border)]'>
                                                        {shortenedUrl}
                                                    </div>
                                                    <button onClick={() => navigator.clipboard.writeText(shortenedUrl)} className='p-4 border border-[var(--color-accent)] text-[var(--color-accent)] rounded hover:bg-[var(--color-accent)]/10'>
                                                        [COPY]
                                                    </button>
                                                </div>
                                            </div>

                                            <div className='space-y-2'>
                                                <div className='flex justify-between items-center'>
                                                    <label className='text-[10px] font-mono opacity-40 uppercase'>Access_Credential (REQUIRED_FOR_ANALYTICS)</label>
                                                    <span className='text-[9px] font-mono text-red-500 uppercase'>!!! SAVE_NOW !!!</span>
                                                </div>
                                                <div className='flex items-center gap-2'>
                                                    <div className='flex-grow bg-black/40 p-4 rounded font-mono text-sm text-yellow-500 break-all border border-yellow-500/20'>
                                                        {analyticsPassword}
                                                    </div>
                                                    <button onClick={() => navigator.clipboard.writeText(analyticsPassword!)} className='p-4 border border-yellow-500/50 text-yellow-500 rounded hover:bg-yellow-500/10'>
                                                        [COPY]
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {analyticsAuthenticated && (
                                    <div className='max-w-4xl mx-auto w-full space-y-10 animate-reveal pb-12'>
                                        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                                            <div className='border border-[var(--color-border)] p-6 rounded bg-black/40'>
                                                <span className='text-[10px] font-mono opacity-40 uppercase block mb-1'>Total_Requests</span>
                                                <div className='text-3xl font-bold font-mono text-[var(--color-accent)]'>
                                                    {analyticsData.reduce((s, d) => s + d.clicks, 0)}
                                                </div>
                                            </div>
                                            <div className='border border-[var(--color-border)] p-6 rounded bg-black/40'>
                                                <span className='text-[10px] font-mono opacity-40 uppercase block mb-1'>Avg_Daily_Load</span>
                                                <div className='text-3xl font-bold font-mono text-blue-400'>
                                                    {(analyticsData.reduce((s, d) => s + d.clicks, 0) / 30).toFixed(1)}
                                                </div>
                                            </div>
                                            <div className='border border-[var(--color-border)] p-6 rounded bg-black/40'>
                                                <span className='text-[10px] font-mono opacity-40 uppercase block mb-1'>Origin_Resolution</span>
                                                <div className='text-[11px] font-mono text-[var(--color-text-dim)] truncate mt-2'>
                                                    {analyticsOriginalUrl}
                                                </div>
                                            </div>
                                        </div>

                                        <div className='border border-[var(--color-border)] p-8 rounded bg-black/40'>
                                            <div className='flex items-center gap-2 mb-8 text-[var(--color-accent)]'>
                                                <span className='text-[10px] font-mono uppercase tracking-[0.3em] font-bold'>Request_Telemetry_Stream_30D</span>
                                            </div>
                                            <div className='h-64'>
                                                <Line data={chartData} options={chartOptions} />
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setAnalyticsAuthenticated(false)}
                                            className='text-[10px] font-mono text-[var(--color-text-dim)] hover:text-white uppercase tracking-widest'
                                        >
                                            [TERMINATE_SESSION]
                                        </button>
                                    </div>
                                )}

                                {!shortenedUrl && !analyticsAuthenticated && (
                                    <div className='flex flex-col items-center justify-center flex-grow opacity-20'>
                                        <div className='text-4xl font-mono mb-4 text-[var(--color-accent)]'>[READY_TO_ENCODE]</div>
                                        <div className='text-xs font-mono uppercase tracking-[0.4em] text-center max-w-sm leading-relaxed'>
                                            Enter upstream resource location to establish secondary proxy tunnel
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Console decoration */}
                    <div className='mt-4 flex items-center justify-between text-[10px] font-mono text-[var(--color-text-dim)] opacity-40 uppercase tracking-[0.2em] px-4'>
                        <div className='flex gap-6'>
                            <span>Prot: HTTPS/TLS_1.3</span>
                            <span>Latency: 14ms</span>
                        </div>
                        <span>Status: pool_ready</span>
                    </div>
                </div>
            </main>
        </>
    );
}
