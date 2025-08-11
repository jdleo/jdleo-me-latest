'use client';

import { strings } from '../../constants/strings';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Breadcrumbs } from '@/components/SEO/Breadcrumbs';

type LeaderboardEntry = {
    model_id: string;
    elo_rating: number;
    total_votes: number;
    wins: number;
    losses: number;
    ties: number;
    created_at: string;
    updated_at: string;
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

    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'Apps', href: '/apps' },
        { label: 'LLM Leaderboard', href: '/apps/llm-leaderboard' },
    ];
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [leaderboardLoading, setLeaderboardLoading] = useState(false);
    const [battleModels, setBattleModels] = useState<BattleModels | null>(null);
    const [prompt, setPrompt] = useState('');
    const [responseA, setResponseA] = useState<Response>({ content: '', loading: false });
    const [responseB, setResponseB] = useState<Response>({ content: '', loading: false });
    const [showVoting, setShowVoting] = useState(false);
    const [isVoting, setIsVoting] = useState(false);
    const [votingComplete, setVotingComplete] = useState(false);
    const [revealedModels, setRevealedModels] = useState(false);
    const [inputError, setInputError] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (activeTab === 'leaderboard') {
            fetchLeaderboard();
        } else if (activeTab === 'vote' && !battleModels) {
            setupBattle();
        }
    }, [activeTab]);

    const fetchLeaderboard = async () => {
        setLeaderboardLoading(true);
        try {
            const response = await fetch('/api/llm-leaderboard');
            const data = await response.json();
            setLeaderboard(data);
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        } finally {
            setLeaderboardLoading(false);
        }
    };

    const setupBattle = async () => {
        try {
            const response = await fetch('/api/llm-battle');
            const data = await response.json();
            setBattleModels(data);
            setResponseA({ content: '', loading: false });
            setResponseB({ content: '', loading: false });
            setShowVoting(false);
            setVotingComplete(false);
            setRevealedModels(false);
        } catch (error) {
            console.error('Failed to setup battle:', error);
        }
    };

    const generateResponse = async (model: string): Promise<string> => {
        const response = await fetch('/api/llm-generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model, prompt }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate response');
        }

        const data = await response.json();
        return data.content;
    };

    const handleGenerate = async () => {
        if (!prompt.trim() || !battleModels) return;

        // Validate input length
        if (prompt.length > 2000) {
            setInputError('Prompt must be 2000 characters or less');
            return;
        }

        setInputError('');
        setResponseA({ content: '', loading: true });
        setResponseB({ content: '', loading: true });
        setShowVoting(false);
        setRevealedModels(false);

        // Generate both responses independently
        Promise.allSettled([generateResponse(battleModels.modelA), generateResponse(battleModels.modelB)]).then(
            results => {
                const [resultA, resultB] = results;

                setResponseA({
                    content: resultA.status === 'fulfilled' ? resultA.value : 'Error generating response',
                    loading: false,
                });

                setResponseB({
                    content: resultB.status === 'fulfilled' ? resultB.value : 'Error generating response',
                    loading: false,
                });

                setShowVoting(true);
            }
        );
    };

    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setPrompt(value);

        if (value.length > 2000) {
            setInputError('Prompt must be 2000 characters or less');
        } else {
            setInputError('');
        }
    };

    const handleVote = async (winner: 'A' | 'B' | 'tie') => {
        if (!battleModels || isVoting) return;

        // Reveal model names immediately when user votes
        setRevealedModels(true);
        setIsVoting(true);

        try {
            const response = await fetch('/api/llm-vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    modelA: battleModels.modelA,
                    modelB: battleModels.modelB,
                    winner,
                }),
            });

            if (response.ok) {
                setVotingComplete(true);
                setIsVoting(false);
            }
        } catch (error) {
            console.error('Failed to submit vote:', error);
            setIsVoting(false);
        }
    };

    const startNewBattle = () => {
        setupBattle();
        setPrompt('');
    };

    // Generate structured data for the leaderboard
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'LLM Leaderboard - AI Model Battle Arena',
        description:
            'Vote on head-to-head LLM battles and see which AI models reign supreme. Compare responses side-by-side and help determine the ultimate AI leaderboard.',
        url: 'https://jdleo.me/apps/llm-leaderboard',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web',
        author: {
            '@type': 'Person',
            name: 'John Leonardo',
            url: 'https://jdleo.me',
        },
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        featureList: [
            'Head-to-head AI model battles',
            'Real-time ELO rating system',
            'Side-by-side response comparison',
            'Community-driven rankings',
            'Multiple AI model support',
        ],
    };

    return (
        <div className='min-h-screen bg-[var(--color-bg-light)] relative'>
            {/* Structured Data */}
            <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

            {/* Subtle background gradients */}
            <div
                className='fixed inset-0 opacity-40 pointer-events-none'
                style={{
                    background:
                        'radial-gradient(ellipse at 30% 20%, rgba(94, 106, 210, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 60%)',
                }}
            />

            {/* Navigation */}
            <nav className='nav-container'>
                <div className='nav-content'>
                    <Link href='/' className='nav-logo'>
                        JL
                    </Link>
                    <div className='nav-links'>
                        <Link href='/apps' className='nav-link'>
                            Apps
                        </Link>
                        <Link href='/' className='nav-link'>
                            Home
                        </Link>
                        <a href={strings.LINKEDIN_URL} target='_blank' rel='noopener noreferrer' className='nav-link'>
                            LinkedIn
                        </a>
                        <a href={strings.GITHUB_URL} target='_blank' rel='noopener noreferrer' className='nav-link'>
                            GitHub
                        </a>
                    </div>
                </div>
            </nav>

            <main className='main-content'>
                <div className='container-responsive max-w-6xl'>
                    {/* Breadcrumbs */}
                    <div className={`mb-6 animate-reveal ${isLoaded ? '' : 'opacity-0'}`}>
                        <Breadcrumbs items={breadcrumbItems} />
                    </div>

                    {/* Hero Section */}
                    <section
                        className={`text-center mb-8 animate-reveal ${isLoaded ? '' : 'opacity-0'}`}
                        itemScope
                        itemType='https://schema.org/WebApplication'
                    >
                        <h1 className='text-h1 gradient-text mb-4'>🏆 LLM Leaderboard</h1>
                        <p className='text-body opacity-80'>
                            Vote on head-to-head LLM battles and see which models reign supreme
                        </p>
                    </section>

                    {/* Tab Navigation */}
                    <div
                        className={`flex justify-center gap-4 mb-8 animate-reveal animate-reveal-delay-1 ${
                            isLoaded ? '' : 'opacity-0'
                        }`}
                    >
                        <button
                            onClick={() => setActiveTab('vote')}
                            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                                activeTab === 'vote'
                                    ? 'button-primary'
                                    : 'glass-card-subtle border border-gray-300 text-body hover:glass-card'
                            }`}
                        >
                            🗳️ Vote
                        </button>
                        <button
                            onClick={() => setActiveTab('leaderboard')}
                            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                                activeTab === 'leaderboard'
                                    ? 'button-primary'
                                    : 'glass-card-subtle border border-gray-300 text-body hover:glass-card'
                            }`}
                        >
                            🏆 Leaderboard
                        </button>
                    </div>

                    {/* Content */}
                    <div className={`animate-reveal animate-reveal-delay-2 ${isLoaded ? '' : 'opacity-0'}`}>
                        {activeTab === 'vote' ? (
                            <div className='space-y-8'>
                                {/* Prompt Input */}
                                {!showVoting && (
                                    <div className='glass-card p-6 rounded-2xl'>
                                        <h2 className='text-h3 mb-4'>Enter your prompt</h2>
                                        <div className='space-y-4'>
                                            <div>
                                                <textarea
                                                    value={prompt}
                                                    onChange={handlePromptChange}
                                                    placeholder='Ask something interesting...'
                                                    className='w-full p-4 rounded-xl border border-gray-200 resize-none h-32 text-body focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                                    maxLength={2000}
                                                />
                                                <div className='flex justify-between items-center mt-2'>
                                                    <span
                                                        className={`text-small ${
                                                            prompt.length > 2000 ? 'text-red-500' : 'text-gray-500'
                                                        }`}
                                                    >
                                                        {prompt.length}/2000 characters
                                                    </span>
                                                    {inputError && (
                                                        <span className='text-small text-red-500'>{inputError}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleGenerate}
                                                disabled={!prompt.trim() || responseA.loading || responseB.loading}
                                                className='button-primary disabled:opacity-50 disabled:cursor-not-allowed'
                                            >
                                                {responseA.loading || responseB.loading
                                                    ? 'Generating...'
                                                    : 'Generate Battle'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Battle Results */}
                                {(responseA.loading || responseB.loading || showVoting) && (
                                    <div>
                                        <div className='text-center mb-6'>
                                            <h3 className='text-h3 gradient-text mb-2'>Battle Results</h3>
                                            <p className='text-body opacity-70'>Prompt: "{prompt}"</p>
                                        </div>

                                        <div className='grid md:grid-cols-2 gap-6 mb-8'>
                                            {/* Model A Response */}
                                            <div className='glass-card-subtle border border-gray-200 p-6 rounded-xl'>
                                                <div className='flex items-center justify-between mb-4'>
                                                    <h4 className='text-body font-semibold'>Model A</h4>
                                                    {responseA.loading && (
                                                        <div className='text-blue-500'>
                                                            <div className='animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full'></div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className='text-small leading-relaxed'>
                                                    {responseA.loading ? (
                                                        <div className='flex items-center justify-center h-32 text-gray-500'>
                                                            <div className='text-center space-y-2'>
                                                                <div className='animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto'></div>
                                                                <p>Generating response...</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className='prose prose-sm max-w-none'>
                                                            <ReactMarkdown>{responseA.content}</ReactMarkdown>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Model B Response */}
                                            <div className='glass-card-subtle border border-gray-200 p-6 rounded-xl'>
                                                <div className='flex items-center justify-between mb-4'>
                                                    <h4 className='text-body font-semibold'>Model B</h4>
                                                    {responseB.loading && (
                                                        <div className='text-blue-500'>
                                                            <div className='animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full'></div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className='text-small leading-relaxed'>
                                                    {responseB.loading ? (
                                                        <div className='flex items-center justify-center h-32 text-gray-500'>
                                                            <div className='text-center space-y-2'>
                                                                <div className='animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto'></div>
                                                                <p>Generating response...</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className='prose prose-sm max-w-none'>
                                                            <ReactMarkdown>{responseB.content}</ReactMarkdown>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Voting Buttons */}
                                        {showVoting && !votingComplete && (
                                            <div className='text-center space-y-4'>
                                                <p className='text-body font-semibold'>Which response is better?</p>

                                                {/* Show model names when voting */}
                                                {revealedModels && (
                                                    <div className='flex justify-center gap-8 mb-4'>
                                                        <div className='text-center'>
                                                            <div className='text-small font-semibold text-blue-600'>
                                                                Model A
                                                            </div>
                                                            <div className='text-small opacity-70'>
                                                                {battleModels?.modelA}
                                                            </div>
                                                        </div>
                                                        <div className='text-center'>
                                                            <div className='text-small font-semibold text-green-600'>
                                                                Model B
                                                            </div>
                                                            <div className='text-small opacity-70'>
                                                                {battleModels?.modelB}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                                                    <button
                                                        onClick={() => handleVote('A')}
                                                        disabled={isVoting}
                                                        className='button-primary bg-blue-600 hover:bg-blue-700'
                                                    >
                                                        {isVoting ? 'Voting...' : 'Model A Wins'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleVote('tie')}
                                                        disabled={isVoting}
                                                        className='glass-card-subtle border border-gray-300 px-6 py-3 rounded-xl text-body hover:bg-gray-50 transition-all duration-200'
                                                    >
                                                        {isVoting ? 'Voting...' : "It's a Tie"}
                                                    </button>
                                                    <button
                                                        onClick={() => handleVote('B')}
                                                        disabled={isVoting}
                                                        className='button-primary bg-green-600 hover:bg-green-700'
                                                    >
                                                        {isVoting ? 'Voting...' : 'Model B Wins'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Vote Complete */}
                                        {votingComplete && (
                                            <div className='text-center space-y-4'>
                                                <div className='text-green-600 text-2xl'>✅</div>
                                                <p className='text-body font-semibold'>
                                                    Vote recorded! Thanks for participating.
                                                </p>

                                                {/* Show model names after voting */}
                                                {revealedModels && battleModels && (
                                                    <div className='glass-card-subtle border border-gray-200 p-4 rounded-xl max-w-md mx-auto'>
                                                        <p className='text-small font-semibold mb-3 text-gray-700'>
                                                            Battle Results:
                                                        </p>
                                                        <div className='flex justify-center gap-8'>
                                                            <div className='text-center'>
                                                                <div className='text-small font-semibold text-blue-600'>
                                                                    Model A
                                                                </div>
                                                                <div className='text-small opacity-70'>
                                                                    {battleModels.modelA}
                                                                </div>
                                                            </div>
                                                            <div className='text-center'>
                                                                <div className='text-small font-semibold text-green-600'>
                                                                    Model B
                                                                </div>
                                                                <div className='text-small opacity-70'>
                                                                    {battleModels.modelB}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <button onClick={startNewBattle} className='button-primary'>
                                                    Vote Again
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Leaderboard */
                            <div className='glass-card p-6 rounded-2xl'>
                                <h2 className='text-h3 gradient-text mb-6 text-center'>Model Rankings</h2>
                                {leaderboardLoading ? (
                                    <div className='flex items-center justify-center py-12'>
                                        <div className='text-center space-y-4'>
                                            <div className='animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto'></div>
                                            <p className='text-body text-gray-600'>Loading leaderboard...</p>
                                        </div>
                                    </div>
                                ) : leaderboard.length > 0 ? (
                                    <div className='overflow-x-auto'>
                                        <table className='w-full'>
                                            <thead>
                                                <tr className='border-b border-gray-200'>
                                                    <th className='text-left py-3 px-4 font-semibold text-body'>
                                                        Rank
                                                    </th>
                                                    <th className='text-left py-3 px-4 font-semibold text-body'>
                                                        Model
                                                    </th>
                                                    <th className='text-left py-3 px-4 font-semibold text-body'>
                                                        ELO Rating
                                                    </th>
                                                    <th className='text-left py-3 px-4 font-semibold text-body'>
                                                        Votes
                                                    </th>
                                                    <th className='text-left py-3 px-4 font-semibold text-body'>
                                                        W/L/T
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {leaderboard.map((entry, index) => (
                                                    <tr
                                                        key={entry.model_id}
                                                        className='border-b border-gray-100 hover:bg-gray-50 transition-colors'
                                                    >
                                                        <td className='py-3 px-4 text-body'>#{index + 1}</td>
                                                        <td className='py-3 px-4 text-body font-medium'>
                                                            {entry.model_id}
                                                        </td>
                                                        <td className='py-3 px-4 text-body font-semibold text-blue-600'>
                                                            {entry.elo_rating}
                                                        </td>
                                                        <td className='py-3 px-4 text-body'>{entry.total_votes}</td>
                                                        <td className='py-3 px-4 text-small text-gray-600'>
                                                            {entry.wins}/{entry.losses}/{entry.ties}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className='text-center py-8 text-gray-500'>
                                        <p>No models ranked yet. Start voting to see the leaderboard!</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
