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

const BlockCard = ({
    block,
    index,
    onDataChange,
    onMine,
    isMining,
    isValid,
    needsRemining,
}: {
    block: Block;
    index: number;
    onDataChange: (index: number, data: string) => void;
    onMine: (index: number) => void;
    isMining: boolean;
    isValid: boolean;
    needsRemining: boolean;
}) => (
    <div className={`w-[280px] p-4 rounded-lg flex-shrink-0 transition-all duration-300 border ${isValid ? 'bg-white/5 border-[var(--color-border)] hover:border-[var(--color-accent)]/30' : 'bg-red-500/10 border-red-500/50 shadow-lg'}`}>
        <div className='flex flex-col gap-4'>
            <div className='flex justify-between items-center'>
                <span className={`text-[10px] font-mono tracking-widest uppercase ${isValid ? 'text-[var(--color-text-dim)]' : 'text-red-400'}`}>BLOCK_0{index + 1}</span>
                {needsRemining && <span className='text-[8px] font-mono bg-[var(--color-accent)]/20 text-[var(--color-accent)] px-1.5 py-0.5 rounded'>MINE_REQUIRED</span>}
            </div>

            <textarea
                value={block.data}
                onChange={e => onDataChange(index, e.target.value)}
                placeholder='DATA_PAYLOAD'
                className='w-full bg-black/40 border border-[var(--color-border)] p-2 text-xs font-mono text-[var(--color-text)] rounded focus:border-[var(--color-accent)] outline-none transition-colors resize-none h-20'
            />

            <div className='space-y-4 text-[10px] font-mono'>
                <div className='flex justify-between border-b border-[var(--color-border)] pb-1'>
                    <span className='opacity-40 uppercase'>Nonce</span>
                    <span className='text-[var(--color-accent)]'>{block.nonce}</span>
                </div>

                <div className='space-y-1.5'>
                    <span className='opacity-40 uppercase block'>Prev_Hash</span>
                    <div className='text-[9px] bg-black/40 p-2 rounded break-all opacity-80 leading-relaxed truncate'>
                        {block.previousHash}
                    </div>
                </div>

                <div className='space-y-1.5'>
                    <span className='opacity-40 uppercase block'>Current_Hash</span>
                    <div className={`text-[9px] p-2 rounded break-all leading-relaxed ${isValid ? 'bg-black/40 text-[var(--color-accent)]' : 'bg-red-500/20 text-red-400'}`}>
                        {block.hash}
                    </div>
                </div>
            </div>

            <button
                onClick={() => onMine(index)}
                disabled={isMining}
                className={`w-full py-2 border border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-[10px] font-mono transition-all rounded uppercase tracking-widest ${isMining ? 'animate-pulse opacity-50 cursor-not-allowed' : ''}`}
            >
                {isMining ? 'MINE_IN_PROGRESS...' : '[EXECUTE_MINING]'}
            </button>
        </div>
    </div>
);

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
    const scrollContainerRef = useRef<HTMLDivElement>(null);

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

    return (
        <>
            <WebVitals />
            {showConfetti && <ReactConfetti style={{ zIndex: 100 }} />}
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
                            <div className='terminal-title'>johnleonardo — ~/blockchain-net</div>
                        </div>

                        <div className='terminal-split flex-grow overflow-hidden'>
                            {/* Left Sidebar: Controls & Metrics */}
                            <div className='terminal-pane border-r border-[var(--color-border)] hidden md:flex flex-col gap-8'>
                                <div>
                                    <div className='flex items-center gap-2 mb-6 text-[var(--color-accent)]'>
                                        <span className='terminal-prompt'>➜</span>
                                        <span className='text-sm uppercase tracking-widest font-bold'>Protocol</span>
                                    </div>
                                    <nav className='flex flex-col gap-4 mb-8'>
                                        <Link href='/' className='text-lg hover:text-[var(--color-accent)] transition-colors'>~/home</Link>
                                        <Link href='/apps' className='text-lg hover:text-[var(--color-accent)] transition-colors'>~/apps</Link>
                                    </nav>

                                    <div className='space-y-6'>
                                        <div className='font-mono'>
                                            <span className='text-[var(--color-text)] opacity-70 text-[10px] uppercase tracking-widest'>$ set --difficulty</span>
                                            <div className='mt-4 flex flex-col gap-2'>
                                                <input
                                                    type='range'
                                                    min='1'
                                                    max='6'
                                                    value={difficulty}
                                                    onChange={e => setDifficulty(Number(e.target.value))}
                                                    className='w-full accent-[var(--color-accent)] bg-white/10 rounded-lg h-1'
                                                />
                                                <div className='flex justify-between text-[10px] text-[var(--color-text-dim)]'>
                                                    <span>FAST</span>
                                                    <span className='text-[var(--color-accent)] font-bold'>{difficulty} ZEROS</span>
                                                    <span>SLOW</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className='font-mono pt-4'>
                                            <span className='text-[var(--color-text)] opacity-40 text-[10px] uppercase tracking-widest'>$ node --status</span>
                                            <div className='mt-4 space-y-3'>
                                                <div className='flex justify-between text-xs border-b border-[var(--color-border)] pb-2'>
                                                    <span className='opacity-60'>HASHRATE</span>
                                                    <span className='text-[var(--color-accent)]'>{mining !== null ? `${hashRate.toLocaleString()} H/s` : 'IDLE'}</span>
                                                </div>
                                                <div className='flex justify-between text-xs border-b border-[var(--color-border)] pb-2'>
                                                    <span className='opacity-60'>STATUS</span>
                                                    <span className={invalidBlocks.size > 0 ? 'text-red-400' : 'text-green-400'}>
                                                        {invalidBlocks.size > 0 ? 'FORKED/BROKEN' : 'SYNCHRONIZED'}
                                                    </span>
                                                </div>
                                                <div className='flex justify-between text-xs border-b border-[var(--color-border)] pb-2'>
                                                    <span className='opacity-60'>BLOCKS</span>
                                                    <span className='text-[var(--color-text)]'>{blocks.length}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='mt-auto pt-8 border-t border-[var(--color-border)] opacity-40 italic font-mono text-[10px]'>
                                    "Immutable ledger records via SHA-256 proof-of-work mechanism."
                                </div>
                            </div>

                            {/* Main Display: Blockchain Visualization */}
                            <div className='terminal-pane bg-black/20 flex flex-col p-0 overflow-x-auto w-full'>
                                <ArcherContainer
                                    strokeColor={invalidBlocks.size > 0 ? '#ef4444' : '#3EAF7C'}
                                    strokeWidth={1}
                                    strokeDasharray={invalidBlocks.size > 0 ? '5,5' : '0'}
                                    endShape={{ arrow: { arrowLength: 6 } }}
                                >
                                    <div className='p-12 inline-flex gap-8 items-center min-w-full'>
                                        {blocks.map((block, index) => (
                                            <ArcherElement
                                                key={index}
                                                id={`block-${index}`}
                                                relations={index < blocks.length - 1 ? [{ targetId: `block-${index + 1}`, targetAnchor: 'left', sourceAnchor: 'right' }] : []}
                                            >
                                                <div className='relative'>
                                                    <BlockCard
                                                        block={block}
                                                        index={index}
                                                        onDataChange={handleDataChange}
                                                        onMine={mineBlock}
                                                        isMining={mining === index}
                                                        isValid={!invalidBlocks.has(index)}
                                                        needsRemining={blocksNeedingRemining.has(index)}
                                                    />
                                                    <div className='absolute -top-8 left-0 text-[10px] font-mono opacity-30'>
                                                        PTR_0x{index.toString(16).padStart(4, '0')}
                                                    </div>
                                                </div>
                                            </ArcherElement>
                                        ))}
                                    </div>
                                </ArcherContainer>
                            </div>
                        </div>
                    </div>
                    {/* Console decoration */}
                    <div className='mt-4 flex items-center justify-between text-[10px] font-mono text-[var(--color-text-dim)] opacity-40 uppercase tracking-[0.2em] px-4'>
                        <div className='flex gap-6'>
                            <span>Latency: 2ms</span>
                            <span>Prot: SHA-256</span>
                        </div>
                        <span>p2p_network: fully_connected</span>
                    </div>
                </div>
            </main>
        </>
    );
}
