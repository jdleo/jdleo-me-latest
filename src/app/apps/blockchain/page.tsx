'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactConfetti from 'react-confetti';
import crypto from 'crypto';
import { ArcherContainer, ArcherElement } from 'react-archer';
import { strings } from '../../constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import { CpuChipIcon } from '@heroicons/react/24/outline';

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
    const [miningHash, setMiningHash] = useState<string | null>(null);
    const [invalidBlocks, setInvalidBlocks] = useState<Set<number>>(new Set());
    const [blocksNeedingRemining, setBlocksNeedingRemining] = useState<Set<number>>(new Set());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
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
        setMiningHash('0'.repeat(64));
        const startTime = Date.now();
        let hashCount = 0;
        const block = blocks[index];
        let nonce = 0;
        let hash = '';
        const timestamp = Date.now();

        while (true) {
            hash = calculateHash(block.data, nonce, block.previousHash, timestamp);
            hashCount++;
            if (hashCount % 250 === 0) {
                const currentTime = Date.now();
                setHashRate(Math.floor(hashCount / ((currentTime - startTime) / 1000)));
                setMiningHash(hash);
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
        setMiningHash(null);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
    };

    const healthy = invalidBlocks.size === 0;

    return (
        <>
            <WebVitals />
            {showConfetti && <ReactConfetti style={{ zIndex: 100 }} />}
            <main className='el-page'>
                <header className='el-nav'>
                    <Link href='/' className='el-logo' aria-label='John Leonardo home'>
                        John Leonardo
                    </Link>
                    <nav className='el-nav-links' aria-label='Primary navigation'>
                        <Link href='/apps' className='el-nav-link'>Apps</Link>
                        <Link href='/blog' className='el-nav-link'>Blog</Link>
                        <Link href='/apps/resume' className='el-nav-link'>Resume</Link>
                    </nav>
                    <div className='el-nav-actions'>
                        <Link href='/apps/chat' className='el-nav-link'>Chat</Link>
                        <Link href={`mailto:${strings.EMAIL}`} className='el-btn el-btn-dark el-btn-sm'>
                            Contact
                        </Link>
                    </div>
                </header>

                <section className='el-hero el-hero-page'>
                    <div className='el-hero-inner'>
                        <div className='el-hero-copy'>
                            <h1>Blockchain 101</h1>
                            <p className='el-hero-sub'>
                                Mine blocks, tamper with the data, and watch the chain break —
                                proof-of-work, live.
                            </p>
                        </div>
                    </div>
                </section>

                <section className='el-section el-sentiment'>
                    <div className='el-stat-grid'>
                        <div className='el-stat-card el-balance-card'>
                            <span className='el-stat-label'>Chain Health</span>
                            <div className='el-stat-value' style={{ color: healthy ? '#fdfdfb' : '#f0b429' }}>
                                {healthy ? 'Healthy' : 'Compromised'}
                            </div>
                        </div>
                        <div className='el-stat-card'>
                            <span className='el-stat-label'>Hashrate</span>
                            <div className='el-stat-value'>
                                {mining !== null ? `${hashRate.toLocaleString()} H/s` : 'Idle'}
                            </div>
                        </div>
                        <div className='el-stat-card'>
                            <span className='el-stat-label'>Block Height</span>
                            <div className='el-stat-value'>
                                #{blocks.length}
                            </div>
                        </div>
                        <div className='el-stat-card'>
                            <span className='el-stat-label'>Difficulty</span>
                            <div className='el-stat-value'>{difficulty} zeros</div>
                            <input
                                type='range'
                                min='1'
                                max='5'
                                value={difficulty}
                                onChange={e => setDifficulty(Number(e.target.value))}
                                className='el-diff-slider'
                                aria-label='Mining difficulty'
                            />
                        </div>
                    </div>

                    <div className='el-chart-block'>
                        <div className='el-chart-title'>
                            <span className='el-chart-title-label'>The Chain</span>
                            <span className='el-chart-pill'>
                                {invalidBlocks.size > 0 ? `${invalidBlocks.size} broken links` : 'all links valid'}
                            </span>
                        </div>

                        <ArcherContainer
                            strokeColor={healthy ? '#111110' : '#dc2626'}
                            strokeWidth={1.5}
                            strokeDasharray={healthy ? '0' : '5,5'}
                            endShape={{ arrow: { arrowLength: 4 } }}
                        >
                            <div className='el-chain-scroll'>
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
                                            <div className={`el-block-card ${!isValid ? 'is-invalid' : ''} ${isMining ? 'is-mining' : ''}`}>
                                                <div className='el-block-head'>
                                                    <span className='el-block-num'>{index}</span>
                                                    <span className='el-block-label'>Block</span>
                                                    {needsRemining && <span className='el-tag el-tag-red'>re-mine</span>}
                                                    {isValid && !needsRemining && block.hash !== 'N/A' && block.hash !== GENESIS_HASH && (
                                                        <span className='el-tag el-tag-green'>sealed</span>
                                                    )}
                                                </div>

                                                <textarea
                                                    value={block.data}
                                                    onChange={e => handleDataChange(index, e.target.value)}
                                                    placeholder='Enter transaction data...'
                                                    className='el-textarea el-block-textarea'
                                                    rows={3}
                                                />

                                                <div className='el-block-meta'>
                                                    <div className='el-kv'>
                                                        <span className='el-kv-label'>Nonce</span>
                                                        <div className='el-kv-value el-kv-mono-sm'>{block.nonce}</div>
                                                    </div>
                                                    <div className='el-kv'>
                                                        <span className='el-kv-label'>Timestamp</span>
                                                        <div className='el-kv-value el-kv-mono-sm'>
                                                            {mounted ? new Date(block.timestamp).toLocaleTimeString() : '—'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className='el-kv'>
                                                    <span className='el-kv-label'>Previous Hash</span>
                                                    <div className='el-hash-box el-hash-prev'>
                                                        {block.previousHash === GENESIS_HASH ? '0…0 (genesis)' : `${block.previousHash.slice(0, 24)}…`}
                                                    </div>
                                                </div>

                                                <div className='el-kv'>
                                                    <span className='el-kv-label'>Hash</span>
                                                    <div className={`el-hash-box ${isValid && block.hash !== 'N/A' ? 'el-hash-valid' : !isValid ? 'el-hash-invalid' : 'el-hash-pending'}`}>
                                                        {block.hash === 'N/A'
                                                            ? 'N/A — data changed'
                                                            : isMining
                                                                ? `${(miningHash || block.hash).slice(0, 24)}…`
                                                                : `${block.hash.slice(0, 24)}…`}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => mineBlock(index)}
                                                    disabled={mining !== null}
                                                    className={`el-btn ${isValid && !needsRemining ? 'el-btn-light' : 'el-btn-dark'} el-generate-btn`}
                                                >
                                                    <CpuChipIcon aria-hidden='true' />
                                                    {isMining ? 'Mining...' : needsRemining || block.hash === 'N/A' ? 'Mine Block' : 'Re-Mine'}
                                                </button>
                                            </div>
                                        </ArcherElement>
                                    );
                                })}
                            </div>
                        </ArcherContainer>
                    </div>
                </section>

                <footer className='el-footer'>
                    <div className='el-footer-inner'>
                        <span className='el-footer-logo'>John Leonardo</span>
                        <div className='el-footer-links'>
                            <a href={strings.GITHUB_URL} target='_blank' rel='noreferrer'>GitHub</a>
                            <a href={strings.LINKEDIN_URL} target='_blank' rel='noreferrer'>LinkedIn</a>
                            <a href={`mailto:${strings.EMAIL}`}>{strings.EMAIL}</a>
                        </div>
                        <span className='el-footer-copy'>© 2026. All rights reserved.</span>
                    </div>
                </footer>
            </main>
        </>
    );
}
