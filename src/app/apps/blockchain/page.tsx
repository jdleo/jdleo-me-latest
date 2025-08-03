'use client';

import Link from 'next/link';
import { strings } from '../../constants/strings';
import { useState, useEffect, useRef } from 'react';
import ReactConfetti from 'react-confetti';
import crypto from 'crypto';
import { Breadcrumbs } from '@/components/SEO/Breadcrumbs';
import { ArcherContainer, ArcherElement } from 'react-archer';

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
    <div
        className={`
        w-[280px] sm:w-[300px] p-4 rounded-xl flex-shrink-0
        transition-all duration-500
        ${isValid ? 'glass-card hover:shadow-orbital-glow-sm' : 'bg-red-50 border-2 border-red-200 shadow-lg'}
        ${isMining ? 'animate-pulse-slow shadow-orbital-glow-sm' : ''}
        ${!isValid && !isMining ? 'animate-shake' : ''}
    `}
    >
        <div className='flex flex-col gap-3'>
            <div className='flex justify-between items-center'>
                <div className='flex items-center gap-2'>
                    <div className='text-[color:var(--foreground)] text-opacity-60 text-xs sm:text-sm font-semibold'>
                        Block {index + 1}
                    </div>
                    {!isValid && index > 0 && (
                        <div className='text-red-500 text-xs bg-red-100 px-2 py-1 rounded-full animate-pulse'>
                            Invalid
                        </div>
                    )}
                    {needsRemining && (
                        <div className='text-blue-500 text-xs bg-blue-100 px-2 py-1 rounded-full animate-pulse'>
                            Ready to mine
                        </div>
                    )}
                </div>
                <div className='text-[color:var(--foreground)] text-opacity-40 text-[10px] sm:text-xs'>
                    {new Date(block.timestamp).toLocaleTimeString()}
                </div>
            </div>

            <textarea
                value={block.data}
                onChange={e => onDataChange(index, e.target.value)}
                placeholder='Enter block data'
                rows={2}
                className={`w-full p-2 sm:p-3 rounded-lg border text-xs sm:text-sm
                         placeholder:text-[color:var(--foreground)] placeholder:text-opacity-30 
                         focus:outline-none focus:border-opacity-50 transition-all duration-300 resize-none
                         ${
                             isValid
                                 ? 'bg-[color:var(--secondary)] border-[color:var(--border)] text-[color:var(--foreground)] focus:border-[color:var(--primary)]'
                                 : 'bg-red-50 border-red-300 text-red-900 focus:border-red-500'
                         }`}
            />

            <div className='flex justify-between text-[color:var(--foreground)] text-opacity-60 text-xs'>
                <span>Nonce:</span>
                <span className='font-mono'>{block.nonce}</span>
            </div>

            <div className='text-[color:var(--foreground)] text-opacity-60 text-[10px] sm:text-xs'>
                <div className='mb-1'>Previous Hash:</div>
                <div className='font-mono break-all bg-[color:var(--background)] bg-opacity-50 p-2 rounded text-[9px] sm:text-[10px]'>
                    {block.previousHash}
                </div>
            </div>

            <div className='text-[color:var(--foreground)] text-opacity-60 text-[10px] sm:text-xs'>
                <div className='mb-1'>Current Hash:</div>
                <div
                    className={`font-mono break-all p-2 rounded text-[9px] sm:text-[10px] ${
                        isValid ? 'bg-[color:var(--background)] bg-opacity-50' : 'bg-red-100 text-red-800'
                    }`}
                >
                    {block.hash}
                </div>
            </div>

            <button
                onClick={() => onMine(index)}
                disabled={isMining}
                className={`button-primary disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm group justify-center ${
                    needsRemining && !isMining ? 'animate-pulse' : ''
                }`}
            >
                <span>{isMining ? 'Mining...' : 'Mine Block'}</span>
                <svg
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className={isMining ? 'animate-spin' : ''}
                >
                    {isMining ? (
                        // Loading spinner when mining
                        <circle cx='12' cy='12' r='3' />
                    ) : (
                        // Mining pick icon
                        <>
                            <path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' />
                        </>
                    )}
                </svg>
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
    const [isLoaded, setIsLoaded] = useState(false);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [invalidBlocks, setInvalidBlocks] = useState<Set<number>>(new Set());
    const [blocksNeedingRemining, setBlocksNeedingRemining] = useState<Set<number>>(new Set());
    const scrollContainerRef = useRef<HTMLDivElement>(null);

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

    const validateChain = (blocks: Block[]): { invalid: Set<number>; needsRemining: Set<number> } => {
        const invalid = new Set<number>();
        const needsRemining = new Set<number>();

        for (let i = 0; i < blocks.length; i++) {
            const currentBlock = blocks[i];

            // Genesis block is always valid
            if (i === 0) {
                // Genesis block can be mined if it has data but no valid hash
                if (currentBlock.data && (currentBlock.hash === GENESIS_HASH || !isValidHash(currentBlock.hash))) {
                    needsRemining.add(i);
                }
                continue;
            }

            const previousBlock = blocks[i - 1];

            // Check if previous hash matches (chain link integrity)
            if (currentBlock.previousHash !== previousBlock.hash) {
                invalid.add(i);
                needsRemining.add(i);
                continue;
            }

            // If block has no hash (N/A), it needs mining
            if (currentBlock.hash === 'N/A') {
                needsRemining.add(i);
                continue;
            }

            // Check if current hash is correct for the current data
            const calculatedHash = calculateHash(
                currentBlock.data,
                currentBlock.nonce,
                currentBlock.previousHash,
                currentBlock.timestamp
            );

            if (calculatedHash !== currentBlock.hash) {
                // Hash doesn't match data - block was modified after mining
                invalid.add(i);
                needsRemining.add(i);
            } else if (!isValidHash(currentBlock.hash)) {
                // Hash doesn't meet difficulty requirement
                needsRemining.add(i);
            }
        }

        return { invalid, needsRemining };
    };

    const handleDataChange = (index: number, data: string) => {
        const newBlocks = [...blocks];

        // Update the block data
        newBlocks[index] = { ...newBlocks[index], data };

        // If this block was previously mined and we're changing its data,
        // we need to mark it and all subsequent blocks as needing re-mining
        if (newBlocks[index].hash !== 'N/A' && newBlocks[index].hash !== GENESIS_HASH) {
            // Reset this block's hash since data changed
            newBlocks[index].hash = 'N/A';
            newBlocks[index].nonce = 0;

            // Reset all subsequent blocks since the chain is now broken
            for (let i = index + 1; i < newBlocks.length; i++) {
                newBlocks[i] = {
                    ...newBlocks[i],
                    hash: 'N/A',
                    nonce: 0,
                    previousHash: i === index + 1 ? newBlocks[index].hash : 'N/A',
                };
            }
        }

        setBlocks(newBlocks);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            const { invalid, needsRemining } = validateChain(blocks);
            setInvalidBlocks(invalid);
            setBlocksNeedingRemining(needsRemining);

            if (invalid.size > 0) {
                setError(`Chain broken - ${invalid.size} block(s) need re-mining to restore integrity!`);
            } else if (needsRemining.size > 0) {
                setError(`${needsRemining.size} block(s) ready to mine.`);
            } else {
                setError(null);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [blocks, difficulty]);

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

        // Update subsequent blocks' previousHash to chain properly
        for (let i = index + 1; i < newBlocks.length; i++) {
            newBlocks[i] = {
                ...newBlocks[i],
                previousHash: newBlocks[i - 1].hash,
            };
        }

        // Add new empty block if we mined the last block
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

        // Auto-scroll to the end after mining
        setTimeout(() => {
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTo({
                    left: scrollContainerRef.current.scrollWidth,
                    behavior: 'smooth',
                });
            }
        }, 300);
    };

    return (
        <div className='min-h-screen bg-[color:var(--background)] overflow-x-auto orbital-grid'>
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
            <header className='absolute top-0 right-0 p-4 sm:p-6 z-10'>
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
                        Interactive demonstration of how blockchain technology works. Watch the chain react!
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
                    <div
                        className={`mb-4 px-4 py-2 text-sm rounded-lg border animate-pulse ${
                            invalidBlocks.size > 0
                                ? 'text-red-600 bg-red-50 border-red-200'
                                : 'text-blue-600 bg-blue-50 border-blue-200'
                        }`}
                    >
                        ⚠️ {error}
                    </div>
                )}

                {/* Horizontal Blockchain with Arrows */}
                <div ref={scrollContainerRef} className='w-full overflow-x-auto pb-4'>
                    <div className='flex justify-start'>
                        <div className='inline-flex px-8 sm:px-12'>
                            <ArcherContainer
                                strokeColor='rgba(94, 106, 210, 0.6)'
                                strokeWidth={2}
                                strokeDasharray='0'
                                noCurves={false}
                                offset={8}
                                svgContainerStyle={{
                                    zIndex: 1,
                                }}
                            >
                                <div className='flex gap-6 sm:gap-8 items-center py-8'>
                                    {blocks.map((block, index) => {
                                        const isBlockValid = !invalidBlocks.has(index);
                                        const nextBlockValid = !invalidBlocks.has(index + 1);
                                        const needsRemining = blocksNeedingRemining.has(index);

                                        return (
                                            <ArcherElement
                                                key={index}
                                                id={`block-${index}`}
                                                relations={
                                                    index < blocks.length - 1
                                                        ? [
                                                              {
                                                                  targetId: `block-${index + 1}`,
                                                                  targetAnchor: 'left',
                                                                  sourceAnchor: 'right',
                                                                  style: {
                                                                      strokeColor:
                                                                          isBlockValid && nextBlockValid
                                                                              ? 'rgba(34, 197, 94, 0.8)'
                                                                              : 'rgba(239, 68, 68, 0.8)',
                                                                      strokeWidth: 3,
                                                                      strokeDasharray:
                                                                          isBlockValid && nextBlockValid ? '0' : '8,4',
                                                                  },
                                                                  label: (
                                                                      <div
                                                                          className={`text-xs px-2 py-1 rounded font-semibold ${
                                                                              isBlockValid && nextBlockValid
                                                                                  ? 'bg-green-100 border border-green-200 text-green-700'
                                                                                  : 'bg-red-100 border border-red-200 text-red-700 animate-pulse'
                                                                          }`}
                                                                      >
                                                                          {isBlockValid && nextBlockValid ? '✓' : '✗'}
                                                                      </div>
                                                                  ),
                                                              },
                                                          ]
                                                        : []
                                                }
                                            >
                                                <div className='relative'>
                                                    <BlockCard
                                                        block={block}
                                                        index={index}
                                                        onDataChange={handleDataChange}
                                                        onMine={mineBlock}
                                                        isMining={mining === index}
                                                        isValid={isBlockValid}
                                                        needsRemining={needsRemining}
                                                    />
                                                    {/* Block index indicator */}
                                                    <div className='absolute -top-8 left-1/2 transform -translate-x-1/2'>
                                                        <div
                                                            className={`text-xs font-mono px-2 py-1 rounded ${
                                                                isBlockValid
                                                                    ? 'text-[color:var(--foreground)] text-opacity-40 bg-[color:var(--secondary)]'
                                                                    : 'text-red-600 bg-red-100 animate-pulse'
                                                            }`}
                                                        >
                                                            #{index}
                                                        </div>
                                                    </div>
                                                </div>
                                            </ArcherElement>
                                        );
                                    })}
                                </div>
                            </ArcherContainer>
                        </div>
                    </div>
                </div>

                {/* Chain Status */}
                <div className='mt-6 flex flex-wrap gap-4 justify-center'>
                    <div className='glass-card px-4 py-2 rounded-lg'>
                        <div className='text-[color:var(--foreground)] text-opacity-60 text-xs'>Chain Length</div>
                        <div className='text-[color:var(--foreground)] font-bold'>{blocks.length} blocks</div>
                    </div>
                    <div className='glass-card px-4 py-2 rounded-lg'>
                        <div className='text-[color:var(--foreground)] text-opacity-60 text-xs'>Chain Status</div>
                        <div
                            className={`font-bold ${
                                error ? (invalidBlocks.size > 0 ? 'text-red-500' : 'text-blue-500') : 'text-green-500'
                            }`}
                        >
                            {invalidBlocks.size > 0
                                ? 'Broken'
                                : blocksNeedingRemining.size > 0
                                ? 'Incomplete'
                                : 'Valid'}
                        </div>
                    </div>
                    <div className='glass-card px-4 py-2 rounded-lg'>
                        <div className='text-[color:var(--foreground)] text-opacity-60 text-xs'>Blocks to Mine</div>
                        <div
                            className={`font-bold ${
                                blocksNeedingRemining.size > 0 ? 'text-blue-500' : 'text-green-500'
                            }`}
                        >
                            {blocksNeedingRemining.size}
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className='mt-8 max-w-2xl text-center'>
                    <div className='glass-card p-4 rounded-xl'>
                        <h3 className='text-[color:var(--foreground)] font-semibold mb-2 text-sm sm:text-base'>
                            How it works:
                        </h3>
                        <div className='text-[color:var(--foreground)] text-opacity-70 text-xs sm:text-sm space-y-1'>
                            <p>• Add data to a block and mine it to find a valid hash</p>
                            <p>• Each block cryptographically links to the previous block's hash</p>
                            <p>
                                • <span className='text-green-600 font-semibold'>Green arrows</span> = valid
                                connections, <span className='text-red-600 font-semibold'>Red dashed arrows</span> =
                                broken chain
                            </p>
                            <p>
                                • Changing mined block data{' '}
                                <span className='text-red-600 font-semibold'>breaks the chain</span> and requires
                                re-mining
                            </p>
                            <p>• Mine blocks sequentially to rebuild the valid chain</p>
                        </div>
                    </div>
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
        </div>
    );
}
