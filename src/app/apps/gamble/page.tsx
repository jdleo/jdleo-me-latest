'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactConfetti from 'react-confetti';
import { WebVitals } from '@/components/SEO/WebVitals';

type Color = {
    id: string;
    name: string;
    gradient: string;
    textColor: string;
    hex: string;
};

type GameResult = {
    won: boolean;
    amount: number;
    color: string;
    multiplier: number;
};

type GameHistory = {
    id: number;
    bet: number;
    selectedColors: string[];
    winningColor: string;
    result: 'win' | 'loss';
    amount: number;
    timestamp: number;
};

const COLORS: Color[] = [
    { id: 'red', name: 'Red', gradient: 'from-red-400 to-red-600', textColor: 'text-red-400', hex: '#F87171' },
    { id: 'blue', name: 'Blue', gradient: 'from-blue-400 to-blue-600', textColor: 'text-blue-400', hex: '#60A5FA' },
    { id: 'green', name: 'Green', gradient: 'from-green-400 to-green-600', textColor: 'text-green-400', hex: '#4ADE80' },
    { id: 'purple', name: 'Purple', gradient: 'from-purple-400 to-purple-600', textColor: 'text-purple-400', hex: '#C084FC' },
    { id: 'orange', name: 'Orange', gradient: 'from-orange-400 to-orange-600', textColor: 'text-orange-400', hex: '#FB923C' },
    { id: 'pink', name: 'Pink', gradient: 'from-pink-400 to-pink-600', textColor: 'text-pink-400', hex: '#F472B6' },
];

const PRESET_BETS = [10, 50, 100, 250, 500];

