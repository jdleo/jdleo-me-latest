'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Draggable from 'react-draggable';
import { WebVitals } from '@/components/SEO/WebVitals';
import { strings } from '../../constants/strings';

type Tile = {
    id: string;
    type: 'input' | 'output';
    content: string;
    prompt?: string;
    position: { x: number; y: number };
};

export default function Builder() {
    const [tiles, setTiles] = useState<Tile[]>([]);
    const [selectedTile, setSelectedTile] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const addTile = (type: 'input' | 'output') => {
        const newTile: Tile = {
            id: `tile-${Date.now()}`,
            type,
            content: type === 'input' ? 'RAW_DATA_INPUT' : 'SYNTHESIZED_OUTPUT',
            prompt: type === 'output' ? 'CORE_PROMPT: Process {{input}} with high-fidelity reasoning.' : undefined,
            position: { x: 50 + tiles.length * 20, y: 50 + tiles.length * 20 },
        };
        setTiles([...tiles, newTile]);
        setSelectedTile(newTile.id);
    };

    const handleDragStop = (id: string, e: any, data: any) => {
        setTiles(tiles.map(tile => (tile.id === id ? { ...tile, position: { x: data.x, y: data.y } } : tile)));
    };

    const deleteTile = (id: string) => {
        setTiles(tiles.filter(t => t.id !== id));
        if (selectedTile === id) setSelectedTile(null);
    };

    const updateTile = (id: string, updates: Partial<Tile>) => {
        setTiles(tiles.map(t => (t.id === id ? { ...t, ...updates } : t)));
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
                            <div className='terminal-title'>johnleonardo — ~/neural-builder</div>
                        </div>

                        <div className='terminal-split flex-grow overflow-hidden'>
                            {/* Left Sidebar: Tools & Node Metadata */}
                            <div className='terminal-pane border-r border-[var(--color-border)] hidden md:flex flex-col gap-8'>
                                <div>
                                    <div className='flex items-center gap-2 mb-6 text-[var(--color-accent)]'>
                                        <span className='terminal-prompt'>➜</span>
                                        <span className='text-sm uppercase tracking-widest font-bold'>Toolbox</span>
                                    </div>
                                    <nav className='flex flex-col gap-4 mb-10'>
                                        <Link href='/' className='text-lg hover:text-[var(--color-accent)] transition-colors'>~/home</Link>
                                        <Link href='/apps' className='text-lg hover:text-[var(--color-accent)] transition-colors'>~/apps</Link>
                                    </nav>

                                    <div className='space-y-6'>
                                        <div className='font-mono'>
                                            <span className='text-[var(--color-text)] opacity-40 text-[10px] uppercase tracking-widest mb-4 block'>$ spawn --element</span>
                                            <div className='grid gap-2'>
                                                <button onClick={() => addTile('input')} className='w-full py-2 border border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-[11px] font-mono transition-all rounded uppercase'>
                                                    [ADD_INPUT_NODE]
                                                </button>
                                                <button onClick={() => addTile('output')} className='w-full py-2 border border-blue-500/30 hover:bg-blue-500/10 text-blue-400 text-[11px] font-mono transition-all rounded uppercase'>
                                                    [ADD_OUTPUT_NODE]
                                                </button>
                                            </div>
                                        </div>

                                        <div className='font-mono pt-4'>
                                            <span className='text-[var(--color-text)] opacity-40 text-[10px] uppercase tracking-widest block mb-4'>$ node --manifest</span>
                                            <div className='space-y-4'>
                                                <div className='flex justify-between text-[11px] border-b border-[var(--color-border)] pb-2'>
                                                    <span className='opacity-60'>TOTAL_NODES</span>
                                                    <span className='text-[var(--color-text)]'>{tiles.length}</span>
                                                </div>
                                                {selectedTile && (
                                                    <div className='space-y-2'>
                                                        <div className='flex justify-between text-[11px]'>
                                                            <span className='opacity-60 uppercase'>Selected</span>
                                                            <span className='text-[var(--color-accent)] font-bold'>{selectedTile.slice(-6).toUpperCase()}</span>
                                                        </div>
                                                        <button onClick={() => deleteTile(selectedTile)} className='w-full py-1 text-[10px] text-red-400/70 hover:text-red-400 hover:bg-red-400/10 border border-red-400/20 rounded uppercase transition-all'>
                                                            Terminate Node
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='mt-auto pt-8 border-t border-[var(--color-border)] opacity-30 font-mono text-[9px] leading-relaxed uppercase tracking-tighter'>
                                    "Visual drafting for multi-agent LLM architectures and neural pipelines."
                                </div>
                            </div>

                            {/* Main Display: Nodes Canvas */}
                            <div className='terminal-pane bg-black/40 flex flex-col p-0 overflow-hidden relative w-full'>
                                <div className='absolute inset-0 pointer-events-none' style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '30px 30px' }} />

                                <div className='relative w-full h-full p-8 overflow-auto'>
                                    {tiles.map(tile => (
                                        <Draggable
                                            key={tile.id}
                                            defaultPosition={tile.position}
                                            onStop={(e, data) => handleDragStop(tile.id, e, data)}
                                            handle='.drag-handle'
                                            bounds='parent'
                                        >
                                            <div
                                                className={`absolute w-72 rounded-lg border backdrop-blur-md shadow-2xl transition-all ${selectedTile === tile.id ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)]'} bg-black/60`}
                                                onClick={() => setSelectedTile(tile.id)}
                                            >
                                                <div className='drag-handle p-2 border-b border-[var(--color-border)] cursor-grab active:cursor-grabbing flex justify-between items-center bg-white/5'>
                                                    <span className={`text-[10px] font-mono uppercase tracking-widest ${tile.type === 'input' ? 'text-[var(--color-accent)]' : 'text-blue-400'}`}>
                                                        {tile.type}_NODE
                                                    </span>
                                                    <span className='text-[9px] font-mono opacity-30'>#0x{tile.id.slice(-4)}</span>
                                                </div>

                                                <div className='p-4 space-y-4'>
                                                    {tile.type === 'output' && (
                                                        <div className='space-y-1.5'>
                                                            <label className='text-[9px] font-mono opacity-40 uppercase'>Kernel_Prompt</label>
                                                            <textarea
                                                                value={tile.prompt}
                                                                onChange={e => updateTile(tile.id, { prompt: e.target.value })}
                                                                className='w-full bg-black/40 border border-[var(--color-border)] rounded p-2 text-[11px] font-mono text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none resize-none h-16'
                                                                spellCheck={false}
                                                            />
                                                        </div>
                                                    )}
                                                    <div className='space-y-1.5'>
                                                        <label className='text-[9px] font-mono opacity-40 uppercase'>Memory_Payload</label>
                                                        <textarea
                                                            value={tile.content}
                                                            onChange={e => updateTile(tile.id, { content: e.target.value })}
                                                            className='w-full bg-black/40 border border-[var(--color-border)] rounded p-2 text-[11px] font-mono text-[var(--color-text-dim)] focus:border-[var(--color-accent)] outline-none resize-none h-20'
                                                            spellCheck={false}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </Draggable>
                                    ))}

                                    {tiles.length === 0 && (
                                        <div className='absolute inset-0 flex items-center justify-center opacity-20'>
                                            <div className='text-center font-mono'>
                                                <div className='text-4xl mb-4 text-[var(--color-accent)]'>[NULL_STATE]</div>
                                                <div className='text-xs uppercase tracking-[0.5em]'>Await initial spawn command</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Console decoration */}
                    <div className='mt-4 flex items-center justify-between text-[10px] font-mono text-[var(--color-text-dim)] opacity-40 uppercase tracking-[0.2em] px-4'>
                        <div className='flex gap-6'>
                            <span>DRAG_MODE: ACTIVE</span>
                            <span>PERSISTENCE: EPHEMERAL</span>
                        </div>
                        <span>node_engine: rev_1.24.0</span>
                    </div>
                </div>
            </main>
        </>
    );
}
