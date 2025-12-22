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
            <main className='min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4 md:p-8 selection:bg-[var(--color-accent)] selection:text-[var(--color-bg)]'>
                <div className='fixed inset-0 overflow-hidden pointer-events-none'>
                    <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(62,175,124,0.03),transparent_60%)]' />
                </div>

                <div className={`w-full max-w-6xl h-[85vh] transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className='terminal-window flex flex-col h-full'>
                        <div className='terminal-header'>
                            <div className='terminal-controls'>
                                <div className='terminal-control red' />
                                <div className='terminal-control yellow' />
                                <div className='terminal-control green' />
                            </div>
                            <div className='terminal-title'>johnleonardo — ~/neural-leaderboard</div>
                        </div>

                        <div className='terminal-split flex-grow overflow-hidden'>
                            {/* Left Sidebar: Modes & Stats */}
                            <div className='terminal-pane border-r border-[var(--color-border)] hidden md:flex flex-col gap-8'>
                                <div>
                                    <div className='flex items-center gap-2 mb-6 text-[var(--color-accent)]'>
                                        <span className='terminal-prompt'>➜</span>
                                        <span className='text-sm uppercase tracking-widest font-bold'>Navigator</span>
                                    </div>
                                    <nav className='flex flex-col gap-4 mb-10'>
                                        <button onClick={() => setActiveTab('vote')} className={`text-left text-lg transition-colors ${activeTab === 'vote' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)] hover:text-white'}`}>~/arena</button>
                                        <button onClick={() => setActiveTab('leaderboard')} className={`text-left text-lg transition-colors ${activeTab === 'leaderboard' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)] hover:text-white'}`}>~/rankings</button>
                                        <div className='h-[1px] bg-[var(--color-border)] my-2' />
                                        <Link href='/' className='text-sm opacity-60 hover:text-[var(--color-accent)]'>~/home</Link>
                                        <Link href='/apps' className='text-sm opacity-60 hover:text-[var(--color-accent)]'>~/apps</Link>
                                    </nav>

                                    <div className='space-y-6 font-mono'>
                                        <div className='p-4 border border-[var(--color-border)] rounded bg-white/5'>
                                            <span className='text-[10px] opacity-40 uppercase tracking-widest block mb-2'>System_Status</span>
                                            <div className='flex items-center gap-2'>
                                                <div className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
                                                <span className='text-[11px] text-green-400'>NODES_ONLINE</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='mt-auto pt-8 border-t border-[var(--color-border)] opacity-30 font-mono text-[9px] uppercase tracking-tighter leading-relaxed'>
                                    "Benchmarking large language models via decentralized community consensus and ELO-based evaluation cycles."
                                </div>
                            </div>

                            {/* Main Display: Arena or Rankings */}
                            <div className='terminal-pane bg-black/20 flex flex-col p-0 overflow-y-auto w-full'>
                                {activeTab === 'vote' ? (
                                    <div className='p-8 md:p-12 max-w-5xl mx-auto w-full space-y-12'>
                                        {!showVoting && !responseA.loading ? (
                                            <div className='space-y-6'>
                                                <div className='flex items-center gap-2 text-[var(--color-accent)]'>
                                                    <span className='terminal-prompt'>$</span>
                                                    <span className='text-[10px] uppercase tracking-widest opacity-60'>Launch_Query</span>
                                                </div>
                                                <textarea
                                                    value={prompt}
                                                    onChange={e => setPrompt(e.target.value)}
                                                    placeholder='ENTER_CHALLENGE_PROMPT...'
                                                    className='w-full bg-black/40 border border-[var(--color-border)] rounded-lg p-6 font-mono text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none resize-none h-48'
                                                />
                                                <button
                                                    onClick={handleGenerate}
                                                    disabled={!prompt.trim()}
                                                    className='w-full py-4 border border-[var(--color-accent)]/50 hover:bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-mono text-xs uppercase tracking-[0.3em] rounded transition-all'
                                                >
                                                    [INITIATE_BATTLE]
                                                </button>
                                            </div>
                                        ) : (
                                            <div className='space-y-8 pb-12'>
                                                <div className='grid md:grid-cols-2 gap-8'>
                                                    {[
                                                        { label: 'NODE_ALPHA', content: responseA.content, stream: streamingMessageA, loading: responseA.loading, model: battleModels?.modelA },
                                                        { label: 'NODE_BETA', content: responseB.content, stream: streamingMessageB, loading: responseB.loading, model: battleModels?.modelB }
                                                    ].map((node, i) => (
                                                        <div key={i} className='border border-[var(--color-border)] rounded-lg bg-black/40 p-6 flex flex-col h-[500px]'>
                                                            <div className='flex justify-between items-center mb-6 border-b border-[var(--color-border)] pb-4'>
                                                                <span className='text-[10px] font-mono text-[var(--color-accent)] uppercase tracking-widest'>{node.label}</span>
                                                                {revealedModels && <span className='text-[10px] font-mono opacity-40 truncate max-w-[150px]'>{node.model}</span>}
                                                            </div>
                                                            <div className='flex-grow overflow-y-auto pr-2 custom-scrollbar text-sm font-mono leading-relaxed prose prose-invert prose-sm'>
                                                                <ReactMarkdown>{node.loading ? node.stream : node.content}</ReactMarkdown>
                                                                {node.loading && <span className='inline-block w-2 h-4 bg-[var(--color-accent)] ml-1 animate-pulse' />}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {showVoting && !votingComplete && (
                                                    <div className='flex flex-col items-center gap-6 animate-reveal'>
                                                        <span className='text-xs font-mono uppercase tracking-[0.3em] opacity-60'>Evaluator_Input_Required</span>
                                                        <div className='flex gap-4'>
                                                            <button onClick={() => handleVote('A')} className='px-8 py-3 border border-blue-500/50 hover:bg-blue-500/10 text-blue-400 font-mono text-[10px] uppercase rounded tracking-widest'>Select_Alpha</button>
                                                            <button onClick={() => handleVote('tie')} className='px-8 py-3 border border-white/20 hover:bg-white/5 text-white/40 font-mono text-[10px] uppercase rounded tracking-widest'>Equal_Utility</button>
                                                            <button onClick={() => handleVote('B')} className='px-8 py-3 border border-green-500/50 hover:bg-green-500/10 text-green-400 font-mono text-[10px] uppercase rounded tracking-widest'>Select_Beta</button>
                                                        </div>
                                                    </div>
                                                )}

                                                {votingComplete && (
                                                    <div className='flex flex-col items-center gap-6 animate-reveal'>
                                                        <div className='p-6 border border-[var(--color-accent)]/30 rounded bg-[var(--color-accent)]/5 text-center'>
                                                            <div className='text-[11px] font-mono text-[var(--color-accent)] uppercase tracking-widest mb-2'>VOTE_COMMITTED_TO_ELASTICSEARCH</div>
                                                            <button onClick={setupBattle} className='text-[10px] font-mono text-[var(--color-text-dim)] hover:text-white underline underline-offset-4'>[SPAWN_NEW_CYCLE]</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className='p-8 md:p-12 w-full max-w-5xl mx-auto'>
                                        <div className='flex items-center gap-4 mb-8 opacity-60'>
                                            <span className='text-[10px] font-mono uppercase tracking-widest'>Node_ELO_Performance_Leaderboard</span>
                                            <div className='h-[1px] flex-grow bg-[var(--color-border)]' />
                                        </div>

                                        <div className='border border-[var(--color-border)] rounded-lg overflow-hidden bg-black/40'>
                                            <table className='w-full font-mono text-left'>
                                                <thead>
                                                    <tr className='bg-white/5 text-[10px] uppercase tracking-widest opacity-40 border-b border-[var(--color-border)]'>
                                                        <th className='p-4'>Rank</th>
                                                        <th className='p-4'>Model_ID</th>
                                                        <th className='p-4'>ELO_Rating</th>
                                                        <th className='p-4'>Agg_Votes</th>
                                                        <th className='p-4 text-right'>W/L/T_Ratio</th>
                                                    </tr>
                                                </thead>
                                                <tbody className='text-xs'>
                                                    {leaderboard.map((e, i) => (
                                                        <tr key={e.model_id} className='border-b border-[var(--color-border)] hover:bg-white/5 transition-colors'>
                                                            <td className='p-4 opacity-40'>#{String(i + 1).padStart(2, '0')}</td>
                                                            <td className='p-4 text-[var(--color-text)]'>{e.model_id}</td>
                                                            <td className='p-4 text-[var(--color-accent)] font-bold'>{e.elo_rating}</td>
                                                            <td className='p-4 opacity-60'>{e.total_votes}</td>
                                                            <td className='p-4 text-right opacity-60'>{e.wins}/{e.losses}/{e.ties}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {leaderboardLoading && <div className='p-20 text-center text-[10px] opacity-20 uppercase tracking-[0.5em]'>Scanning_Block_Metas...</div>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
