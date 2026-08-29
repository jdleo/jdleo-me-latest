'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { strings } from '../../constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import {
    BoltIcon,
    ArrowPathIcon,
    MagnifyingGlassPlusIcon,
    MagnifyingGlassMinusIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

const Mermaid = dynamic(() => import('../../../components/Mermaid'), {
    ssr: false,
});

export default function DiagramGenerator() {
    const [description, setDescription] = useState('');
    const [diagramCode, setDiagramCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const diagramRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (diagramCode && !loading) {
            diagramRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [diagramCode, loading]);

    const downloadPng = () => {
        const svg = diagramRef.current?.querySelector('.el-diagram-inner svg');
        if (!svg) return;

        const vb = (svg.getAttribute('viewBox') || '0 0 1200 800').split(/\s+/).map(Number);
        const w = vb[2] || svg.clientWidth || 1200;
        const h = vb[3] || svg.clientHeight || 800;
        const scale = 2.5;

        const clone = svg.cloneNode(true) as SVGSVGElement;
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        clone.setAttribute('width', String(w * scale));
        clone.setAttribute('height', String(h * scale));
        clone.innerHTML = clone.innerHTML.replace(/var\(--font-geist-mono\)/g, 'ui-monospace, monospace');

        const xml = new XMLSerializer().serializeToString(clone);
        const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(w * scale);
            canvas.height = Math.round(h * scale);
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = '#f7f7f2';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            try {
                canvas.toBlob((blob) => {
                    if (!blob) throw new Error('blob failed');
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = 'diagram.png';
                    a.click();
                    URL.revokeObjectURL(a.href);
                }, 'image/png');
            } catch {
                // tainted canvas (foreignObject): fall back to the SVG file
                const a = document.createElement('a');
                a.href = URL.createObjectURL(svgBlob);
                a.download = 'diagram.svg';
                a.click();
                URL.revokeObjectURL(a.href);
            }
        };
        img.onerror = () => URL.revokeObjectURL(url);
        img.src = url;
    };

    const generateDiagram = async (prompt?: string) => {
        const finalDescription = prompt || description;
        if (!finalDescription.trim()) return;

        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/diagram', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: finalDescription }),
            });

            const data = await response.json();
            if (data.error) {
                setError(data.error);
                setDiagramCode(null);
            } else {
                setDiagramCode(data.diagram);
            }
        } catch (err) {
            setError('Failed to generate diagram');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const examplePrompts = [
        'Flowchart of user auth',
        'API request sequence',
        'Blog app class diagram',
        'E-commerce ERD',
        'Checkout state machine',
    ];

    const handleExampleClick = (example: string) => {
        setDescription(example);
        generateDiagram(example);
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
                            <h1>AI Diagram Generator</h1>
                            <p className='el-hero-sub'>
                                Generate Mermaid.js diagrams from natural language descriptions.
                            </p>
                        </div>
                    </div>
                </section>

                <section className='el-section el-sentiment'>
                    <div className='el-chart-block'>
                        <div className='el-chart-title'>
                            <span className='el-chart-title-label'>
                                <BoltIcon aria-hidden='true' />
                                Describe Your Diagram
                            </span>
                        </div>
                        <div className='el-file-card'>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder='Describe your system architecture, flow, or data structure...'
                                className='el-textarea'
                                rows={6}
                            />
                            <div className='el-serialize-row'>
                                <button
                                    onClick={() => generateDiagram()}
                                    disabled={loading || !description.trim()}
                                    className='el-btn el-btn-dark el-btn-sm'
                                >
                                    {loading ? (
                                        <>
                                            <span className='ecl-loading-dot' aria-hidden='true' />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <BoltIcon aria-hidden='true' />
                                            Generate Diagram
                                        </>
                                    )}
                                </button>
                                {diagramCode && (
                                    <button
                                        onClick={() => setDiagramCode(null)}
                                        className='el-btn el-btn-light el-btn-sm'
                                    >
                                        <ArrowPathIcon aria-hidden='true' />
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className='el-chart-block'>
                        <div className='el-chart-title'>
                            <span className='el-chart-title-label'>Quick Start Examples</span>
                        </div>
                        <div className='el-suggestion-grid ecl-diagram-suggestions'>
                            {examplePrompts.map((p, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleExampleClick(p)}
                                    className='ecl-suggestion'
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className='el-file-card el-diagram-error'>
                            {error}
                        </div>
                    )}

                    {diagramCode ? (
                        <div className='el-chart-block' ref={diagramRef}>
                            <div className='el-chart-title'>
                                <span className='el-chart-title-label'>Generated Diagram</span>
                                <span className='el-chart-pill'>rendered</span>
                            </div>
                            <div className='el-diagram-card'>
                                <TransformWrapper
                                    initialScale={1}
                                    minScale={0.2}
                                    maxScale={4}
                                    centerOnInit={true}
                                    limitToBounds={false}
                                >
                                    {({ zoomIn, zoomOut, resetTransform }) => (
                                        <>
                                            <div className='el-zoom-row'>
                                                <button onClick={() => zoomIn()} className='el-zoom-btn' aria-label='Zoom in'>
                                                    <MagnifyingGlassPlusIcon />
                                                </button>
                                                <button onClick={() => zoomOut()} className='el-zoom-btn' aria-label='Zoom out'>
                                                    <MagnifyingGlassMinusIcon />
                                                </button>
                                                <button onClick={() => resetTransform()} className='el-zoom-btn' aria-label='Reset zoom'>
                                                    <ArrowPathIcon />
                                                </button>
                                                <button onClick={downloadPng} className='el-zoom-btn' aria-label='Download as PNG'>
                                                    <ArrowDownTrayIcon />
                                                </button>
                                            </div>
                                            <TransformComponent
                                                wrapperStyle={{ width: '100%', height: '100%' }}
                                                contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <div className='el-diagram-inner'>
                                                    <Mermaid chart={diagramCode} id='mermaid-main' theme='light' />
                                                </div>
                                            </TransformComponent>
                                        </>
                                    )}
                                </TransformWrapper>
                            </div>
                        </div>
                    ) : (
                        !loading && (
                            <div className='ecl-welcome ecl-diagram-empty'>
                                <div className='el-eyebrow'>
                                    <span className='el-eyebrow-label'>Canvas Empty</span>
                                </div>
                                <h1>Nothing drawn yet.</h1>
                                <p>
                                    Enter a description or choose a preset to generate a
                                    Mermaid.js diagram instantly.
                                </p>
                            </div>
                        )
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
