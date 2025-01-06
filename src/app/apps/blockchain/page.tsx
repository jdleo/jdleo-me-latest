'use client';

import Link from 'next/link';
import { strings } from '../../constants/strings';
import { useState, useEffect } from 'react';
import ReactConfetti from 'react-confetti';
import crypto from 'crypto';

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
        backdrop-blur-md shadow-xl
        border border-white/10 hover:border-white/20 
        transition-all duration-300
        ${isMining ? 'animate-pulse' : ''}
        bg-gradient-to-br from-white/10 via-white/5 to-transparent
    `}
    >
        <div className='flex flex-col gap-3 sm:gap-4'>
            <div className='flex justify-between items-center'>
                <div className='text-white/60 font-nunito text-xs sm:text-sm'>Block {index + 1}</div>
                <div className='text-white/40 font-nunito text-[10px] sm:text-xs'>
                    {new Date(block.timestamp).toLocaleTimeString()}
                </div>
            </div>

            <textarea
                value={block.data}
                onChange={e => onDataChange(index, e.target.value)}
                placeholder='Enter block data'
                rows={3}
                className='w-full p-2 sm:p-3 rounded-lg bg-white/5 backdrop-blur-sm 
                         border border-white/10 text-white font-nunito text-xs sm:text-sm
                         placeholder:text-white/30 focus:outline-none focus:border-white/20
                         resize-none'
            />

            <div className='flex justify-between text-white/60 font-nunito text-xs sm:text-sm'>
                <span>Nonce:</span>
                <span className='font-mono'>{block.nonce}</span>
            </div>

            <div className='text-white/60 font-nunito text-[10px] sm:text-xs'>
                <div className='mb-1'>Previous Hash:</div>
                <div className='font-mono break-all bg-black/20 p-2 rounded-lg'>{block.previousHash}</div>
            </div>

            <div className='text-white/60 font-nunito text-[10px] sm:text-xs'>
                <div className='mb-1'>Current Hash:</div>
                <div className='font-mono break-all bg-black/20 p-2 rounded-lg'>{block.hash}</div>
            </div>

            <button
                onClick={() => onMine(index)}
                disabled={isMining}
                className='w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg 
                         bg-gradient-to-r from-purple-400/80 via-pink-400/80 to-blue-400/80 
                         text-white font-nunito font-bold text-xs sm:text-sm
                         hover:opacity-90 transition-all duration-300
                         disabled:opacity-50 shadow-lg
                         hover:shadow-purple-500/20'
            >
                {isMining ? 'Mining...' : 'Mine Block'}
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
        let startTime = Date.now();
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
        <div className='flex min-h-screen bg-[#1d1d1d] overflow-hidden'>
            {showConfetti && <ReactConfetti />}

            <header className='absolute top-0 right-0 p-4 sm:p-6'>
                <nav className='flex gap-4 sm:gap-6 text-white/70 font-nunito text-sm sm:text-base'>
                    <Link href='/apps' className='hover:text-white transition-colors'>
                        Apps
                    </Link>
                    <a href={`mailto:${strings.EMAIL}`} className='hover:text-white transition-colors'>
                        Email
                    </a>
                    <a
                        href={strings.LINKEDIN_URL}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='hover:text-white transition-colors'
                    >
                        LinkedIn
                    </a>
                    <a
                        href={strings.GITHUB_URL}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='hover:text-white transition-colors'
                    >
                        GitHub
                    </a>
                </nav>
            </header>

            <main className='flex-1 flex flex-col items-center pt-20 sm:pt-24 pb-8 px-4'>
                <div className='flex flex-col items-center gap-3 mb-6'>
                    <div className='text-white/80 font-nunito text-sm sm:text-base'>
                        Difficulty Target: {difficulty} leading zeros
                    </div>
                    <input
                        type='range'
                        min='1'
                        max='6'
                        value={difficulty}
                        onChange={e => setDifficulty(Number(e.target.value))}
                        className='w-36 sm:w-48 accent-purple-400'
                    />
                    {mining !== null && (
                        <div className='text-white/60 font-nunito text-xs sm:text-sm'>
                            Mining at {hashRate.toLocaleString()} hashes/second
                        </div>
                    )}
                </div>

                {error && (
                    <div className='text-red-400 font-nunito mb-4 px-3 py-2 text-sm rounded-lg bg-red-500/10 backdrop-blur-sm'>
                        {error}
                    </div>
                )}

                {/* Mobile View */}
                <div className='sm:hidden flex flex-col gap-4 w-full'>
                    {blocks.slice(Math.max(0, blocks.length - 3)).map((block, idx) => (
                        <div key={blocks.length - Math.min(3, blocks.length) + idx} className='animate-fade-in'>
                            <BlockCard
                                block={block}
                                index={blocks.length - Math.min(3, blocks.length) + idx}
                                onDataChange={handleDataChange}
                                onMine={mineBlock}
                                isMining={mining === blocks.length - Math.min(3, blocks.length) + idx}
                            />
                            {idx < Math.min(2, blocks.length - 1) && (
                                <div className='flex justify-center my-2'>
                                    <div className='w-px h-8 bg-gradient-to-b from-white/20 to-transparent' />
                                </div>
                            )}
                        </div>
                    ))}
                    {blocks.length > 3 && (
                        <button
                            onClick={() => setShowAllBlocks(true)}
                            className='mt-4 px-4 py-2 rounded-lg bg-white/10 text-white font-nunito text-sm
                                     hover:bg-white/20 transition-colors'
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
                                    <div className='w-px h-16 bg-gradient-to-b from-white/20 to-transparent' />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>

            {/* Mobile Full Chain Modal */}
            {showAllBlocks && (
                <div className='fixed inset-0 bg-black/90 z-50 overflow-y-auto'>
                    <div className='min-h-screen p-4 flex flex-col'>
                        <div className='flex justify-between items-center mb-4'>
                            <div className='text-white font-nunito'>All Blocks</div>
                            <button onClick={() => setShowAllBlocks(false)} className='text-white/60 hover:text-white'>
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
                                            <div className='w-px h-8 bg-gradient-to-b from-white/20 to-transparent' />
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