export default function Gamble() {
    const [balance, setBalance] = useState(1000);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [betAmount, setBetAmount] = useState<number>(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [result, setResult] = useState<GameResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const multiplier = selectedColors.length ? 6 / selectedColors.length : 0;
    const potentialWin = betAmount * multiplier;

    const handleColorSelect = (colorId: string) => {
        setError(null);
        setResult(null);
        if (selectedColors.includes(colorId)) {
            setSelectedColors(prev => prev.filter(id => id !== colorId));
        } else if (selectedColors.length >= 5) {
            setError('Max selection reached (5)');
            return;
        } else {
            setSelectedColors(prev => [...prev, colorId]);
        }
    };

    const handleGamble = async () => {
        if (isSpinning || !selectedColors.length || betAmount <= 0 || betAmount > balance) return;

        setIsSpinning(true);
        setError(null);
        setResult(null);

        await new Promise(resolve => setTimeout(resolve, 1500));

        const winningColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        const won = selectedColors.includes(winningColor.id);
        const gameResult: GameResult = { won, amount: won ? betAmount * multiplier - betAmount : betAmount, color: winningColor.id, multiplier };

        const historyEntry: GameHistory = { id: Date.now(), bet: betAmount, selectedColors: [...selectedColors], winningColor: winningColor.id, result: won ? 'win' : 'loss', amount: gameResult.amount, timestamp: Date.now() };
        setGameHistory(prev => [historyEntry, ...prev.slice(0, 9)]);

        if (won) {
            setBalance(prev => prev + gameResult.amount);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 4000);
        } else {
            setBalance(prev => prev - gameResult.amount);
        }

        setResult(gameResult);
        setIsSpinning(false);
        setTimeout(() => { setSelectedColors([]); setBetAmount(0); }, 3000);
    };

    const resetGame = () => {
        setBalance(1000);
        setSelectedColors([]);
        setBetAmount(0);
        setResult(null);
        setGameHistory([]);
    };

    const getColorObject = (colorId: string) => COLORS.find(c => c.id === colorId) || COLORS[0];

    return (
        <>
            <WebVitals />
            {showConfetti && <ReactConfetti style={{ zIndex: 100 }} />}
            <main className='relative h-screen bg-[#fafbff] overflow-hidden selection:bg-[var(--purple-2)] selection:text-[var(--purple-4)] flex flex-col md:flex-row'>

                {/* Mobile Header */}
                <header className='md:hidden flex items-center justify-between p-4 border-b border-[var(--border-light)] bg-white/80 backdrop-blur-md z-50'>
                    <Link href='/apps' className='text-sm font-bold uppercase tracking-widest text-muted hover:text-[var(--purple-4)]'>
                        ← Apps
                    </Link>
                    <div className='text-sm font-bold text-[var(--purple-4)] bg-[var(--purple-1)]/30 px-3 py-1 rounded-full'>
                        ${balance.toLocaleString()}
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className='px-3 py-1.5 bg-white border border-[var(--border-light)] rounded-full shadow-sm text-xs font-bold uppercase tracking-wider text-[var(--fg-4)] flex items-center gap-1.5'
                    >
                        <span>Menu</span>
                        <span className='text-[10px]'>▼</span>
                    </button>
                </header>

                {/* Left Sidebar (Desktop) */}
                <aside className='hidden md:flex flex-col w-80 h-full border-r border-[var(--border-light)] bg-white/50 backdrop-blur-xl z-20'>
                    <div className='p-6 border-b border-[var(--border-light)]'>
                        <div className='flex items-center gap-3 mb-6'>
                            <div className='w-3 h-3 rounded-full bg-[var(--purple-4)]' />
                            <span className='font-bold uppercase tracking-widest text-sm text-[var(--fg-4)]'>Gamble Deck</span>
                        </div>
                        <nav className='flex flex-col gap-2'>
                            <Link href='/apps' className='text-xs font-bold uppercase tracking-wider text-muted hover:text-[var(--purple-4)] transition-colors flex items-center gap-2'>
                                <span>←</span> Back to Apps
                            </Link>
                        </nav>
                    </div>

                    <div className='flex-grow overflow-y-auto p-6 space-y-8'>
                        <div>
                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Wallet</h3>
                            <div className='p-6 rounded-2xl bg-gradient-to-br from-[var(--purple-4)] to-[var(--purple-5)] text-white shadow-lg'>
                                <span className='text-[10px] uppercase tracking-widest opacity-80 block mb-1'>Available Balance</span>
                                <div className='text-3xl font-bold'>${balance.toLocaleString()}</div>
                            </div>
                        </div>

                        <div>
                            <div className='flex items-center justify-between mb-4'>
                                <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted'>History</h3>
                                <button onClick={resetGame} className='text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-500'>Reset</button>
                            </div>
                            <div className='space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar'>
                                {gameHistory.map(game => (
                                    <div key={game.id} className='flex justify-between items-center p-3 rounded-xl bg-white border border-[var(--border-light)] shadow-sm'>
                                        <div className='flex flex-col'>
                                            <span className={`text-xs font-bold ${game.result === 'win' ? 'text-green-500' : 'text-red-400'}`}>
                                                {game.result === 'win' ? '+' : '-'}${game.amount}
                                            </span>
                                            <span className='text-[10px] text-muted uppercase'>{getColorObject(game.winningColor).name}</span>
                                        </div>
                                        <div className='w-2 h-2 rounded-full' style={{ backgroundColor: getColorObject(game.winningColor).hex }} />
                                    </div>
                                ))}
                                {gameHistory.length === 0 && (
                                    <div className='text-center py-4 text-xs text-muted italic'>No games played yet</div>
                                )}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className='flex-grow flex flex-col h-full relative bg-[#fafbff] overflow-hidden'>
                    {/* Floating decorations */}
                    <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--purple-1)] opacity-30 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2' />

                    <div className='flex-grow overflow-auto p-4 md:p-8 scrollbar-hide z-10 flex flex-col items-center justify-center'>
                        <div className='w-full max-w-3xl animate-fade-in-up space-y-8'>

                            {/* Color Selection Grid */}
                            <div className='grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6'>
                                {COLORS.map(color => (
                                    <button
                                        key={color.id}
                                        onClick={() => handleColorSelect(color.id)}
                                        disabled={isSpinning}
                                        className={`
                                            relative h-32 md:h-40 rounded-2xl border transition-all duration-300 overflow-hidden group flex flex-col items-center justify-center gap-2 shadow-sm
                                            ${selectedColors.includes(color.id)
                                                ? 'border-[var(--purple-4)] ring-2 ring-[var(--purple-1)] transform scale-105 shadow-xl z-10'
                                                : 'border-[var(--border-light)] hover:border-[var(--purple-4)] bg-white hover:shadow-md'}
                                        `}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${color.gradient} opacity-[0.03] group-hover:opacity-10 transition-opacity`} />
                                        <div
                                            className={`w-12 h-12 md:w-16 md:h-16 rounded-full shadow-lg transition-transform duration-500 ${isSpinning ? 'animate-spin' : ''}`}
                                            style={{ background: color.hex }}
                                        />
                                        <span className={`text-xs font-bold uppercase tracking-widest z-10 ${selectedColors.includes(color.id) ? 'text-[var(--fg-4)]' : 'text-muted'}`}>
                                            {color.name}
                                        </span>
                                        {selectedColors.includes(color.id) && (
                                            <div className='absolute top-3 right-3 text-[var(--purple-4)]'>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Betting Controls */}
                            <div className='bg-white rounded-3xl border border-[var(--border-light)] p-6 md:p-8 shadow-xl space-y-6'>
                                <div className='flex flex-col md:flex-row gap-6 items-end'>
                                    <div className='flex-grow w-full space-y-3'>
                                        <div className='flex justify-between items-center'>
                                            <span className='text-xs font-bold uppercase tracking-widest text-muted'>Wager Amount</span>
                                            <span className='text-xs font-bold text-[var(--purple-4)]'>{multiplier > 0 ? `${multiplier.toFixed(2)}x Multiplier` : 'Select Colors'}</span>
                                        </div>
                                        <div className='relative'>
                                            <span className='absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold'>$</span>
                                            <input
                                                type='number'
                                                value={betAmount || ''}
                                                onChange={e => setBetAmount(Number(e.target.value))}
                                                placeholder='0'
                                                disabled={isSpinning}
                                                className='w-full bg-[var(--bg-2)] border-2 border-transparent focus:border-[var(--purple-4)] rounded-xl py-3 pl-8 pr-4 text-lg font-bold text-[var(--fg-4)] outline-none transition-all placeholder:text-muted/30'
                                            />
                                        </div>
                                    </div>

                                    <div className='flex flex-wrap gap-2'>
                                        {PRESET_BETS.map(amt => (
                                            <button
                                                key={amt}
                                                onClick={() => setBetAmount(amt)}
                                                disabled={isSpinning || amt > balance}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${betAmount === amt ? 'bg-[var(--purple-4)] text-white border-[var(--purple-4)]' : 'bg-[var(--bg-2)] text-muted border-transparent hover:border-[var(--border-light)]'}`}
                                            >
                                                ${amt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleGamble}
                                    disabled={isSpinning || !selectedColors.length || betAmount <= 0}
                                    className={`w-full md:w-auto px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                                            ${isSpinning
                                            ? 'bg-yellow-400 text-yellow-900 animate-pulse'
                                            : 'bg-[var(--fg-4)] text-white hover:bg-[var(--purple-4)] hover:shadow-xl'
                                        }
                                        `}
                                >
                                    {isSpinning ? 'Rolling...' : 'Place Bet'}
                                </button>
                                {error && <div className='text-red-500 text-xs font-bold text-center animate-shake bg-red-50 py-2 rounded-lg'>{error}</div>}
                            </div>

                            {/* Result Display */}
                            {result && (
                                <div className={`p-6 rounded-2xl border-2 text-center animate-reveal transform transition-all ${result.won ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'}`}>
                                    <div className='text-xs font-bold uppercase tracking-widest opacity-60 mb-2'>Round Result</div>
                                    <div className='text-3xl font-black mb-2'>
                                        {result.won ? `+$${result.amount}` : `-$${result.amount}`}
                                    </div>
                                    <div className='flex items-center justify-center gap-2'>
                                        <span className='text-xs font-bold uppercase'>Winning Color:</span>
                                        <span className='w-3 h-3 rounded-full inline-block' style={{ background: getColorObject(result.color).hex }} />
                                        <span className='text-xs font-bold uppercase'>{getColorObject(result.color).name}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className='fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 md:hidden' onClick={() => setIsMobileMenuOpen(false)}>
                        <div className='w-full max-w-sm bg-white rounded-2xl shadow-2xl animate-slide-up overflow-hidden border border-[var(--border-light)]' onClick={e => e.stopPropagation()}>
                            <div className='p-4 border-b border-[var(--border-light)] flex justify-between items-center bg-[var(--bg-2)]'>
                                <span className='text-xs font-bold uppercase tracking-widest text-[var(--fg-4)]'>Gamble Deck</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className='w-6 h-6 rounded-full bg-white border border-[var(--border-light)] flex items-center justify-center text-muted'>✕</button>
                            </div>
                            <div className='p-6 space-y-6'>
                                <div className='p-4 rounded-xl bg-[var(--purple-1)]/20 border border-[var(--purple-1)] text-[var(--fg-4)] text-center'>
                                    <span className='text-[10px] uppercase tracking-widest opacity-60 block mb-1'>Balance</span>
                                    <div className='text-2xl font-bold'>${balance.toLocaleString()}</div>
                                </div>

                                <button onClick={resetGame} className='w-full py-3 border border-red-200 text-red-500 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-red-50'>
                                    Reset Game
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
