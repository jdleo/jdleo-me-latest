'use client';

import Link from 'next/link';
import { strings } from '../../constants/strings';
import { useState, useEffect } from 'react';
import ReactConfetti from 'react-confetti';
import crypto from 'crypto';
import { Breadcrumbs } from '@/components/SEO/Breadcrumbs';

type Block = {
    data: string;
    nonce: number;
    previousHash: string;
    hash: string;
    timestamp: number;
};

type Particle = {
    id: number;
    width: string;
    height: string;
    backgroundColor: string;
    boxShadow: string;
    left: string;
    top: string;
    animationDuration: string;
    animationDelay: string;
};

const GENESIS_HASH = '0'.repeat(64);

const BlockCard = ({
    block,
    index,
    onDataChange,
    onMine,
    isMining,
}: {
    block: Block;
    index: number;
    onDataChange: (index: number, data: string) => void;
    onMine: (index: number) => void;
    isMining: boolean;
}) => (
    <div
        className={`
        w-full sm:w-[400px] p-4 sm:p-6 rounded-xl
        glass-card transition-all duration-300
        ${isMining ? 'animate-pulse-slow shadow-orbital-glow-sm' : 'hover:shadow-orbital-glow-sm'}
    `}
    >
        <div className='flex flex-col gap-3 sm:gap-4'>
            <div className='flex justify-between items-center'>
                <div className='text-[color:var(--foreground)] text-opacity-60 text-xs sm:text-sm'>
                    Block {index + 1}
                </div>
                <div className='text-[color:var(--foreground)] text-opacity-40 text-[10px] sm:text-xs'>
                    {new Date(block.timestamp).toLocaleTimeString()}
                </div>
            </div>

            <textarea
                value={block.data}
                onChange={e => onDataChange(index, e.target.value)}
                placeholder='Enter block data'
                rows={3}
                className='w-full p-2 sm:p-3 rounded-lg bg-[color:var(--secondary)] border border-[color:var(--border)]
                         text-[color:var(--foreground)] text-xs sm:text-sm
                         placeholder:text-[color:var(--foreground)] placeholder:text-opacity-30 
                         focus:outline-none focus:border-[color:var(--primary)] focus:border-opacity-50
                         transition-all duration-300 resize-none'
            />

            <div className='flex justify-between text-[color:var(--foreground)] text-opacity-60 text-xs sm:text-sm'>
                <span>Nonce:</span>
                <span className='font-mono'>{block.nonce}</span>
            </div>

            <div className='text-[color:var(--foreground)] text-opacity-60 text-[10px] sm:text-xs'>
                <div className='mb-1'>Previous Hash:</div>
                <div className='font-mono break-all bg-[color:var(--background)] bg-opacity-50 p-2 rounded-lg'>
                    {block.previousHash}
                </div>
            </div>

            <div className='text-[color:var(--foreground)] text-opacity-60 text-[10px] sm:text-xs'>
                <div className='mb-1'>Current Hash:</div>
                <div className='font-mono break-all bg-[color:var(--background)] bg-opacity-50 p-2 rounded-lg'>
                    {block.hash}
                </div>
            </div>

            <button
                onClick={() => onMine(index)}
                disabled={isMining}
                className='relative px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500
                         text-white text-xs sm:text-sm font-bold overflow-hidden group transition-all
                         hover:shadow-orbital-glow-sm disabled:opacity-50 disabled:hover:shadow-none w-full'
            >
                <span className='absolute inset-0 w-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-50 group-hover:w-full transition-all duration-500 blur-lg'></span>
                <span className='relative z-10'>{isMining ? 'Mining...' : 'Mine Block'}</span>
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
    const [error, setError] = useState<string | null>(null);
    const [difficulty, setDifficulty] = useState(3);
    const [hashRate, setHashRate] = useState(0);
    const [showAllBlocks, setShowAllBlocks] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        setIsLoaded(true);

        // Generate particles once on component mount
        const newParticles = Array.from({ length: 8 }, (_, i) => {
            return {
                id: i,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                backgroundColor: `rgba(${150 + Math.random() * 100}, ${150 + Math.random() * 100}, ${
                    200 + Math.random() * 55
                }, ${0.3 + Math.random() * 0.3})`,
                boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(${150 + Math.random() * 100}, ${
                    150 + Math.random() * 100
                }, ${200 + Math.random() * 55}, 0.3)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 10 + 10}s`,
                animationDelay: `${Math.random() * 5}s`,
            };
        });

        setParticles(newParticles);
    }, []);

    const calculateHash = (data: string, nonce: number, previousHash: string, timestamp: number): string => {
        const message = `${data}${nonce}${previousHash}${timestamp}`;
        return crypto.createHash('sha256').update(message).digest('hex');
    };

    const isValidHash = (hash: string): boolean => {
        return hash.startsWith('0'.repeat(difficulty));
    };

    const handleDataChange = (index: number, data: string) => {
        const newBlocks = [...blocks];
        newBlocks[index] = { ...newBlocks[index], data };
        setBlocks(newBlocks);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            for (let i = 1; i < blocks.length; i++) {
                const currentHash = calculateHash(
                    blocks[i].data,
                    blocks[i].nonce,
                    blocks[i].previousHash,
                    blocks[i].timestamp
                );
                if (currentHash !== blocks[i].hash && blocks[i].hash !== 'N/A') {
                    setError(`Chain broken at block ${i + 1}`);
                    return;
                }
            }
            setError(null);
        }, 500);

        return () => clearTimeout(timer);
    }, [blocks]);

    const mineBlock = async (index: number) => {
        setMining(index);
        setError(null);
        const startTime = Date.now();
        let hashCount = 0;

        const block = blocks[index];
        let nonce = 0;
        let hash = '';
        const timestamp = Date.now();

        while (true) {
            hash = calculateHash(block.data, nonce, block.previousHash, timestamp);
            hashCount++;

            if (hashCount % 100 === 0) {
                const currentTime = Date.now();
                const timeDiff = (currentTime - startTime) / 1000;
                setHashRate(Math.floor(hashCount / timeDiff));
                await new Promise(resolve => setTimeout(resolve, 0));
            }

            if (isValidHash(hash)) break;
            nonce++;
        }

        const newBlocks = [...blocks];
        newBlocks[index] = { ...block, nonce, hash, timestamp };

        if (index === blocks.length - 1) {
            newBlocks.push({
                data: '',
                nonce: 0,
                previousHash: hash,
                hash: 'N/A',
                timestamp: Date.now(),
            });
        }

        setBlocks(newBlocks);
        setMining(null);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
    };

    return (
        <div className='min-h-screen bg-[color:var(--background)] overflow-hidden orbital-grid'>
            {showConfetti && <ReactConfetti />}

            {/* Background gradient effects */}
            <div className='fixed inset-0 bg-[color:var(--background)] z-[-2]' />
            <div
                className='fixed top-[-50%] left-[-20%] w-[140%] h-[140%] z-[-1] opacity-30 animate-spin-slow'
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(94, 106, 210, 0.1) 0%, transparent 70%)',
                    transformOrigin: 'center center',
                    animationDuration: '120s',
                }}
            />

            {/* Header */}
            <header className='absolute top-0 right-0 p-4 sm:p-6'>
                <nav className='flex gap-4 sm:gap-6 text-[color:var(--foreground)] text-opacity-70 text-sm sm:text-base'>
                    <Link href='/apps' className='linear-link'>
                        Apps
                    </Link>
                    <Link href='/' className='linear-link'>
                        Home
                    </Link>
                    <a href={`mailto:${strings.EMAIL}`} className='linear-link'>
                        Email
                    </a>
                    <a href={strings.LINKEDIN_URL} target='_blank' rel='noopener noreferrer' className='linear-link'>
                        LinkedIn
                    </a>
                    <a href={strings.GITHUB_URL} target='_blank' rel='noopener noreferrer' className='linear-link'>
                        GitHub
                    </a>
                </nav>
            </header>

            <main
                className={`flex-1 flex flex-col items-center pt-24 sm:pt-28 pb-8 px-4 transition-opacity duration-700 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <div className='mb-6 text-center'>
                    <h1 className='text-2xl sm:text-3xl font-bold mb-2'>
                        <span className='gradient-text'>Blockchain Demo</span>
                    </h1>
                    <p className='text-[color:var(--foreground)] text-opacity-70 max-w-md mb-6'>
                        Interactive demonstration of how blockchain technology works.
                    </p>
                </div>

                <div className='flex flex-col items-center gap-3 mb-6 glass-card p-4 rounded-xl'>
                    <div className='text-[color:var(--foreground)] text-opacity-80 text-sm sm:text-base'>
                        Difficulty Target: {difficulty} leading zeros
                    </div>
                    <input
                        type='range'
                        min='1'
                        max='6'
                        value={difficulty}
                        onChange={e => setDifficulty(Number(e.target.value))}
                        className='w-36 sm:w-48 accent-[color:var(--primary)]'
                    />
                    {mining !== null && (
                        <div className='text-[color:var(--foreground)] text-opacity-60 text-xs sm:text-sm'>
                            Mining at {hashRate.toLocaleString()} hashes/second
                        </div>
                    )}
                </div>

                {error && (
                    <div className='text-red-400 mb-4 px-4 py-2 text-sm rounded-lg bg-red-400 bg-opacity-10 border border-red-400 border-opacity-20'>
                        {error}
                    </div>
                )}

                {/* Mobile View */}
                <div className='sm:hidden flex flex-col gap-4 w-full'>
                    {blocks.slice(Math.max(0, blocks.length - 3)).map((block, idx) => (
                        <div
                            key={blocks.length - Math.min(3, blocks.length) + idx}
                            className='transition-all duration-300'
                        >
                            <BlockCard
                                block={block}
                                index={blocks.length - Math.min(3, blocks.length) + idx}
                                onDataChange={handleDataChange}
                                onMine={mineBlock}
                                isMining={mining === blocks.length - Math.min(3, blocks.length) + idx}
                            />
                            {idx < Math.min(2, blocks.length - 1) && (
                                <div className='flex justify-center my-2'>
                                    <div className='w-px h-8 bg-gradient-to-b from-[color:var(--foreground)] from-opacity-20 to-transparent' />
                                </div>
                            )}
                        </div>
                    ))}
                    {blocks.length > 3 && (
                        <button
                            onClick={() => setShowAllBlocks(true)}
                            className='mt-4 px-4 py-2 rounded-lg bg-[color:var(--secondary)] border border-[color:var(--border)]
                                     text-[color:var(--foreground)] text-sm hover:bg-opacity-80 
                                     transition-all duration-300'
                        >
                            View All Blocks ({blocks.length})
                        </button>
                    )}
                </div>

                {/* Desktop View */}
                <div className='hidden sm:flex flex-col items-center'>
                    {blocks.map((block, index) => (
                        <div
                            key={index}
                            className='transform transition-all duration-500'
                            style={{
                                transform: `translate(${index * 40}px, ${index * 20}px)`,
                            }}
                        >
                            <BlockCard
                                block={block}
                                index={index}
                                onDataChange={handleDataChange}
                                onMine={mineBlock}
                                isMining={mining === index}
                            />
                            {index < blocks.length - 1 && (
                                <div className='absolute -bottom-8 left-1/2 transform -translate-x-1/2 rotate-45'>
                                    <div className='w-px h-16 bg-gradient-to-b from-[color:var(--foreground)] from-opacity-20 to-transparent' />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Floating particles for orbital effect */}
                <div className='fixed inset-0 pointer-events-none'>
                    {particles.map(particle => (
                        <div
                            key={particle.id}
                            className='absolute rounded-full animate-float'
                            style={{
                                width: particle.width,
                                height: particle.height,
                                backgroundColor: particle.backgroundColor,
                                boxShadow: particle.boxShadow,
                                left: particle.left,
                                top: particle.top,
                                animationDuration: particle.animationDuration,
                                animationDelay: particle.animationDelay,
                            }}
                        />
                    ))}
                </div>
            </main>

            {/* Mobile Full Chain Modal */}
            {showAllBlocks && (
                <div className='fixed inset-0 bg-[color:var(--background)] bg-opacity-95 backdrop-blur-sm z-50 overflow-y-auto'>
                    <div className='min-h-screen p-4 flex flex-col'>
                        <div className='flex justify-between items-center mb-4'>
                            <div className='text-[color:var(--foreground)] font-bold'>
                                <span className='gradient-text'>All Blocks</span>
                            </div>
                            <button
                                onClick={() => setShowAllBlocks(false)}
                                className='text-[color:var(--foreground)] text-opacity-60 hover:text-opacity-100 transition-colors px-3 py-1 rounded-lg border border-[color:var(--border)]'
                            >
                                Close
                            </button>
                        </div>
                        <div className='flex flex-col gap-4'>
                            {blocks.map((block, index) => (
                                <div key={index}>
                                    <BlockCard
                                        block={block}
                                        index={index}
                                        onDataChange={handleDataChange}
                                        onMine={mineBlock}
                                        isMining={mining === index}
                                    />
                                    {index < blocks.length - 1 && (
                                        <div className='flex justify-center my-2'>
                                            <div className='w-px h-8 bg-gradient-to-b from-[color:var(--foreground)] from-opacity-20 to-transparent' />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
