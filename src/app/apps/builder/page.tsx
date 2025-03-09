'use client';

import Link from 'next/link';
import { strings } from '../../constants/strings';
import { useState } from 'react';
import Draggable from 'react-draggable';

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

    const addTile = (type: 'input' | 'output') => {
        const newTile: Tile = {
            id: `tile-${Date.now()}`,
            type,
            content: type === 'input' ? 'Enter your text here' : 'Output will appear here',
            prompt:
                type === 'output' ? 'Configure your prompt here. Use {{input}} to reference input content.' : undefined,
            position: { x: 100, y: 100 },
        };
        setTiles([...tiles, newTile]);
    };

    const handleDragStop = (id: string, e: any, data: any) => {
        const newTiles = tiles.map(tile => (tile.id === id ? { ...tile, position: { x: data.x, y: data.y } } : tile));
        setTiles(newTiles);
    };

    return (
        <div className='min-h-screen bg-[#1d1d1d]'>
            {/* Navigation */}
            <nav className='fixed top-0 left-0 right-0 p-4 bg-black/20 backdrop-blur-sm border-b border-white/10 z-50'>
                <div className='flex justify-between items-center max-w-7xl mx-auto'>
                    <div className='flex gap-4'>
                        <button
                            onClick={() => addTile('input')}
                            className='px-4 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 
                                     transition-all font-nunito text-sm'
                        >
                            Add Input
                        </button>
                        <button
                            onClick={() => addTile('output')}
                            className='px-4 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 
                                     transition-all font-nunito text-sm'
                        >
                            Add Output
                        </button>
                    </div>
                    <div className='flex gap-4 text-white/70 font-nunito text-sm'>
                        <Link href='/' className='hover:text-white transition-colors'>
                            Home
                        </Link>
                        <Link href='/apps' className='hover:text-white transition-colors'>
                            Apps
                        </Link>
                        <a href={`mailto:${strings.EMAIL}`} className='hover:text-white transition-colors'>
                            Email
                        </a>
                        <a
                            href={strings.GITHUB_URL}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='hover:text-white transition-colors'
                        >
                            GitHub
                        </a>
                    </div>
                </div>
            </nav>

            {/* Canvas */}
            <div className='pt-16 min-h-screen'>
                <div
                    className='relative w-full h-[calc(100vh-4rem)]'
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
                        backgroundSize: '40px 40px',
                    }}
                >
                    {tiles.map(tile => (
                        <Draggable
                            key={tile.id}
                            defaultPosition={tile.position}
                            onStop={(e, data) => handleDragStop(tile.id, e, data)}
                            handle='.drag-handle'
                        >
                            <div
                                className={`
                                    absolute w-80 rounded-xl
                                    backdrop-blur-md shadow-xl
                                    border border-white/10 hover:border-white/20 
                                    transition-all duration-300
                                    ${
                                        tile.type === 'input'
                                            ? 'bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-transparent'
                                            : 'bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent'
                                    }
                                    ${selectedTile === tile.id ? 'ring-2 ring-white/30' : ''}
                                `}
                                onClick={() => setSelectedTile(tile.id)}
                            >
                                {/* Drag Handle */}
                                <div
                                    className='drag-handle p-3 border-b border-white/10 cursor-move
                                              flex justify-between items-center'
                                >
                                    <div className='text-white/60 font-nunito text-xs'>{tile.type.toUpperCase()}</div>
                                    <button
                                        onClick={e => {
                                            e.stopPropagation();
                                            setTiles(tiles.filter(t => t.id !== tile.id));
                                        }}
                                        className='text-white/40 hover:text-white/60 text-xs'
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className='p-4 space-y-3'>
                                    {tile.type === 'output' && (
                                        <textarea
                                            value={tile.prompt}
                                            onChange={e => {
                                                const newTiles = tiles.map(t =>
                                                    t.id === tile.id ? { ...t, prompt: e.target.value } : t
                                                );
                                                setTiles(newTiles);
                                            }}
                                            placeholder='Configure prompt here...'
                                            className='w-full bg-black/20 border border-white/10 rounded-lg p-2
                                                     text-white font-nunito text-sm resize-none focus:outline-none
                                                     focus:border-white/20'
                                            rows={2}
                                        />
                                    )}
                                    <textarea
                                        value={tile.content}
                                        onChange={e => {
                                            const newTiles = tiles.map(t =>
                                                t.id === tile.id ? { ...t, content: e.target.value } : t
                                            );
                                            setTiles(newTiles);
                                        }}
                                        placeholder={
                                            tile.type === 'input' ? 'Enter text here...' : 'Output will appear here...'
                                        }
                                        className='w-full bg-black/20 border border-white/10 rounded-lg p-2
                                                 text-white font-nunito text-sm resize-none focus:outline-none
                                                 focus:border-white/20'
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </Draggable>
                    ))}
                </div>
            </div>
        </div>
    );
}
