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
    DevicePhoneMobileIcon,
    PencilSquareIcon,
    DocumentTextIcon,
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
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                borderWidth: 2.5,
                pointRadius: 4,
                pointHoverRadius: 7,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#6366f1',
                pointBorderWidth: 2,
                pointHoverBackgroundColor: '#6366f1',
                pointHoverBorderColor: '#fff',
                tension: 0.35,
                fill: true,
                order: 1,
            },
            {
                label: 'Trend',
                data: trendline,
                borderColor: 'rgba(239, 68, 68, 0.7)',
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
                backgroundColor: '#1e1e2e',
                titleColor: '#fff',
                bodyColor: '#ccc',
                borderColor: 'rgba(99, 102, 241, 0.3)',
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
                    color: 'rgba(55, 53, 47, 0.4)',
                    maxRotation: 45,
                    autoSkip: true,
                    maxTicksLimit: 16,
                },
                border: { display: false },
            },
            y: {
                min: 1,
                max: 5,
                grid: { color: 'rgba(55, 53, 47, 0.06)' },
                ticks: {
                    font: { size: 11 },
                    color: 'rgba(55, 53, 47, 0.4)',
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
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: '#6366f1',
                tension: 0.35,
                fill: true,
            },
            {
                label: 'Positive',
                data: sentimentData.map((w) => w.positive),
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
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
                backgroundColor: 'rgba(249, 115, 22, 0.15)',
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
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
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
                    color: 'rgba(55, 53, 47, 0.6)',
                },
            },
            tooltip: {
                backgroundColor: '#1e1e2e',
                titleColor: '#fff',
                bodyColor: '#ccc',
                borderColor: 'rgba(99, 102, 241, 0.3)',
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
                    color: 'rgba(55, 53, 47, 0.4)',
                    maxRotation: 45,
                    autoSkip: true,
                    maxTicksLimit: 16,
                },
                border: { display: false },
            },
            y: {
                min: 0,
                max: 60,
                grid: { color: 'rgba(55, 53, 47, 0.06)' },
                ticks: {
                    font: { size: 11 },
                    color: 'rgba(55, 53, 47, 0.4)',
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

                <div className={`notion-content ${isLoaded ? 'loaded' : ''}`} style={{ maxWidth: '1000px' }}>
                    <div className='notion-title-block'>
                        <h1 className='notion-title'>AI Sentiment</h1>
                        <div className='notion-subtitle'>Tracking public sentiment toward AI over time</div>
                    </div>

                    <div className='notion-divider' />

                    <div className='notion-section'>
                        <p style={{ fontSize: '14px', color: 'rgba(55, 53, 47, 0.7)', lineHeight: 1.8 }}>
                            Every week, 250 articles about AI are collected from various news sources and classified into 5 sentiment categories
                            (very negative, negative, neutral, positive, very positive) using{' '}
                            <code style={{ fontSize: '12px', backgroundColor: 'rgba(55, 53, 47, 0.06)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                                openai/gpt-oss-20b
                            </code>
                            , a lightweight open-source model. The results are aggregated and plotted below to show how public perception of AI shifts over time.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginTop: '16px' }}>
                            <p style={{ fontSize: '13px', color: 'rgba(55, 53, 47, 0.5)', lineHeight: 1.6, margin: 0 }}>
                                Data collected and curated by{' '}
                                <a href='https://jdleo.me' target='_blank' rel='noopener noreferrer' style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>
                                    John Leonardo
                                </a>
                                . If you use this data, please credit the source.
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
                                className='notion-action-btn notion-action-primary'
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}
                            >
                                <ArrowDownTrayIcon style={{ width: '16px', height: '16px' }} />
                                Download Raw Data
                            </button>
                        </div>
                    </div>

                    <div className='notion-divider' />

                    {/* Aggregate Score Chart */}
                    <div className='notion-section'>
                        <div className='notion-section-title'>
                            <SignalIcon className='notion-section-icon' />
                            Aggregate Sentiment Score
                            <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 600, color: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '4px 8px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {sentimentData.length} Weeks
                            </span>
                        </div>
                        <div className='notion-card' style={{ padding: '24px', marginTop: '16px' }}>
                            <div style={{ height: '360px' }}>
                                <Line data={scoreChartData} options={scoreChartOptions} />
                            </div>
                        </div>
                    </div>

                    <div className='notion-divider' />

                    {/* Breakdown Chart */}
                    <div className='notion-section'>
                        <div className='notion-section-title'>
                            <ChartBarIcon className='notion-section-icon' />
                            Sentiment Breakdown
                            <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 600, color: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '4px 8px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                % Distribution
                            </span>
                        </div>
                        <div className='notion-card' style={{ padding: '24px', marginTop: '16px' }}>
                            <div style={{ height: '400px' }}>
                                <Line data={breakdownChartData} options={breakdownChartOptions} />
                            </div>
                        </div>
                    </div>

                    <footer className='notion-footer'>
                        &copy; 2026 {strings.NAME}
                    </footer>
                </div>
            </main>
        </>
    );
}
