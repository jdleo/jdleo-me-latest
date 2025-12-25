'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ReactConfetti from 'react-confetti';
import crypto from 'crypto';
import { ArcherContainer, ArcherElement } from 'react-archer';
import { WebVitals } from '@/components/SEO/WebVitals';
import { strings } from '../../constants/strings';

type Block = {
    data: string;
    nonce: number;
    previousHash: string;
    hash: string;
    timestamp: number;
};

const GENESIS_HASH = '0'.repeat(64);



export default function Blockchain() {
    const [blocks, setBlocks] = useState<Block[]>([
        { data: '', nonce: 0, previousHash: GENESIS_HASH, hash: GENESIS_HASH, timestamp: Date.now() },
    ]);
    const [mining, setMining] = useState<number | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [difficulty, setDifficulty] = useState(3);
    const [hashRate, setHashRate] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [invalidBlocks, setInvalidBlocks] = useState<Set<number>>(new Set());
    const [blocksNeedingRemining, setBlocksNeedingRemining] = useState<Set<number>>(new Set());

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const calculateHash = (data: string, nonce: number, previousHash: string, timestamp: number): string => {
        const message = `${data}${nonce}${previousHash}${timestamp}`;
        return crypto.createHash('sha256').update(message).digest('hex');
    };

    const isValidHash = (hash: string): boolean => {
        return hash.startsWith('0'.repeat(difficulty));
    };

    const validateChain = (currentBlocks: Block[]) => {
        const invalid = new Set<number>();
        const needsRemining = new Set<number>();

        for (let i = 0; i < currentBlocks.length; i++) {
            const currentBlock = currentBlocks[i];
            if (i === 0) {
                if (currentBlock.data && (currentBlock.hash === GENESIS_HASH || !isValidHash(currentBlock.hash))) {
                    needsRemining.add(i);
                }
                continue;
            }

            const previousBlock = currentBlocks[i - 1];
            if (currentBlock.previousHash !== previousBlock.hash) {
                invalid.add(i);
                needsRemining.add(i);
                continue;
            }

            if (currentBlock.hash === 'N/A') {
                needsRemining.add(i);
                continue;
            }

            const calculatedHash = calculateHash(currentBlock.data, currentBlock.nonce, currentBlock.previousHash, currentBlock.timestamp);
            if (calculatedHash !== currentBlock.hash) {
                invalid.add(i);
                needsRemining.add(i);
            } else if (!isValidHash(currentBlock.hash)) {
                needsRemining.add(i);
            }
        }
        return { invalid, needsRemining };
    };

    useEffect(() => {
        const { invalid, needsRemining } = validateChain(blocks);
        setInvalidBlocks(invalid);
        setBlocksNeedingRemining(needsRemining);
    }, [blocks, difficulty]);

    const handleDataChange = (index: number, data: string) => {
        const newBlocks = [...blocks];
        newBlocks[index] = { ...newBlocks[index], data };
        if (newBlocks[index].hash !== 'N/A' && newBlocks[index].hash !== GENESIS_HASH) {
            newBlocks[index].hash = 'N/A';
            newBlocks[index].nonce = 0;
            for (let i = index + 1; i < newBlocks.length; i++) {
                newBlocks[i] = { ...newBlocks[i], hash: 'N/A', nonce: 0, previousHash: i === index + 1 ? newBlocks[index].hash : 'N/A' };
            }
        }
        setBlocks(newBlocks);
    };

    const mineBlock = async (index: number) => {
        setMining(index);
        const startTime = Date.now();
        let hashCount = 0;
        const block = blocks[index];
        let nonce = 0;
        let hash = '';
        const timestamp = Date.now();

        while (true) {
            hash = calculateHash(block.data, nonce, block.previousHash, timestamp);
            hashCount++;
            if (hashCount % 500 === 0) {
                const currentTime = Date.now();
                setHashRate(Math.floor(hashCount / ((currentTime - startTime) / 1000)));
                await new Promise(resolve => setTimeout(resolve, 0));
            }
            if (isValidHash(hash)) break;
            nonce++;
        }

        const newBlocks = [...blocks];
        newBlocks[index] = { ...block, nonce, hash, timestamp };
        for (let i = index + 1; i < newBlocks.length; i++) {
            newBlocks[i] = { ...newBlocks[i], previousHash: newBlocks[i - 1].hash };
        }
        if (index === blocks.length - 1) {
            newBlocks.push({ data: '', nonce: 0, previousHash: hash, hash: 'N/A', timestamp: Date.now() });
        }
        setBlocks(newBlocks);
        setMining(null);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
    };

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            <WebVitals />
            {showConfetti && <ReactConfetti style={{ zIndex: 100 }} />}
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
                        <span>Protocol</span>
                        <span className='text-[10px]'>▼</span>
                    </button>
                </header>

                {/* Left Sidebar (Desktop) */}
                <aside className='hidden md:flex flex-col w-80 h-full border-r border-[var(--border-light)] bg-white/50 backdrop-blur-xl z-20'>
                    <div className='p-6 border-b border-[var(--border-light)]'>
                        <div className='flex items-center gap-3 mb-6'>
                            <div className='w-3 h-3 rounded-full bg-[var(--purple-4)]' />
                            <span className='font-bold uppercase tracking-widest text-sm text-[var(--fg-4)]'>Blockchain Net</span>
                        </div>
                        <nav className='flex flex-col gap-2'>
                            <Link href='/apps' className='text-xs font-bold uppercase tracking-wider text-muted hover:text-[var(--purple-4)] transition-colors flex items-center gap-2'>
                                <span>←</span> Back to Apps
                            </Link>
                        </nav>
                    </div>

                    <div className='flex-grow overflow-y-auto p-6 space-y-8'>
                        <div>
                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Protocol Difficulty</h3>
                            <div className='bg-white p-4 rounded-xl border border-[var(--border-light)] shadow-sm'>
                                <input
                                    type='range'
                                    min='1'
                                    max='5' // Reduced max for better UX
                                    value={difficulty}
                                    onChange={e => setDifficulty(Number(e.target.value))}
                                    className='w-full accent-[var(--purple-4)] h-2 bg-[var(--bg-2)] rounded-lg appearance-none cursor-pointer'
                                />
                                <div className='flex justify-between text-[10px] font-bold uppercase tracking-wider mt-3'>
                                    <span className='text-muted'>Fast</span>
                                    <span className='text-[var(--purple-4)] bg-[var(--purple-1)] px-2 py-0.5 rounded'>{difficulty} Zeros</span>
                                    <span className='text-muted'>Secure</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Network Status</h3>
                            <div className='space-y-3'>
                                <div className='flex justify-between items-center p-3 bg-white border border-[var(--border-light)] rounded-xl'>
                                    <span className='text-xs font-bold text-muted uppercase tracking-wider'>Hashrate</span>
                                    <span className='text-xs font-bold text-[var(--purple-4)] font-mono'>{mining !== null ? `${hashRate.toLocaleString()} H/s` : 'IDLE'}</span>
                                </div>
                                <div className='flex justify-between items-center p-3 bg-white border border-[var(--border-light)] rounded-xl'>
                                    <span className='text-xs font-bold text-muted uppercase tracking-wider'>Health</span>
                                    <span className={`text-xs font-bold uppercase tracking-wider ${invalidBlocks.size > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        {invalidBlocks.size > 0 ? 'Compromised' : 'Healthy'}
                                    </span>
                                </div>
                                <div className='flex justify-between items-center p-3 bg-white border border-[var(--border-light)] rounded-xl'>
                                    <span className='text-xs font-bold text-muted uppercase tracking-wider'>Height</span>
                                    <span className='text-xs font-bold text-[var(--fg-4)] font-mono'>#{blocks.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className='flex-grow flex flex-col h-full relative bg-[#fafbff] overflow-hidden'>
                    {/* Floating decorations */}
                    <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--purple-1)] opacity-30 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2' />

                    <div className='flex-grow overflow-x-auto overflow-y-hidden p-8 flex items-center z-10 custom-scrollbar'>
                        <ArcherContainer
                            strokeColor={invalidBlocks.size > 0 ? '#ef4444' : '#a78bfa'}
                            strokeWidth={2}
                            strokeDasharray={invalidBlocks.size > 0 ? '5,5' : '0'}
                            endShape={{ arrow: { arrowLength: 4 } }}
                            style={{ height: '100%', display: 'flex', alignItems: 'center' }}
                        >
                            <div className='inline-flex gap-12 items-center px-12 min-w-full'>
                                {blocks.map((block, index) => {
                                    const isValid = !invalidBlocks.has(index);
                                    const needsRemining = blocksNeedingRemining.has(index);
                                    const isMining = mining === index;

                                    return (
                                        <ArcherElement
                                            key={index}
                                            id={`block-${index}`}
                                            relations={index < blocks.length - 1 ? [{ targetId: `block-${index + 1}`, targetAnchor: 'left', sourceAnchor: 'right' }] : []}
                                        >
                                            <div className='relative group'>
                                                <div className={`w-[320px] bg-white rounded-2xl p-6 shadow-sm border-2 transition-all duration-300 flex flex-col gap-4 relative z-10 ${isValid ? 'border-transparent hover:border-[var(--purple-2)] hover:shadow-xl'
                                                    : 'border-red-100 shadow-red-100/50 hover:shadow-red-200'
                                                    }`}>
                                                    {/* Header */}
                                                    <div className='flex justify-between items-center pb-4 border-b border-[var(--border-light)]'>
                                                        <div className='flex items-center gap-3'>
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${isValid ? 'bg-[var(--purple-1)] text-[var(--purple-4)]' : 'bg-red-50 text-red-500'}`}>
                                                                {index}
                                                            </div>
                                                            <span className='text-xs font-bold uppercase tracking-wider text-[var(--fg-4)]'>Block</span>
                                                        </div>
                                                        {needsRemining && (
                                                            <span className='px-2 py-1 bg-yellow-50 text-yellow-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-yellow-100'>
                                                                Re-Mine Required
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Data Payload */}
                                                    <div className='space-y-1'>
                                                        <label className='text-[10px] font-bold uppercase tracking-wider text-muted ml-1'>Data</label>
                                                        <textarea
                                                            value={block.data}
                                                            onChange={e => handleDataChange(index, e.target.value)}
                                                            placeholder='Enter transaction data...'
                                                            className='w-full bg-[var(--bg-2)] border-2 border-transparent focus:border-[var(--purple-2)] rounded-xl p-3 text-xs font-medium text-[var(--fg-4)] outline-none transition-all resize-none h-24 placeholder:text-muted/50'
                                                        />
                                                    </div>

                                                    {/* Meta Info */}
                                                    <div className='grid grid-cols-2 gap-3'>
                                                        <div className='bg-[var(--bg-2)] p-2 rounded-lg'>
                                                            <span className='text-[8px] font-bold uppercase tracking-wider text-muted block mb-1'>Nonce</span>
                                                            <span className='text-xs font-mono font-bold text-[var(--purple-4)]'>{block.nonce}</span>
                                                        </div>
                                                        <div className='bg-[var(--bg-2)] p-2 rounded-lg'>
                                                            <span className='text-[8px] font-bold uppercase tracking-wider text-muted block mb-1'>Timestamp</span>
                                                            <span className='text-[10px] font-mono font-medium text-[var(--fg-4)] opacity-70'>{new Date(block.timestamp).toLocaleTimeString()}</span>
                                                        </div>
                                                    </div>

                                                    {/* Hashes */}
                                                    <div className='space-y-2'>
                                                        <div className='space-y-1'>
                                                            <span className='text-[8px] font-bold uppercase tracking-wider text-muted ml-1'>Previous Hash</span>
                                                            <div className='text-[9px] font-mono bg-[var(--bg-2)] p-2 rounded-lg text-muted truncate select-all'>
                                                                {block.previousHash}
                                                            </div>
                                                        </div>
                                                        <div className='space-y-1'>
                                                            <span className='text-[8px] font-bold uppercase tracking-wider text-muted ml-1'>Current Hash</span>
                                                            <div className={`text-[9px] font-mono p-2 rounded-lg truncate select-all font-bold transition-colors ${isValid ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                                                {block.hash}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Mine Button */}
                                                    <button
                                                        onClick={() => mineBlock(index)}
                                                        disabled={isMining}
                                                        className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${isMining
                                                            ? 'bg-[var(--bg-2)] text-muted cursor-wait'
                                                            : isValid && !needsRemining
                                                                ? 'bg-white border border-[var(--border-light)] text-[var(--fg-4)] hover:border-[var(--purple-4)] hover:text-[var(--purple-4)]'
                                                                : 'bg-[var(--purple-4)] text-white hover:bg-[var(--purple-4)]/90 shadow-lg shadow-purple-200'
                                                            }`}
                                                    >
                                                        {isMining ? (
                                                            <>
                                                                <div className='w-3 h-3 border-2 border-muted border-t-transparent rounded-full animate-spin' />
                                                                <span>Mining...</span>
                                                            </>
                                                        ) : (
                                                            <span>{isValid && !needsRemining ? 'Re-Mine' : 'Mine Block'}</span>
                                                        )}
                                                    </button>
                                                </div>
                                                {/* Connector Line Logic implied by Archer */}
                                            </div>
                                        </ArcherElement>
                                    );
                                })}
                                {/* Add Block Ghost Card */}
                                <div className='w-[100px] h-[400px] flex items-center justify-center opacity-0'>
                                    {/* Spacer for scroll */}
                                </div>
                            </div>
                        </ArcherContainer>
                    </div>
                </div>
                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className='fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 md:hidden' onClick={() => setIsMobileMenuOpen(false)}>
                        <div className='w-full max-w-sm bg-white rounded-2xl shadow-2xl animate-slide-up overflow-hidden border border-[var(--border-light)]' onClick={e => e.stopPropagation()}>
                            <div className='p-4 border-b border-[var(--border-light)] flex justify-between items-center bg-[var(--bg-2)]'>
                                <span className='text-xs font-bold uppercase tracking-widest text-[var(--fg-4)]'>Protocol Settings</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className='w-6 h-6 rounded-full bg-white border border-[var(--border-light)] flex items-center justify-center text-muted'>✕</button>
                            </div>
                            <div className='p-4 space-y-6'>
                                <div>
                                    <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Difficulty</h3>
                                    <input
                                        type='range'
                                        min='1'
                                        max='5'
                                        value={difficulty}
                                        onChange={e => setDifficulty(Number(e.target.value))}
                                        className='w-full accent-[var(--purple-4)] h-2 bg-[var(--bg-2)] rounded-lg appearance-none'
                                    />
                                    <div className='text-center mt-2 text-xs font-bold text-[var(--purple-4)]'>{difficulty} Leading Zeros</div>
                                </div>
                                <div className='pt-4 border-t border-[var(--border-light)]'>
                                    <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Status</h3>
                                    <div className='flex justify-between items-center p-3 bg-[var(--bg-2)] rounded-xl'>
                                        <span className='text-xs font-bold text-muted'>Hashrate</span>
                                        <span className='text-xs font-bold text-[var(--fg-4)]'>{mining !== null ? `${hashRate.toLocaleString()} H/s` : 'IDLE'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}


