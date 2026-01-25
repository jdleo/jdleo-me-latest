'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { strings } from '../../constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import {
    DevicePhoneMobileIcon,
    PencilSquareIcon,
    DocumentTextIcon,
    SparklesIcon,
    ArrowPathIcon,
    MagnifyingGlassPlusIcon,
    MagnifyingGlassMinusIcon,
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

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

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

                <div className={`notion-content ${isLoaded ? 'loaded' : ''}`} style={{ maxWidth: '1100px' }}>
                    <div className='notion-title-block'>
                        <h1 className='notion-title'>AI Diagram Generator</h1>
                        <div className='notion-subtitle'>Generate Mermaid.js diagrams from natural language descriptions</div>
                    </div>

                    <div className='notion-divider' />

                    <div className='notion-section'>
                        <div className='notion-section-title'>
                            <SparklesIcon className='notion-section-icon' />
                            Describe Your Diagram
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder='Describe your system architecture, flow, or data structure...'
                                className='notion-textarea'
                                style={{ height: '120px' }}
                            />
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
                                <button
                                    onClick={() => generateDiagram()}
                                    disabled={loading || !description.trim()}
                                    className='notion-action-btn notion-action-primary'
                                >
                                    {loading ? (
                                        <>
                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'white', animation: 'pulse 1s infinite' }} />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <SparklesIcon className='notion-action-icon' />
                                            Generate Diagram
                                        </>
                                    )}
                                </button>
                                {diagramCode && (
                                    <button
                                        onClick={() => setDiagramCode(null)}
                                        className='notion-action-btn'
                                    >
                                        <ArrowPathIcon className='notion-action-icon' />
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className='notion-divider' />

                    <div className='notion-section'>
                        <div className='notion-section-title'>
                            <DocumentTextIcon className='notion-section-icon' />
                            Quick Start Examples
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                            {examplePrompts.map((p, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleExampleClick(p)}
                                    className='notion-action-btn'
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <>
                            <div className='notion-divider' />
                            <div style={{
                                padding: '16px',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                borderRadius: '8px',
                                color: '#dc2626',
                                fontSize: '14px',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>!</span>
                                {error}
                            </div>
                        </>
                    )}

                    {diagramCode ? (
                        <>
                            <div className='notion-divider' />
                            <div className='notion-section'>
                                <div className='notion-section-title'>
                                    <DocumentTextIcon className='notion-section-icon' />
                                    Generated Diagram
                                    <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 600, color: '#059669', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        ✓ Rendered
                                    </span>
                                </div>
                                <div className='notion-card' style={{
                                    marginTop: '16px',
                                    padding: 0,
                                    overflow: 'hidden',
                                    backgroundColor: '#1a1b1e'
                                }}>
                                    <TransformWrapper
                                        initialScale={1}
                                        minScale={0.2}
                                        maxScale={4}
                                        centerOnInit={true}
                                        limitToBounds={false}
                                    >
                                        {({ zoomIn, zoomOut, resetTransform }) => (
                                            <>
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: '16px',
                                                    right: '16px',
                                                    zIndex: 20,
                                                    display: 'flex',
                                                    gap: '8px'
                                                }}>
                                                    <button
                                                        onClick={() => zoomIn()}
                                                        style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            borderRadius: '50%',
                                                            backgroundColor: 'white',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                                        }}
                                                    >
                                                        <MagnifyingGlassPlusIcon style={{ width: '20px', height: '20px' }} />
                                                    </button>
                                                    <button
                                                        onClick={() => zoomOut()}
                                                        style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            borderRadius: '50%',
                                                            backgroundColor: 'white',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                                        }}
                                                    >
                                                        <MagnifyingGlassMinusIcon style={{ width: '20px', height: '20px' }} />
                                                    </button>
                                                    <button
                                                        onClick={() => resetTransform()}
                                                        style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            borderRadius: '50%',
                                                            backgroundColor: 'white',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                                            fontSize: '18px'
                                                        }}
                                                    >
                                                        ⟲
                                                    </button>
                                                </div>
                                                <TransformComponent
                                                    wrapperStyle={{ width: '100%', height: '500px' }}
                                                    contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <div style={{ padding: '48px', minWidth: '600px' }}>
                                                        <Mermaid chart={diagramCode} id='mermaid-main' />
                                                    </div>
                                                </TransformComponent>
                                            </>
                                        )}
                                    </TransformWrapper>
                                </div>
                            </div>
                        </>
                    ) : !loading && (
                        <>
                            <div className='notion-divider' />
                            <div style={{ textAlign: 'center', padding: '64px 24px' }}>
                                <div style={{ width: '80px', height: '80px', margin: '0 auto 24px', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', transform: 'rotate(3deg)' }}>
                                    💠
                                </div>
                                <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#37352f', marginBottom: '8px' }}>Canvas Empty</h2>
                                <p style={{ color: 'rgba(55, 53, 47, 0.6)', fontSize: '15px', maxWidth: '400px', margin: '0 auto' }}>
                                    Enter a description or choose a preset to generate a Mermaid.js diagram instantly.
                                </p>
                            </div>
                        </>
                    )}

                    <footer className='notion-footer'>
                        © 2026 {strings.NAME}
                    </footer>
                </div>
            </main>
        </>
    );
}
