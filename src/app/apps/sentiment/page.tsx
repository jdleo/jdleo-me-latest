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
    Filler,
    Title,
    Tooltip as ChartTooltip,
    Legend,
} from 'chart.js';
import {
    ChartBarIcon,
    SignalIcon,
    ArrowDownTrayIcon,
    ArrowUpRightIcon,
} from '@heroicons/react/24/outline';
import sentimentData from './data.json';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Title, ChartTooltip, Legend);

const labels = sentimentData.map((w) => {
    const d = new Date(w.start);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
});

// Linear regression for trendline
const avgScores = sentimentData.map((w) => w.avg);
const n = avgScores.length;
const xMean = (n - 1) / 2;
const yMean = avgScores.reduce((a, b) => a + b, 0) / n;
const slope = avgScores.reduce((sum, y, i) => sum + (i - xMean) * (y - yMean), 0) /
    avgScores.reduce((sum, _, i) => sum + (i - xMean) ** 2, 0);
const intercept = yMean - slope * xMean;
const trendline = avgScores.map((_, i) => +(intercept + slope * i).toFixed(3));

export default function Sentiment() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const scoreChartData = {
        labels,
        datasets: [
            {
                label: 'Avg Sentiment Score',
                data: sentimentData.map((w) => w.avg),
                borderColor: '#111110',
                backgroundColor: 'rgba(17, 17, 16, 0.05)',
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: '#fbfbf9',
                pointBorderColor: '#111110',
                pointBorderWidth: 2,
                pointHoverBackgroundColor: '#111110',
                pointHoverBorderColor: '#fbfbf9',
                tension: 0.35,
                fill: true,
                order: 1,
            },
            {
                label: 'Trend',
                data: trendline,
                borderColor: '#b9b9b1',
                borderWidth: 1.5,
                borderDash: [6, 4],
                pointRadius: 0,
                pointHoverRadius: 0,
                tension: 0,
                fill: false,
                order: 0,
            },
        ],
    };

    const scoreChartOptions = {
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
                padding: 12,
                cornerRadius: 10,
                titleFont: { size: 13, weight: 'bold' as const },
                bodyFont: { size: 12 },
                callbacks: {
                    title: (items: any) => sentimentData[items[0].dataIndex].display,
                    label: (item: any) => {
                        const w = sentimentData[item.dataIndex];
                        return `Score: ${w.avg} / 5.0  (${w.total} articles)`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    font: { size: 10 },
                    color: '#82827c',
                    maxRotation: 45,
                    autoSkip: true,
                    maxTicksLimit: 16,
                },
                border: { display: false },
            },
            y: {
                min: 1,
                max: 5,
                grid: { color: '#e7e7e0' },
                ticks: {
                    font: { size: 11 },
                    color: '#82827c',
                    stepSize: 0.5,
                    callback: (value: any) => {
                        const map: Record<number, string> = { 1: '1 - Very Neg', 2: '2 - Negative', 3: '3 - Neutral', 4: '4 - Positive', 5: '5 - Very Pos' };
                        return map[value] || value;
                    },
                },
                border: { display: false },
            },
        },
        interaction: {
            intersect: false,
            mode: 'index' as const,
        },
    };

    const breakdownChartData = {
        labels,
        datasets: [
            {
                label: 'Very Positive',
                data: sentimentData.map((w) => w.veryPositive),
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.09)',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: '#8b5cf6',
                tension: 0.35,
                fill: true,
            },
            {
                label: 'Positive',
                data: sentimentData.map((w) => w.positive),
                borderColor: '#16a34a',
                backgroundColor: 'rgba(22, 163, 74, 0.08)',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: '#16a34a',
                tension: 0.35,
                fill: true,
            },
            {
                label: 'Neutral',
                data: sentimentData.map((w) => w.neutral),
                borderColor: '#a3a3a3',
                backgroundColor: 'rgba(163, 163, 163, 0.08)',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: '#a3a3a3',
                tension: 0.35,
                fill: true,
            },
            {
                label: 'Negative',
                data: sentimentData.map((w) => w.negative),
                borderColor: '#ea580c',
                backgroundColor: 'rgba(234, 88, 12, 0.08)',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: '#ea580c',
                tension: 0.35,
                fill: true,
            },
            {
                label: 'Very Negative',
                data: sentimentData.map((w) => w.veryNegative),
                borderColor: '#dc2626',
                backgroundColor: 'rgba(220, 38, 38, 0.08)',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: '#dc2626',
                tension: 0.35,
                fill: true,
            },
        ],
    };

    const breakdownChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                align: 'end' as const,
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 16,
                    font: { size: 11, weight: 600 as const },
                    color: '#4d4d4a',
                },
            },
            tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#111110',
                bodyColor: '#4d4d4a',
                borderColor: '#e2e2da',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 10,
                titleFont: { size: 13, weight: 'bold' as const },
                bodyFont: { size: 12 },
                callbacks: {
                    title: (items: any) => sentimentData[items[0].dataIndex].display,
                    label: (item: any) => `${item.dataset.label}: ${item.raw}%`,
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    font: { size: 10 },
                    color: '#82827c',
                    maxRotation: 45,
                    autoSkip: true,
                    maxTicksLimit: 16,
                },
                border: { display: false },
            },
            y: {
                min: 0,
                max: 60,
                grid: { color: '#e7e7e0' },
                ticks: {
                    font: { size: 11 },
                    color: '#82827c',
                    callback: (value: any) => `${value}%`,
                },
                border: { display: false },
            },
        },
        interaction: {
            intersect: false,
            mode: 'index' as const,
        },
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
                            <h1>AI Sentiment</h1>
                            <p className='el-hero-sub'>
                                Tracking public sentiment toward AI over time — 250 articles a week,
                                classified and aggregated across 232 weeks.
                            </p>
                        </div>
                    </div>
                </section>

                <section className='el-section el-sentiment'>
                    <div className='el-notice'>
                        <div className='el-eyebrow'>
                            <span className='el-eyebrow-label'>Archive — data is stale</span>
                            <span className='el-eyebrow-date'>Last update: {sentimentData[sentimentData.length - 1].display}</span>
                        </div>
                        <p className='el-notice-body'>
                            This dataset is no longer updated. Pulling 250 articles a week through Exa got
                            genuinely expensive, so I let it run out. That said — if even one person wants
                            this refreshed, I&apos;d genuinely bring it back. Just reach out.
                        </p>
                        <a href={`mailto:${strings.EMAIL}?subject=Refresh%20AI%20Sentiment`} className='el-btn el-btn-light el-btn-sm'>
                            Ask me to refresh it
                            <ArrowUpRightIcon aria-hidden='true' />
                        </a>
                    </div>

                    <div className='el-methodology'>
                        <p>
                            Every week, 250 articles about AI are collected via Exa search and classified
                            into 5 sentiment categories using <code className='el-inline-code'>openai/gpt-oss-120b</code>.
                            The results are aggregated to show how public perception of AI shifts over time.
                        </p>
                        <p className='el-methodology-credit'>
                            Data collected and curated by John Leonardo. If you use it, credit the source.
                        </p>
                        <button
                            onClick={() => {
                                const blob = new Blob([JSON.stringify(sentimentData, null, 2)], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'ai-sentiment-data.json';
                                a.click();
                                URL.revokeObjectURL(url);
                            }}
                            className='el-btn el-btn-light el-btn-sm'
                        >
                            <ArrowDownTrayIcon aria-hidden='true' />
                            Download raw data
                        </button>
                    </div>

                    <div className='el-chart-block'>
                        <div className='el-chart-title'>
                            <span className='el-chart-title-label'>
                                <SignalIcon aria-hidden='true' />
                                Aggregate Sentiment Score
                            </span>
                            <span className='el-chart-pill'>{sentimentData.length} weeks</span>
                        </div>
                        <div className='el-chart-card'>
                            <Line data={scoreChartData} options={scoreChartOptions} />
                        </div>
                    </div>

                    <div className='el-chart-block'>
                        <div className='el-chart-title'>
                            <span className='el-chart-title-label'>
                                <ChartBarIcon aria-hidden='true' />
                                Sentiment Breakdown
                            </span>
                            <span className='el-chart-pill'>% distribution</span>
                        </div>
                        <div className='el-chart-card el-chart-card-tall'>
                            <Line data={breakdownChartData} options={breakdownChartOptions} />
                        </div>
                    </div>
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
