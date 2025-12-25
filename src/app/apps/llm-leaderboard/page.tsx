'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { WebVitals } from '@/components/SEO/WebVitals';

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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        } catch (e) { setR({ content: 'GENERATION_ERROR', loading: false }); setSM(''); }
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
                        <span>Menu</span>
                        <span className='text-[10px]'>▼</span>
                    </button>
                </header>

                {/* Left Sidebar (Desktop) */}
                <aside className='hidden md:flex flex-col w-72 h-full border-r border-[var(--border-light)] bg-white/50 backdrop-blur-xl z-20'>
                    <div className='p-6 border-b border-[var(--border-light)]'>
                        <div className='flex items-center gap-3 mb-6'>
                            <div className='w-3 h-3 rounded-full bg-[var(--purple-4)]' />
                            <span className='font-bold uppercase tracking-widest text-sm text-[var(--fg-4)]'>LLM Arena</span>
                        </div>
                        <nav className='flex flex-col gap-2'>
                            <Link href='/apps' className='text-xs font-bold uppercase tracking-wider text-muted hover:text-[var(--purple-4)] transition-colors flex items-center gap-2'>
                                <span>←</span> Back to Apps
                            </Link>
                        </nav>
                    </div>

                    <div className='flex-grow p-6 space-y-8'>
                        <div>
                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Mode</h3>
                            <nav className='flex flex-col gap-2'>
                                <button
                                    onClick={() => setActiveTab('vote')}
                                    className={`w-full p-3 text-left rounded-xl transition-all flex items-center gap-3 ${activeTab === 'vote'
                                            ? 'bg-white shadow-md border border-[var(--purple-2)] text-[var(--purple-4)]'
                                            : 'hover:bg-white/60 text-[var(--fg-4)]'
                                        }`}
                                >
                                    <span className='text-lg'>⚔️</span>
                                    <span className='text-xs font-bold uppercase tracking-wider'>Battle Arena</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('leaderboard')}
                                    className={`w-full p-3 text-left rounded-xl transition-all flex items-center gap-3 ${activeTab === 'leaderboard'
                                            ? 'bg-white shadow-md border border-[var(--purple-2)] text-[var(--purple-4)]'
                                            : 'hover:bg-white/60 text-[var(--fg-4)]'
                                        }`}
                                >
                                    <span className='text-lg'>🏆</span>
                                    <span className='text-xs font-bold uppercase tracking-wider'>Rankings</span>
                                </button>
                            </nav>
                        </div>

                        <div>
                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>System Status</h3>
                            <div className='p-4 bg-white border border-[var(--border-light)] rounded-xl shadow-sm'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <div className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
                                    <span className='text-[10px] font-bold uppercase tracking-wider text-[var(--fg-4)]'>Online</span>
                                </div>
                                <p className='text-[10px] text-muted leading-relaxed'>
                                    Benchmarking via decentralized consensus and ELO evaluation.
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className='flex-grow flex flex-col h-full relative bg-[#fafbff] overflow-hidden'>
                    {/* Floating decorations */}
                    <div className='absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--purple-1)] opacity-30 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2' />

                    <div className='flex-grow overflow-y-auto p-4 md:p-8 scrollbar-hide z-10'>
                        {activeTab === 'vote' ? (
                            <div className='max-w-5xl mx-auto w-full space-y-8 pb-32'>
                                <div className='text-center space-y-2 mb-8'>
                                    <h1 className='text-2xl font-bold text-[var(--fg-4)]'>Battle Arena</h1>
                                    <p className='text-muted text-sm'>Enter a prompt to compare two anonymous models.</p>
                                </div>

                                {!showVoting && !responseA.loading ? (
                                    <div className='bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[var(--border-light)] max-w-3xl mx-auto'>
                                        <textarea
                                            value={prompt}
                                            onChange={e => setPrompt(e.target.value)}
                                            placeholder='Enter a challenging prompt...'
                                            className='w-full bg-[var(--bg-2)] border border-[var(--border-light)] rounded-xl p-4 text-sm text-[var(--fg-4)] focus:border-[var(--purple-4)] focus:ring-2 focus:ring-[var(--purple-1)] outline-none resize-none h-40 transition-all placeholder:text-muted/50 mb-6'
                                        />
                                        <button
                                            onClick={handleGenerate}
                                            disabled={!prompt.trim()}
                                            className='w-full py-4 bg-[var(--fg-4)] hover:bg-[var(--purple-4)] text-white font-bold text-xs uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:bg-[var(--fg-4)] disabled:hover:scale-100 disabled:cursor-not-allowed'
                                        >
                                            Initiate Battle
                                        </button>
                                    </div>
                                ) : (
                                    <div className='space-y-8 animate-fade-in-up'>
                                        <div className='grid md:grid-cols-2 gap-6'>
                                            {[
                                                { label: 'Model A', content: responseA.content, stream: streamingMessageA, loading: responseA.loading, model: battleModels?.modelA },
                                                { label: 'Model B', content: responseB.content, stream: streamingMessageB, loading: responseB.loading, model: battleModels?.modelB }
                                            ].map((node, i) => (
                                                <div key={i} className='bg-white border border-[var(--border-light)] rounded-2xl p-6 shadow-sm flex flex-col h-[500px] overflow-hidden relative'>
                                                    <div className='flex justify-between items-center mb-4 pb-4 border-b border-[var(--border-light)]'>
                                                        <span className='text-xs font-bold uppercase tracking-widest text-[var(--purple-4)]'>{node.label}</span>
                                                        {revealedModels && <span className='text-[10px] font-medium text-[var(--fg-4)] bg-[var(--purple-1)] px-2 py-1 rounded'>{node.model}</span>}
                                                    </div>
                                                    <div className='flex-grow overflow-y-auto pr-2 custom-scrollbar markdown-body text-sm text-[var(--fg-4)] leading-relaxed'>
                                                        <div className='prose prose-sm max-w-none'>
                                                            <ReactMarkdown>{node.loading ? node.stream : node.content}</ReactMarkdown>
                                                            {node.loading && <span className='inline-block w-1.5 h-4 bg-[var(--purple-4)] ml-1 animate-pulse align-middle rounded-full' />}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {showVoting && !votingComplete && (
                                            <div className='flex flex-col items-center gap-6 p-6 bg-white/80 backdrop-blur-xl border border-[var(--border-light)] rounded-2xl shadow-lg sticky bottom-6 max-w-2xl mx-auto'>
                                                <span className='text-xs font-bold uppercase tracking-[0.2em] text-muted'>Select Winner</span>
                                                <div className='flex gap-4 w-full'>
                                                    <button onClick={() => handleVote('A')} className='flex-1 py-3 bg-white border border-[var(--border-light)] hover:border-[var(--purple-4)] hover:bg-[var(--purple-1)] text-[var(--fg-4)] hover:text-[var(--purple-4)] font-bold text-xs uppercase rounded-xl tracking-widest transition-all shadow-sm'>Model A</button>
                                                    <button onClick={() => handleVote('tie')} className='flex-1 py-3 bg-[var(--bg-2)] border border-[var(--border-light)] hover:bg-[var(--border-light)] text-muted font-bold text-xs uppercase rounded-xl tracking-widest transition-all'>Tie</button>
                                                    <button onClick={() => handleVote('B')} className='flex-1 py-3 bg-white border border-[var(--border-light)] hover:border-[var(--purple-4)] hover:bg-[var(--purple-1)] text-[var(--fg-4)] hover:text-[var(--purple-4)] font-bold text-xs uppercase rounded-xl tracking-widest transition-all shadow-sm'>Model B</button>
                                                </div>
                                            </div>
                                        )}

                                        {votingComplete && (
                                            <div className='flex flex-col items-center gap-6 animate-fade-in-up'>
                                                <div className='p-8 bg-white border border-[var(--purple-2)] rounded-2xl shadow-lg text-center max-w-md mx-auto'>
                                                    <div className='w-12 h-12 bg-[var(--green-1)] text-[var(--green-4)] rounded-full flex items-center justify-center mx-auto mb-4 text-xl'>✓</div>
                                                    <div className='text-xs font-bold text-[var(--purple-4)] uppercase tracking-widest mb-4'>Vote Committed</div>
                                                    <button
                                                        onClick={setupBattle}
                                                        className='text-sm font-medium text-[var(--fg-4)] hover:text-[var(--purple-4)] underline underline-offset-4 transition-colors'
                                                    >
                                                        Start Next Battle
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className='max-w-5xl mx-auto w-full pb-32'>
                                <div className='text-center space-y-2 mb-8'>
                                    <h1 className='text-2xl font-bold text-[var(--fg-4)]'>Leaderboard</h1>
                                    <p className='text-muted text-sm'>Top performing models based on community ELO ratings.</p>
                                </div>

                                <div className='bg-white border border-[var(--border-light)] rounded-2xl overflow-hidden shadow-sm'>
                                    <div className='overflow-x-auto'>
                                        <table className='w-full text-left'>
                                            <thead>
                                                <tr className='bg-[var(--gray-1)] border-b border-[var(--border-light)]'>
                                                    <th className='p-4 text-[10px] font-bold uppercase tracking-widest text-muted'>Rank</th>
                                                    <th className='p-4 text-[10px] font-bold uppercase tracking-widest text-muted'>Model</th>
                                                    <th className='p-4 text-[10px] font-bold uppercase tracking-widest text-muted'>ELO</th>
                                                    <th className='p-4 text-[10px] font-bold uppercase tracking-widest text-muted'>Votes</th>
                                                    <th className='p-4 text-[10px] font-bold uppercase tracking-widest text-muted text-right'>W / L / T</th>
                                                </tr>
                                            </thead>
                                            <tbody className='text-sm'>
                                                {leaderboard.map((e, i) => (
                                                    <tr key={e.model_id} className='border-b border-[var(--border-light)] hover:bg-[var(--bg-2)] transition-colors'>
                                                        <td className='p-4 font-mono text-muted text-xs'>#{String(i + 1).padStart(2, '0')}</td>
                                                        <td className='p-4 font-medium text-[var(--fg-4)]'>{e.model_id}</td>
                                                        <td className='p-4 font-bold text-[var(--purple-4)]'>{e.elo_rating}</td>
                                                        <td className='p-4 text-muted'>{e.total_votes}</td>
                                                        <td className='p-4 text-right font-mono text-xs text-muted'>{e.wins} / {e.losses} / {e.ties}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {leaderboardLoading && (
                                        <div className='p-12 text-center'>
                                            <div className='w-6 h-6 border-2 border-[var(--border-light)] border-t-[var(--purple-4)] rounded-full animate-spin mx-auto mb-2'></div>
                                            <span className='text-[10px] font-bold uppercase tracking-widest text-muted'>Loading Stats...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className='fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 md:hidden' onClick={() => setIsMobileMenuOpen(false)}>
                        <div className='w-full max-w-sm bg-white rounded-2xl shadow-2xl animate-slide-up overflow-hidden border border-[var(--border-light)]' onClick={e => e.stopPropagation()}>
                            <div className='p-4 border-b border-[var(--border-light)] flex justify-between items-center bg-[var(--bg-2)]'>
                                <span className='text-xs font-bold uppercase tracking-widest text-[var(--fg-4)]'>Menu</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className='w-6 h-6 rounded-full bg-white border border-[var(--border-light)] flex items-center justify-center text-muted'>✕</button>
                            </div>
                            <div className='p-2'>
                                <button
                                    onClick={() => { setActiveTab('vote'); setIsMobileMenuOpen(false); }}
                                    className={`w-full p-3 text-left rounded-xl transition-all flex items-center gap-3 ${activeTab === 'vote' ? 'bg-[var(--purple-1)] text-[var(--purple-4)]' : 'hover:bg-[var(--bg-2)]'}`}
                                >
                                    <span className='text-lg'>⚔️</span>
                                    <span className='text-xs font-bold uppercase tracking-wider'>Battle Arena</span>
                                </button>
                                <button
                                    onClick={() => { setActiveTab('leaderboard'); setIsMobileMenuOpen(false); }}
                                    className={`w-full p-3 text-left rounded-xl transition-all flex items-center gap-3 ${activeTab === 'leaderboard' ? 'bg-[var(--purple-1)] text-[var(--purple-4)]' : 'hover:bg-[var(--bg-2)]'}`}
                                >
                                    <span className='text-lg'>🏆</span>
                                    <span className='text-xs font-bold uppercase tracking-wider'>Rankings</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
