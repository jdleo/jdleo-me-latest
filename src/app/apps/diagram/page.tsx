'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { WebVitals } from '@/components/SEO/WebVitals';

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
    };

    return (
        <>
            <WebVitals />
            <main className='min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4 md:p-8 selection:bg-[var(--color-accent)] selection:text-[var(--color-bg)]'>
                <div className='fixed inset-0 overflow-hidden pointer-events-none'>
                    <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(62,175,124,0.03),transparent_60%)]' />
                    <div className='absolute inset-0' style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                </div>

                <div className={`w-full max-w-6xl h-[85vh] transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className='terminal-window flex flex-col h-full'>
                        <div className='terminal-header'>
                            <div className='terminal-controls'>
                                <div className='terminal-control red' />
                                <div className='terminal-control yellow' />
                                <div className='terminal-control green' />
                            </div>
                            <div className='terminal-title'>johnleonardo — ~/diagram-ai</div>
                        </div>

                        <div className='terminal-split flex-grow overflow-hidden'>
                            {/* Left Sidebar: Prompt & Examples */}
                            <div className='terminal-pane border-r border-[var(--color-border)] hidden md:flex flex-col gap-8'>
                                <div>
                                    <div className='flex items-center gap-2 mb-6 text-[var(--color-accent)]'>
                                        <span className='terminal-prompt'>➜</span>
                                        <span className='text-sm uppercase tracking-widest font-bold'>Interface</span>
                                    </div>
                                    <nav className='flex flex-col gap-4 mb-8'>
                                        <Link href='/' className='text-lg hover:text-[var(--color-accent)] transition-colors'>~/home</Link>
                                        <Link href='/apps' className='text-lg hover:text-[var(--color-accent)] transition-colors'>~/apps</Link>
                                    </nav>

                                    <div className='space-y-6 font-mono'>
                                        <div>
                                            <span className='text-[var(--color-text)] opacity-40 text-[10px] uppercase tracking-widest block mb-4'>$ input --description</span>
                                            <textarea
                                                value={description}
                                                onChange={e => setDescription(e.target.value)}
                                                placeholder='Describe architecture...'
                                                className='w-full bg-black/40 border border-[var(--color-border)] rounded p-3 text-xs text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none resize-none h-32'
                                            />
                                            <button
                                                onClick={() => generateDiagram()}
                                                disabled={loading || !description.trim()}
                                                className={`w-full mt-3 py-2 border border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-[10px] uppercase tracking-widest transition-all rounded ${loading ? 'animate-pulse' : ''}`}
                                            >
                                                {loading ? 'GEN_IN_PROGRESS...' : '[EXECUTE_GEN]'}
                                            </button>
                                        </div>

                                        <div className='pt-4'>
                                            <span className='text-[var(--color-text)] opacity-40 text-[10px] uppercase tracking-widest block mb-4'>$ ls --presets</span>
                                            <div className='flex flex-col gap-2'>
                                                {examplePrompts.map((p, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleExampleClick(p)}
                                                        className='text-left text-[10px] text-[var(--color-text-dim)] hover:text-[var(--color-accent)] transition-colors flex items-center gap-2 group'
                                                    >
                                                        <span className='opacity-0 group-hover:opacity-100'>&gt;</span> {p}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='mt-auto pt-8 border-t border-[var(--color-border)] opacity-30 font-mono text-[9px] uppercase tracking-tighter'>
                                    "Transformer-based generation of Mermaid.js semantic structured diagrams."
                                </div>
                            </div>

                            {/* Main Display: Diagram Canvas */}
                            <div className='terminal-pane bg-black/20 flex flex-col p-0 overflow-auto w-full'>
                                {diagramCode ? (
                                    <div className='p-8 md:p-16 min-w-full flex justify-center items-start'>
                                        <div className='bg-white/5 border border-[var(--color-border)] p-8 rounded-xl backdrop-blur-md'>
                                            <Mermaid chart={diagramCode} id='mermaid-main' />
                                        </div>
                                    </div>
                                ) : (
                                    <div className='flex flex-col items-center justify-center flex-grow opacity-20'>
                                        <div className='text-4xl font-mono mb-4 text-[var(--color-accent)]'>[VOID_BUFFER]</div>
                                        <div className='text-xs font-mono uppercase tracking-[0.4em]'>Awaiting architectural schema generation</div>
                                    </div>
                                )}

                                {error && (
                                    <div className='absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-500/10 border border-red-500/50 text-red-400 text-[10px] font-mono rounded-full animate-shake'>
                                        [ERR_CODE_500]: {error}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Console decoration */}
                    <div className='mt-4 flex items-center justify-between text-[10px] font-mono text-[var(--color-text-dim)] opacity-40 uppercase tracking-[0.2em] px-4'>
                        <div className='flex gap-6'>
                            <span>Renderer: Mermaid_v11</span>
                            <span>Engine: DiagramCore_v2</span>
                        </div>
                        <span>Status: buffer_ready</span>
                    </div>
                </div>
            </main>
        </>
    );
}
