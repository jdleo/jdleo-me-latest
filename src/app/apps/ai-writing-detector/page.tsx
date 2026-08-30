'use client';

import { useState } from 'react';
import Link from 'next/link';
import { strings } from '../../constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import {
    ChartBarIcon,
    DocumentMagnifyingGlassIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface Indicator {
    pattern: string;
    evidence: string;
    explanation: string;
}

interface DetectionResult {
    aiProbability: number;
    confidence: 'low' | 'medium' | 'high';
    verdict: string;
    aiIndicators: Indicator[];
    humanIndicators: Indicator[];
    notes?: string;
}

const GREEN = '#2f9e44';
const YELLOW = '#f2c037';
const RED = '#e03131';

const zoneColor = (pct: number) => (pct < 30 ? GREEN : pct <= 70 ? YELLOW : RED);

const zoneLabel = (pct: number) =>
    pct < 30 ? 'Likely human' : pct <= 70 ? 'Unclear / mixed signals' : 'Likely AI';

export default function AIDetectorPage() {
    const [text, setText] = useState('');
    const [result, setResult] = useState<DetectionResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const analyze = async () => {
        if (!text.trim() || loading) return;
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const res = await fetch('/api/ai-writing-detector', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to analyze');
            setResult(data as DetectionResult);
        } catch (e: any) {
            setError(e.message || 'Failed to analyze');
        } finally {
            setLoading(false);
        }
    };

    const pct = result ? Math.max(0, Math.min(100, result.aiProbability)) : 0;
    const color = result ? zoneColor(pct) : GREEN;

    return (
        <>
            <WebVitals />
            <main className='el-page el-awd-page'>
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
                            <h1>AI Writing Detector</h1>
                            <p className='el-hero-sub'>
                                Paste any text to get an estimated % chance it was AI-written, with reasons why — or why not.
                            </p>
                        </div>
                    </div>
                </section>

                <section className='el-section el-sentiment'>
                    <div className='el-chart-block'>
                        <div className='el-chart-title'>
                            <span className='el-chart-title-label'>
                                <DocumentMagnifyingGlassIcon aria-hidden='true' />
                                Text to analyze
                            </span>
                        </div>
                        <div className='el-file-card'>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className='el-textarea'
                                placeholder='Paste text here — articles, emails, essays, captions, anything...'
                                rows={10}
                            />
                            <p className='el-awd-hint'>
                                Case doesn&apos;t matter — all-lowercase writing, swapped dashes, or stripped
                                formatting won&apos;t fool it. The core patterns still show through.
                            </p>
                            <div className='el-serialize-row'>
                                <button
                                    onClick={analyze}
                                    disabled={loading || !text.trim()}
                                    className='el-btn el-btn-dark el-btn-sm'
                                    style={{ opacity: loading || !text.trim() ? 0.5 : 1 }}
                                >
                                    {loading ? (
                                        <ArrowPathIcon aria-hidden='true' className='el-awd-spin' />
                                    ) : (
                                        <ChartBarIcon aria-hidden='true' />
                                    )}
                                    {loading ? 'Analyzing...' : 'Analyze'}
                                </button>
                                {error && <span className='el-error-text el-error-inline'>{error}</span>}
                            </div>
                        </div>
                    </div>

                    {loading && (
                        <div className='el-chart-block'>
                            <p className='el-awd-loading'>Reading the text for AI fingerprints...</p>
                        </div>
                    )}

                    {result && (
                        <>
                            <div className='el-chart-block'>
                                <div className='el-chart-title'>
                                    <span className='el-chart-title-label'>
                                        <ChartBarIcon aria-hidden='true' />
                                        AI likelihood
                                    </span>
                                    <span className='el-chart-pill'>{result.confidence} confidence</span>
                                </div>
                                <div className='el-file-card'>
                                    <div className='el-awd-score'>
                                        <span className='el-awd-pct' style={{ color }}>
                                            {pct}%
                                        </span>
                                        <span className='el-awd-verdict' style={{ color }}>
                                            {zoneLabel(pct)} — {result.verdict}
                                        </span>
                                    </div>
                                    <div className='el-awd-meter'>
                                        <div className='el-awd-track'>
                                            <div
                                                className='el-awd-marker'
                                                style={{ left: `${pct}%`, transitionDelay: '150ms' }}
                                            />
                                        </div>
                                        <div className='el-awd-scale'>
                                            <span style={{ color: GREEN }}>human</span>
                                            <span style={{ color: YELLOW }}>unclear</span>
                                            <span style={{ color: RED }}>AI</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {(result.aiIndicators.length > 0 || result.humanIndicators.length > 0) && (
                                <div className='el-awd-grid'>
                                    <div className='el-awd-card'>
                                        <h3 className='el-awd-card-title' style={{ color: RED }}>
                                            <ExclamationTriangleIcon aria-hidden='true' />
                                            Signs of AI ({result.aiIndicators.length})
                                        </h3>
                                        {result.aiIndicators.length === 0 ? (
                                            <p className='el-awd-empty'>No AI patterns found.</p>
                                        ) : (
                                            result.aiIndicators.map((ind, i) => (
                                                <div key={i} className='el-awd-item'>
                                                    <div className='el-awd-item-name'>{ind.pattern}</div>
                                                    {ind.evidence && (
                                                        <div className='el-awd-item-evidence'>&ldquo;{ind.evidence}&rdquo;</div>
                                                    )}
                                                    {ind.explanation && (
                                                        <div className='el-awd-item-expl'>{ind.explanation}</div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className='el-awd-card'>
                                        <h3 className='el-awd-card-title' style={{ color: GREEN }}>
                                            <CheckCircleIcon aria-hidden='true' />
                                            Signs of human ({result.humanIndicators.length})
                                        </h3>
                                        {result.humanIndicators.length === 0 ? (
                                            <p className='el-awd-empty'>No human patterns found.</p>
                                        ) : (
                                            result.humanIndicators.map((ind, i) => (
                                                <div key={i} className='el-awd-item'>
                                                    <div className='el-awd-item-name'>{ind.pattern}</div>
                                                    {ind.evidence && (
                                                        <div className='el-awd-item-evidence'>&ldquo;{ind.evidence}&rdquo;</div>
                                                    )}
                                                    {ind.explanation && (
                                                        <div className='el-awd-item-expl'>{ind.explanation}</div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {result.notes && (
                                <div className='el-awd-notes'>
                                    <strong>Notes:</strong> {result.notes}
                                </div>
                            )}

                            <p className='el-awd-disclaimer'>
                                AI detection is unreliable by nature — humans detect AI text at near random
                                chance, and false positives happen. Treat this as one signal, not a verdict.
                            </p>
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
