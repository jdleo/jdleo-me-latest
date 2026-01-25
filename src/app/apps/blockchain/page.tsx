'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactConfetti from 'react-confetti';
import crypto from 'crypto';
import { ArcherContainer, ArcherElement } from 'react-archer';
import { strings } from '../../constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import {
    DevicePhoneMobileIcon,
    PencilSquareIcon,
    DocumentTextIcon,
    CubeTransparentIcon,
    CpuChipIcon,
} from '@heroicons/react/24/outline';

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

    return (
        <>
            <WebVitals />
            {showConfetti && <ReactConfetti style={{ zIndex: 100 }} />}
            <main className='notion-page'>
                <header className={`notion-header ${isLoaded ? 'loaded' : ''}`}>
                    <div className='notion-nav' style={{ justifyContent: 'space-between', maxWidth: '1100px' }}>
                        <Link href='/' className='notion-nav-link' style={{ fontWeight: 600 }}>
                            {strings.NAME}
                        </Link>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Link href='/apps' className='notion-nav-link'>
                                <DevicePhoneMobileIcon className='notion-nav-icon' />
                                Apps
                            </Link>
                            <Link href='/blog' className='notion-nav-link'>
                                <PencilSquareIcon className='notion-nav-icon' />
                                Blog
                            </Link>
                            <Link href='/apps/resume' className='notion-nav-link'>
                                <DocumentTextIcon className='notion-nav-icon' />
                                Resume
                            </Link>
                        </div>
                    </div>
                </header>

                <div className={`notion-content ${isLoaded ? 'loaded' : ''}`} style={{ maxWidth: '1200px' }}>
                    <div className='notion-title-block'>
                        <h1 className='notion-title'>Blockchain 101</h1>
                        <div className='notion-subtitle'>Interactive blockchain visualization with proof-of-work mining</div>
                    </div>

                    <div className='notion-divider' />

                    <div className='notion-section'>
                        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '24px' }}>
                            <div className='notion-card' style={{ padding: '16px', flex: '1', minWidth: '200px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Difficulty</span>
                                <div style={{ marginTop: '8px' }}>
                                    <input
                                        type='range'
                                        min='1'
                                        max='5'
                                        value={difficulty}
                                        onChange={e => setDifficulty(Number(e.target.value))}
                                        style={{ width: '100%', accentColor: '#6366f1' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: 'rgba(55, 53, 47, 0.5)' }}>
                                        <span>Fast</span>
                                        <span style={{ color: '#6366f1', fontWeight: 700 }}>{difficulty} Zeros</span>
                                        <span>Secure</span>
                                    </div>
                                </div>
                            </div>
                            <div className='notion-card' style={{ padding: '16px', flex: '1', minWidth: '150px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hashrate</span>
                                <div style={{ fontSize: '20px', fontWeight: 700, color: '#6366f1', marginTop: '4px' }}>
                                    {mining !== null ? `${hashRate.toLocaleString()} H/s` : 'IDLE'}
                                </div>
                            </div>
                            <div className='notion-card' style={{ padding: '16px', flex: '1', minWidth: '150px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Chain Health</span>
                                <div style={{ fontSize: '20px', fontWeight: 700, color: invalidBlocks.size > 0 ? '#dc2626' : '#059669', marginTop: '4px' }}>
                                    {invalidBlocks.size > 0 ? 'Compromised' : 'Healthy'}
                                </div>
                            </div>
                            <div className='notion-card' style={{ padding: '16px', flex: '1', minWidth: '150px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Block Height</span>
                                <div style={{ fontSize: '20px', fontWeight: 700, color: '#37352f', marginTop: '4px' }}>
                                    #{blocks.length}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='notion-divider' />

                    <div className='notion-section'>
                        <div className='notion-section-title'>
                            <CubeTransparentIcon className='notion-section-icon' />
                            Blockchain
                        </div>
                        <div style={{ marginTop: '24px', overflowX: 'auto', paddingBottom: '24px' }}>
                            <ArcherContainer
                                strokeColor={invalidBlocks.size > 0 ? '#ef4444' : '#a78bfa'}
                                strokeWidth={2}
                                strokeDasharray={invalidBlocks.size > 0 ? '5,5' : '0'}
                                endShape={{ arrow: { arrowLength: 4 } }}
                            >
                                <div style={{ display: 'inline-flex', gap: '48px', alignItems: 'flex-start', minWidth: 'max-content' }}>
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
                                                <div className='notion-card' style={{
                                                    width: '320px',
                                                    padding: '20px',
                                                    borderColor: isValid ? 'rgba(55, 53, 47, 0.09)' : '#fecaca'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(55, 53, 47, 0.09)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                borderRadius: '8px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontWeight: 700,
                                                                fontSize: '12px',
                                                                backgroundColor: isValid ? 'rgba(99, 102, 241, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                                color: isValid ? '#6366f1' : '#dc2626'
                                                            }}>
                                                                {index}
                                                            </div>
                                                            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Block</span>
                                                        </div>
                                                        {needsRemining && (
                                                            <span style={{ fontSize: '9px', fontWeight: 700, color: '#ca8a04', backgroundColor: 'rgba(234, 179, 8, 0.1)', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                                                Re-Mine
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div style={{ marginBottom: '12px' }}>
                                                        <label style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Data</label>
                                                        <textarea
                                                            value={block.data}
                                                            onChange={e => handleDataChange(index, e.target.value)}
                                                            placeholder='Enter transaction data...'
                                                            style={{
                                                                width: '100%',
                                                                marginTop: '4px',
                                                                padding: '12px',
                                                                border: '1px solid rgba(55, 53, 47, 0.09)',
                                                                borderRadius: '8px',
                                                                fontSize: '12px',
                                                                resize: 'none',
                                                                height: '80px',
                                                                backgroundColor: 'rgba(55, 53, 47, 0.03)'
                                                            }}
                                                        />
                                                    </div>

                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                                        <div style={{ padding: '8px', backgroundColor: 'rgba(55, 53, 47, 0.03)', borderRadius: '6px' }}>
                                                            <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase' }}>Nonce</span>
                                                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#6366f1', fontFamily: 'monospace' }}>{block.nonce}</div>
                                                        </div>
                                                        <div style={{ padding: '8px', backgroundColor: 'rgba(55, 53, 47, 0.03)', borderRadius: '6px' }}>
                                                            <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase' }}>Timestamp</span>
                                                            <div style={{ fontSize: '10px', fontFamily: 'monospace', color: 'rgba(55, 53, 47, 0.7)' }}>{new Date(block.timestamp).toLocaleTimeString()}</div>
                                                        </div>
                                                    </div>

                                                    <div style={{ marginBottom: '12px' }}>
                                                        <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase' }}>Previous Hash</span>
                                                        <div style={{ fontSize: '9px', fontFamily: 'monospace', backgroundColor: 'rgba(55, 53, 47, 0.03)', padding: '8px', borderRadius: '6px', wordBreak: 'break-all', color: 'rgba(55, 53, 47, 0.6)', marginTop: '4px' }}>
                                                            {block.previousHash.slice(0, 32)}...
                                                        </div>
                                                    </div>

                                                    <div style={{ marginBottom: '16px' }}>
                                                        <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase' }}>Current Hash</span>
                                                        <div style={{
                                                            fontSize: '9px',
                                                            fontFamily: 'monospace',
                                                            padding: '8px',
                                                            borderRadius: '6px',
                                                            wordBreak: 'break-all',
                                                            fontWeight: 600,
                                                            marginTop: '4px',
                                                            backgroundColor: isValid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                            color: isValid ? '#059669' : '#dc2626'
                                                        }}>
                                                            {block.hash === 'N/A' ? 'N/A' : `${block.hash.slice(0, 32)}...`}
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => mineBlock(index)}
                                                        disabled={isMining}
                                                        className={isValid && !needsRemining ? 'notion-action-btn' : 'notion-action-btn notion-action-primary'}
                                                        style={{ width: '100%', justifyContent: 'center' }}
                                                    >
                                                        <CpuChipIcon className='notion-action-icon' />
                                                        {isMining ? 'Mining...' : (isValid && !needsRemining ? 'Re-Mine' : 'Mine Block')}
                                                    </button>
                                                </div>
                                            </ArcherElement>
                                        );
                                    })}
                                </div>
                            </ArcherContainer>
                        </div>
                    </div>

                    <footer className='notion-footer'>
                        © 2026 {strings.NAME}
                    </footer>
                </div>
            </main>
        </>
    );
}
