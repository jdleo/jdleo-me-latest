'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { WebVitals } from '@/components/SEO/WebVitals';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const Mermaid = dynamic(() => import('../../../components/Mermaid'), {
    ssr: false,
});

export default function DiagramGenerator() {
    const [description, setDescription] = useState('');
    const [diagramCode, setDiagramCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            setError('FAILED_TO_GENERATE_CHART');
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
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setIsMobileMenuOpen(false);
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
                            <span className='font-bold uppercase tracking-widest text-sm text-[var(--fg-4)]'>Generator Studio</span>
                        </div>
                        <nav className='flex flex-col gap-2'>
                            <Link href='/apps' className='text-xs font-bold uppercase tracking-wider text-muted hover:text-[var(--purple-4)] transition-colors flex items-center gap-2'>
                                <span>←</span> Back to Apps
                            </Link>
                        </nav>
                    </div>

                    <div className='flex-grow overflow-y-auto p-6 space-y-8'>
                        <div>
                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Define Architecture</h3>
                            <div className='space-y-4 rounded-2xl bg-white border border-[var(--border-light)] p-4 shadow-sm'>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder='Describe your system architecture, flow, or data structure...'
                                    className='w-full bg-[var(--bg-2)] border border-[var(--border-light)] rounded-xl p-3 text-sm text-[var(--fg-4)] focus:border-[var(--purple-4)] focus:ring-2 focus:ring-[var(--purple-1)] outline-none resize-none h-32 transition-all placeholder:text-muted/50'
                                />
                                <button
                                    onClick={() => generateDiagram()}
                                    disabled={loading || !description.trim()}
                                    className='w-full py-3 bg-[var(--fg-4)] hover:bg-[var(--purple-4)] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group'
                                >
                                    {loading ? (
                                        <span className='flex items-center justify-center gap-2'>
                                            <span className='w-2 h-2 bg-white rounded-full animate-bounce' style={{ animationDelay: '0s' }} />
                                            <span className='w-2 h-2 bg-white rounded-full animate-bounce' style={{ animationDelay: '0.1s' }} />
                                            <span className='w-2 h-2 bg-white rounded-full animate-bounce' style={{ animationDelay: '0.2s' }} />
                                        </span>
                                    ) : (
                                        <span className='group-hover:scale-105 inline-block transition-transform'>Generate Diagram</span>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Quick Start</h3>
                            <div className='flex flex-col gap-2'>
                                {examplePrompts.map((p, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleExampleClick(p)}
                                        className='text-left p-3 rounded-xl text-xs font-medium text-[var(--fg-4)] hover:text-[var(--purple-4)] hover:bg-white border border-transparent hover:border-[var(--border-light)] hover:shadow-sm transition-all flex items-center gap-3 group'
                                    >
                                        <span className='w-6 h-6 rounded-full bg-[var(--bg-2)] flex items-center justify-center text-[10px] text-muted group-hover:bg-[var(--purple-1)] group-hover:text-[var(--purple-4)] transition-colors'>
                                            {i + 1}
                                        </span>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className='flex-grow flex flex-col h-full relative bg-[#fafbff] overflow-hidden'>
                    {/* Floating decorations */}
                    <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--purple-1)] opacity-30 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2' />

                    <div className='flex-grow overflow-auto p-4 md:p-8 scrollbar-hide z-10 flex flex-col items-center'>
                        {diagramCode ? (
                            <div className='w-full max-w-5xl animate-fade-in-up'>
                                <div className='bg-white rounded-2xl shadow-xl border border-[var(--border-light)] overflow-hidden'>
                                    <div className='p-4 border-b border-[#2e2e32] bg-[#1a1b1e] flex justify-between items-center'>
                                        <div className='flex items-center gap-2'>
                                            <div className='w-2 h-2 rounded-full bg-green-500' />
                                            <span className='text-xs font-bold uppercase tracking-wider text-gray-300'>Render Successful</span>
                                        </div>
                                        <button
                                            onClick={() => setDiagramCode(null)}
                                            className='text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-red-500 transition-colors'
                                        >
                                            Clear
                                        </button>
                                    </div>

                                    <div className='relative overflow-hidden bg-[#1a1b1e] h-[600px] w-full'>
                                        <TransformWrapper
                                            initialScale={1}
                                            minScale={0.2}
                                            maxScale={4}
                                            centerOnInit={true}
                                            limitToBounds={false}
                                        >
                                            {({ zoomIn, zoomOut, resetTransform }) => (
                                                <>
                                                    {/* Floating Controls */}
                                                    <div className='absolute bottom-6 right-6 z-20 flex gap-2'>
                                                        <button
                                                            onClick={() => zoomIn()}
                                                            className='w-10 h-10 bg-white text-black rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors font-bold text-lg'
                                                            title="Zoom In"
                                                        >
                                                            +
                                                        </button>
                                                        <button
                                                            onClick={() => zoomOut()}
                                                            className='w-10 h-10 bg-white text-black rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors font-bold text-lg'
                                                            title="Zoom Out"
                                                        >
                                                            -
                                                        </button>
                                                        <button
                                                            onClick={() => resetTransform()}
                                                            className='w-10 h-10 bg-white text-black rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors font-bold text-xl'
                                                            title="Reset View"
                                                        >
                                                            ⟲
                                                        </button>
                                                    </div>

                                                    <TransformComponent
                                                        wrapperClass="!w-full !h-full"
                                                        contentClass="!w-full !h-full flex items-center justify-center"
                                                    >
                                                        <div className='min-w-[800px] min-h-[600px] flex items-center justify-center p-12'>
                                                            <Mermaid chart={diagramCode} id='mermaid-main' />
                                                        </div>
                                                    </TransformComponent>
                                                </>
                                            )}
                                        </TransformWrapper>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className='flex flex-col items-center justify-center h-full opacity-100 text-center max-w-sm mx-auto'>
                                <div className='w-24 h-24 bg-[var(--purple-1)] rounded-3xl flex items-center justify-center mb-6 text-5xl rotate-3 shadow-lg opacity-40'>
                                    💠
                                </div>
                                <h2 className='text-2xl font-bold text-[var(--fg-4)] mb-2'>Canvas Empty</h2>
                                <p className='text-sm text-muted leading-relaxed mb-8'>
                                    Enter a description or choose a preset to generate a Mermaid.js diagram instantly.
                                </p>

                                {/* Mobile Input Card (Visible only on mobile/empty state) */}
                                <div className='md:hidden w-full bg-white p-4 rounded-2xl shadow-xl border border-[var(--border-light)]'>
                                    <textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder='E.g. "User login flow with database auth..."'
                                        className='w-full bg-[var(--bg-2)] border border-[var(--border-light)] rounded-xl p-3 text-sm text-[var(--fg-4)] focus:border-[var(--purple-4)] focus:ring-2 focus:ring-[var(--purple-1)] outline-none resize-none h-24 mb-3 placeholder:text-muted/50'
                                    />
                                    <button
                                        onClick={() => generateDiagram()}
                                        disabled={loading || !description.trim()}
                                        className='w-full py-3 bg-[var(--purple-4)] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                                    >
                                        {loading ? 'Generating...' : 'Generate New Diagram'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className='fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-full shadow-lg animate-shake flex items-center gap-2 z-50'>
                                <span className='w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-[10px]'>!</span>
                                {error}
                            </div>
                        )}

                        {/* Mobile Bottom Bar for Regeneration (Visible only on mobile when diagram exists) */}
                        {diagramCode && (
                            <div className='md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-[var(--border-light)] z-40'>
                                <div className='flex gap-2 max-w-lg mx-auto'>
                                    <input
                                        type='text'
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder='Refine or new prompt...'
                                        className='flex-grow bg-[var(--bg-2)] border border-[var(--border-light)] rounded-xl px-4 py-3 text-sm text-[var(--fg-4)] focus:border-[var(--purple-4)] outline-none'
                                    />
                                    <button
                                        onClick={() => generateDiagram()}
                                        disabled={loading || !description.trim()}
                                        className='bg-[var(--purple-4)] text-white px-4 py-2 rounded-xl font-bold shadow-lg active:scale-95 disabled:opacity-50'
                                    >
                                        →
                                    </button>
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
                                <span className='text-xs font-bold uppercase tracking-widest text-[var(--fg-4)]'>Generator Studio</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className='w-6 h-6 rounded-full bg-white border border-[var(--border-light)] flex items-center justify-center text-muted'>✕</button>
                            </div>
                            <div className='p-4 space-y-6 max-h-[70vh] overflow-y-auto'>
                                <div>
                                    <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Define Architecture</h3>
                                    <div className='space-y-4'>
                                        <textarea
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            placeholder='Describe structure...'
                                            className='w-full bg-[var(--bg-2)] border border-[var(--border-light)] rounded-xl p-3 text-sm text-[var(--fg-4)] outline-none resize-none h-24'
                                        />
                                        <button
                                            onClick={() => { generateDiagram(); setIsMobileMenuOpen(false); }}
                                            disabled={loading || !description.trim()}
                                            className='w-full py-3 bg-[var(--fg-4)] text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-md'
                                        >
                                            {loading ? 'Generating...' : 'Generate Diagram'}
                                        </button>
                                    </div>
                                </div>
                                <div className='pt-4 border-t border-[var(--border-light)]'>
                                    <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Presets</h3>
                                    <div className='flex flex-wrap gap-2'>
                                        {examplePrompts.map((p, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleExampleClick(p)}
                                                className='px-3 py-2 bg-[var(--bg-2)] rounded-lg text-xs font-medium text-[var(--fg-4)] border border-[var(--border-light)]'
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main >
        </>
    );
}
