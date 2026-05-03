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
                borderColor: '#8dd8ff',
                backgroundColor: 'rgba(141, 216, 255, 0.11)',
                borderWidth: 2.5,
                pointRadius: 4,
                pointHoverRadius: 7,
                pointBackgroundColor: '#050505',
                pointBorderColor: '#8dd8ff',
                pointBorderWidth: 2,
                pointHoverBackgroundColor: '#8dd8ff',
                pointHoverBorderColor: '#050505',
                tension: 0.35,
                fill: true,
                order: 1,
            },
            {
                label: 'Trend',
                data: trendline,
                borderColor: 'rgba(185, 247, 234, 0.68)',
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
                backgroundColor: '#080808',
                titleColor: '#fff',
                bodyColor: 'rgba(255, 255, 255, 0.72)',
                borderColor: 'rgba(255, 255, 255, 0.14)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
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
                    color: 'rgba(255, 255, 255, 0.42)',
                    maxRotation: 45,
                    autoSkip: true,
                    maxTicksLimit: 16,
                },
                border: { display: false },
            },
            y: {
                min: 1,
                max: 5,
                grid: { color: 'rgba(255, 255, 255, 0.08)' },
                ticks: {
                    font: { size: 11 },
                    color: 'rgba(255, 255, 255, 0.42)',
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
                borderColor: '#a78bfa',
                backgroundColor: 'rgba(167, 139, 250, 0.13)',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: '#a78bfa',
                tension: 0.35,
                fill: true,
            },
            {
                label: 'Positive',
                data: sentimentData.map((w) => w.positive),
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.12)',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: '#22c55e',
                tension: 0.35,
                fill: true,
            },
            {
                label: 'Neutral',
                data: sentimentData.map((w) => w.neutral),
                borderColor: '#a3a3a3',
                backgroundColor: 'rgba(163, 163, 163, 0.12)',
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
                borderColor: '#f97316',
                backgroundColor: 'rgba(249, 115, 22, 0.12)',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: '#f97316',
                tension: 0.35,
                fill: true,
            },
            {
                label: 'Very Negative',
                data: sentimentData.map((w) => w.veryNegative),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: '#ef4444',
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
                    color: 'rgba(255, 255, 255, 0.58)',
                },
            },
            tooltip: {
                backgroundColor: '#080808',
                titleColor: '#fff',
                bodyColor: 'rgba(255, 255, 255, 0.72)',
                borderColor: 'rgba(255, 255, 255, 0.14)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
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
                    color: 'rgba(255, 255, 255, 0.42)',
                    maxRotation: 45,
                    autoSkip: true,
                    maxTicksLimit: 16,
                },
                border: { display: false },
            },
            y: {
                min: 0,
                max: 60,
                grid: { color: 'rgba(255, 255, 255, 0.08)' },
                ticks: {
                    font: { size: 11 },
                    color: 'rgba(255, 255, 255, 0.42)',
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
            <main className={`jd-home jd-apps-home ${isLoaded ? 'is-loaded' : ''}`}>
                <header className='jd-nav-wrap'>
                    <Link href='/' className='jd-logo'>{strings.NAME}</Link>
                    <nav className='jd-nav' aria-label='Primary navigation'>
                        <Link href='/apps' className='jd-nav-link'>Apps</Link>
                        <Link href='/blog' className='jd-nav-link'>Blog</Link>
                        <Link href='/apps/resume' className='jd-nav-link'>Resume</Link>
                    </nav>
                    <div className='jd-nav-actions'>
                        <Link href='/apps/chat' className='jd-login'>Chat</Link>
                        <Link href='/' className='jd-top-cta'>Home</Link>
                    </div>
                </header>

                <div className='jd-blog-shell jd-tool-shell'>
                    <section className='jd-blog-hero jd-tool-hero'>
                        <h1>AI Sentiment</h1>
                        <p>Tracking public sentiment toward AI over time.</p>
                    </section>

                    <section className='jd-tool-card'>
                        <p>
                            Every week, 250 articles about AI are collected from various news sources and classified into 5 sentiment categories
                            using <code className='jd-inline-code'>openai/gpt-oss-120b</code>. The results are aggregated below to show how
                            public perception of AI shifts over time.
                        </p>
                        <div className='jd-tool-card-footer'>
                            <p>
                                Data collected and curated by{' '}
                                <a href='https://jdleo.me' target='_blank' rel='noopener noreferrer'>John Leonardo</a>.
                                If you use this data, please credit the source.
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
                                className='jd-download-btn'
                            >
                                <ArrowDownTrayIcon />
                                Download Raw Data
                            </button>
                        </div>
                    </section>

                    <section className='jd-chart-section'>
                        <div className='jd-section-title'>
                            <span><SignalIcon /> Aggregate Sentiment Score</span>
                            <span className='jd-pill-metric'>{sentimentData.length} Weeks</span>
                        </div>
                        <div className='jd-chart-card'>
                            <Line data={scoreChartData} options={scoreChartOptions} />
                        </div>
                    </section>

                    <section className='jd-chart-section'>
                        <div className='jd-section-title'>
                            <span><ChartBarIcon /> Sentiment Breakdown</span>
                            <span className='jd-pill-metric jd-pill-metric-green'>% Distribution</span>
                        </div>
                        <div className='jd-chart-card jd-chart-card-tall'>
                            <Line data={breakdownChartData} options={breakdownChartOptions} />
                        </div>
                    </section>
                </div>

                <footer className='jd-footer'>
                    <span>&copy; 2026 {strings.NAME}</span>
                    <Link href='/apps'>Back to apps</Link>
                </footer>
            </main>
        </>
    );
}
