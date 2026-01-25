'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { strings } from '../../constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import {
    DevicePhoneMobileIcon,
    PencilSquareIcon,
    DocumentTextIcon,
    TrophyIcon,
    BoltIcon,
} from '@heroicons/react/24/outline';

type LeaderboardEntry = {
    model_id: string;
    elo_rating: number;
    total_votes: number;
    wins: number;
    losses: number;
    ties: number;
};

type BattleModels = {
    modelA: string;
    modelB: string;
};

type Response = {
    content: string;
    loading: boolean;
};

export default function LLMLeaderboard() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState<'vote' | 'leaderboard'>('vote');
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [leaderboardLoading, setLeaderboardLoading] = useState(false);
    const [battleModels, setBattleModels] = useState<BattleModels | null>(null);
    const [prompt, setPrompt] = useState('');
    const [responseA, setResponseA] = useState<Response>({ content: '', loading: false });
    const [responseB, setResponseB] = useState<Response>({ content: '', loading: false });
    const [streamingMessageA, setStreamingMessageA] = useState('');
    const [streamingMessageB, setStreamingMessageB] = useState('');
    const [showVoting, setShowVoting] = useState(false);
    const [isVoting, setIsVoting] = useState(false);
    const [votingComplete, setVotingComplete] = useState(false);
    const [revealedModels, setRevealedModels] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (activeTab === 'leaderboard') fetchLeaderboard();
        else if (activeTab === 'vote' && !battleModels) setupBattle();
    }, [activeTab]);

    const fetchLeaderboard = async () => {
        setLeaderboardLoading(true);
        try {
            const res = await fetch('/api/llm-leaderboard');
            const data = await res.json();
            setLeaderboard(data);
        } catch (e) { console.error(e); }
        finally { setLeaderboardLoading(false); }
    };

    const setupBattle = async () => {
        try {
            const res = await fetch('/api/llm-battle');
            const data = await res.json();
            setBattleModels(data);
            setResponseA({ content: '', loading: false });
            setResponseB({ content: '', loading: false });
            setStreamingMessageA('');
            setStreamingMessageB('');
            setShowVoting(false);
            setVotingComplete(false);
            setRevealedModels(false);
        } catch (e) { console.error(e); }
    };

    const streamResponse = async (model: string, setSM: (m: string) => void, setR: (r: Response) => void) => {
        try {
            const res = await fetch('/api/llm-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model, prompt }),
            });
            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let accumulated = '';
            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                if (data.type === 'content') { accumulated += data.content; setSM(accumulated); }
                                else if (data.type === 'done') { setR({ content: accumulated, loading: false }); setSM(''); return; }
                            } catch (e) { }
                        }
                    }
                }
            }
        } catch (e) { setR({ content: 'Error generating response', loading: false }); setSM(''); }
    };

    const handleGenerate = async () => {
        if (!prompt.trim() || !battleModels) return;
        setResponseA({ content: '', loading: true });
        setResponseB({ content: '', loading: true });
        const sA = streamResponse(battleModels.modelA, setStreamingMessageA, setResponseA);
        const sB = streamResponse(battleModels.modelB, setStreamingMessageB, setResponseB);
        await Promise.all([sA, sB]);
        setShowVoting(true);
    };

    const handleVote = async (winner: 'A' | 'B' | 'tie') => {
        if (!battleModels || isVoting) return;
        setRevealedModels(true);
        setIsVoting(true);
        try {
            const res = await fetch('/api/llm-vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ modelA: battleModels.modelA, modelB: battleModels.modelB, winner }),
            });
            if (res.ok) setVotingComplete(true);
        } finally { setIsVoting(false); }
    };

    return (
        <>
            <WebVitals />
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

                <div className={`notion-content ${isLoaded ? 'loaded' : ''}`} style={{ maxWidth: '1100px' }}>
                    <div className='notion-title-block'>
                        <h1 className='notion-title'>LLM Arena</h1>
                        <div className='notion-subtitle'>Compare language models head-to-head and contribute to community rankings</div>
                    </div>

                    <div className='notion-divider' />

                    <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                        <button
                            onClick={() => setActiveTab('vote')}
                            className={activeTab === 'vote' ? 'notion-action-btn notion-action-primary' : 'notion-action-btn'}
                        >
                            <BoltIcon className='notion-action-icon' />
                            Battle Arena
                        </button>
                        <button
                            onClick={() => setActiveTab('leaderboard')}
                            className={activeTab === 'leaderboard' ? 'notion-action-btn notion-action-primary' : 'notion-action-btn'}
                        >
                            <TrophyIcon className='notion-action-icon' />
                            Rankings
                        </button>
                    </div>

                    {activeTab === 'vote' ? (
                        <div className='notion-section'>
                            {!showVoting && !responseA.loading ? (
                                <div className='notion-card' style={{ padding: '24px', maxWidth: '700px', margin: '0 auto' }}>
                                    <textarea
                                        value={prompt}
                                        onChange={e => setPrompt(e.target.value)}
                                        placeholder='Enter a challenging prompt...'
                                        className='notion-textarea'
                                        style={{ height: '140px', marginBottom: '16px' }}
                                    />
                                    <button
                                        onClick={handleGenerate}
                                        disabled={!prompt.trim()}
                                        className='notion-action-btn notion-action-primary'
                                        style={{ width: '100%', justifyContent: 'center', padding: '16px' }}
                                    >
                                        <BoltIcon className='notion-action-icon' />
                                        Initiate Battle
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                                        {[
                                            { label: 'Model A', content: responseA.content, stream: streamingMessageA, loading: responseA.loading, model: battleModels?.modelA },
                                            { label: 'Model B', content: responseB.content, stream: streamingMessageB, loading: responseB.loading, model: battleModels?.modelB }
                                        ].map((node, i) => (
                                            <div key={i} className='notion-card' style={{ padding: '20px', height: '450px', display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(55, 53, 47, 0.09)' }}>
                                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{node.label}</span>
                                                    {revealedModels && <span style={{ fontSize: '10px', fontWeight: 500, color: '#37352f', backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>{node.model}</span>}
                                                </div>
                                                <div style={{ flex: 1, overflow: 'auto', fontSize: '14px', lineHeight: 1.7, color: '#37352f' }} className='prose prose-sm'>
                                                    <ReactMarkdown>{node.loading ? node.stream : node.content}</ReactMarkdown>
                                                    {node.loading && <span style={{ display: 'inline-block', width: '6px', height: '16px', backgroundColor: '#6366f1', marginLeft: '4px', borderRadius: '2px', animation: 'pulse 1s infinite' }} />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {showVoting && !votingComplete && (
                                        <div className='notion-card' style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '16px' }}>Select Winner</span>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <button onClick={() => handleVote('A')} className='notion-action-btn' style={{ flex: 1, justifyContent: 'center', padding: '14px' }}>Model A</button>
                                                <button onClick={() => handleVote('tie')} className='notion-action-btn' style={{ flex: 1, justifyContent: 'center', padding: '14px', backgroundColor: 'rgba(55, 53, 47, 0.04)' }}>Tie</button>
                                                <button onClick={() => handleVote('B')} className='notion-action-btn' style={{ flex: 1, justifyContent: 'center', padding: '14px' }}>Model B</button>
                                            </div>
                                        </div>
                                    )}

                                    {votingComplete && (
                                        <div className='notion-card' style={{ padding: '32px', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#059669', fontSize: '24px' }}>✓</div>
                                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Vote Recorded</div>
                                            <button onClick={setupBattle} className='notion-action-btn notion-action-primary'>
                                                Start Next Battle
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <div className='notion-section'>
                            {leaderboardLoading ? (
                                <div style={{ textAlign: 'center', padding: '48px' }}>
                                    <div style={{ width: '24px', height: '24px', border: '2px solid rgba(55, 53, 47, 0.09)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Loading Rankings...</span>
                                </div>
                            ) : (
                                <div className='notion-table-container'>
                                    <table className='notion-table'>
                                        <thead>
                                            <tr>
                                                <th>Rank</th>
                                                <th>Model</th>
                                                <th style={{ textAlign: 'right' }}>ELO</th>
                                                <th style={{ textAlign: 'right' }}>Votes</th>
                                                <th style={{ textAlign: 'right' }}>W / L / T</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leaderboard.map((e, i) => (
                                                <tr key={e.model_id}>
                                                    <td style={{ fontFamily: 'monospace', color: 'rgba(55, 53, 47, 0.5)' }}>#{String(i + 1).padStart(2, '0')}</td>
                                                    <td style={{ fontWeight: 500 }}>{e.model_id}</td>
                                                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#6366f1' }}>{e.elo_rating}</td>
                                                    <td style={{ textAlign: 'right', color: 'rgba(55, 53, 47, 0.5)' }}>{e.total_votes}</td>
                                                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '12px', color: 'rgba(55, 53, 47, 0.5)' }}>{e.wins} / {e.losses} / {e.ties}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    <footer className='notion-footer'>
                        © 2026 {strings.NAME}
                    </footer>
                </div>
            </main>
        </>
    );
}
