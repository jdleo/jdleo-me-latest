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
    { id: 'red', name: 'Red', gradient: 'from-red-400 to-red-600', textColor: 'text-red-400' },
    { id: 'blue', name: 'Blue', gradient: 'from-blue-400 to-blue-600', textColor: 'text-blue-400' },
    { id: 'green', name: 'Green', gradient: 'from-green-400 to-green-600', textColor: 'text-green-400' },
    { id: 'purple', name: 'Purple', gradient: 'from-purple-400 to-purple-600', textColor: 'text-purple-400' },
    { id: 'orange', name: 'Orange', gradient: 'from-orange-400 to-orange-600', textColor: 'text-orange-400' },
    { id: 'pink', name: 'Pink', gradient: 'from-pink-400 to-pink-600', textColor: 'text-pink-400' },
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
            setError('MAX_SELECTION_REACHED [5]');
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
                            <div className='terminal-title'>johnleonardo — ~/color-optics-gamble</div>
                        </div>

                        <div className='terminal-split flex-grow overflow-hidden'>
                            {/* Left Sidebar: Ledger & Stats */}
                            <div className='terminal-pane border-r border-[var(--color-border)] hidden md:flex flex-col gap-8'>
                                <div>
                                    <div className='flex items-center gap-2 mb-6 text-[var(--color-accent)]'>
                                        <span className='terminal-prompt'>➜</span>
                                        <span className='text-sm uppercase tracking-widest font-bold'>Ledger</span>
                                    </div>
                                    <nav className='flex flex-col gap-4 mb-10 font-mono'>
                                        <div className='p-4 border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 rounded-lg'>
                                            <span className='text-[10px] opacity-40 uppercase tracking-widest block mb-1'>Current_Capital</span>
                                            <div className='text-2xl font-bold text-[var(--color-accent)]'>${balance.toLocaleString()}</div>
                                        </div>
                                        <Link href='/' className='text-sm hover:text-[var(--color-accent)] transition-colors'>~/home</Link>
                                        <Link href='/apps' className='text-sm hover:text-[var(--color-accent)] transition-colors'>~/apps</Link>
                                    </nav>

                                    <div className='space-y-6 font-mono'>
                                        <div>
                                            <span className='text-[var(--color-text)] opacity-40 text-[10px] uppercase tracking-widest block mb-4'>$ cat history.log</span>
                                            <div className='space-y-2 overflow-y-auto max-h-[250px] pr-2 scrollbar-hide'>
                                                {gameHistory.map(game => (
                                                    <div key={game.id} className='flex justify-between items-center text-[10px] border-b border-[var(--color-border)] pb-2'>
                                                        <span className={game.result === 'win' ? 'text-green-400' : 'text-red-400'}>
                                                            {game.result === 'win' ? 'PROFIT' : 'LOSS'}: ${game.amount}
                                                        </span>
                                                        <span className='opacity-30 uppercase'>{getColorObject(game.winningColor).name}</span>
                                                    </div>
                                                ))}
                                                {gameHistory.length === 0 && <span className='text-[10px] opacity-20'>[NO_RECORDS_FOUND]</span>}
                                            </div>
                                        </div>
                                        <button onClick={resetGame} className='w-full py-2 border border-red-500/20 hover:bg-red-500/10 text-red-400 text-[10px] uppercase tracking-widest transition-all rounded'>
                                            [RESET_LEDGER]
                                        </button>
                                    </div>
                                </div>
                                <div className='mt-auto pt-8 border-t border-[var(--color-border)] opacity-30 font-mono text-[9px] uppercase tracking-tighter'>
                                    "Quantum-resilient pseudorandom distribution of spectral assets."
                                </div>
                            </div>

                            {/* Main Display: Play Mat */}
                            <div className='terminal-pane bg-black/40 flex flex-col p-8 overflow-y-auto w-full'>
                                <div className='max-w-2xl mx-auto w-full space-y-10'>
                                    <div className='grid grid-cols-2 md:grid-cols-3 gap-6'>
                                        {COLORS.map(color => (
                                            <button
                                                key={color.id}
                                                onClick={() => handleColorSelect(color.id)}
                                                disabled={isSpinning}
                                                className={`relative p-8 rounded-lg border transition-all duration-300 overflow-hidden group ${selectedColors.includes(color.id) ? 'border-[var(--color-accent)] scale-105 shadow-2xl' : 'border-[var(--color-border)] hover:border-white/20'}`}
                                            >
                                                <div className={`absolute inset-0 bg-gradient-to-br ${color.gradient} ${selectedColors.includes(color.id) ? 'opacity-40' : 'opacity-5'} group-hover:opacity-20 transition-opacity`} />
                                                <span className={`relative z-10 font-mono text-xs uppercase tracking-widest ${selectedColors.includes(color.id) ? 'text-white font-bold' : 'text-white/40 group-hover:text-white/60'}`}>
                                                    {color.id}
                                                </span>
                                                {selectedColors.includes(color.id) && <div className='absolute top-2 right-2 text-[var(--color-accent)] font-bold text-[10px]'>[SEL]</div>}
                                            </button>
                                        ))}
                                    </div>

                                    <div className='border-t border-[var(--color-border)] pt-10 grid gap-8'>
                                        <div className='space-y-4'>
                                            <div className='flex justify-between items-end'>
                                                <span className='text-[10px] font-mono opacity-40 uppercase'>Wager_Contract_Amount</span>
                                                <span className='text-xs font-mono text-[var(--color-accent)]'>BAL: ${balance}</span>
                                            </div>
                                            <div className='flex gap-2 justify-center'>
                                                {PRESET_BETS.map(amt => (
                                                    <button key={amt} onClick={() => setBetAmount(amt)} disabled={isSpinning || amt > balance} className={`px-4 py-2 border font-mono text-[10px] rounded transition-all ${betAmount === amt ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-[var(--color-border)] hover:border-white/30 text-white/40'}`}>
                                                        ${amt}
                                                    </button>
                                                ))}
                                            </div>
                                            <input
                                                type='number'
                                                value={betAmount || ''}
                                                onChange={e => setBetAmount(Number(e.target.value))}
                                                placeholder='CUSTOM_WAGER...'
                                                disabled={isSpinning}
                                                className='w-full bg-black/40 border border-[var(--color-border)] rounded-lg p-4 font-mono text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none text-center'
                                            />
                                        </div>

                                        <button
                                            onClick={handleGamble}
                                            disabled={isSpinning || !selectedColors.length || betAmount <= 0}
                                            className={`w-full py-5 border-[2px] transition-all rounded-xl font-mono text-sm font-bold uppercase tracking-[0.4em] ${isSpinning ? 'border-yellow-500/20 text-yellow-500/40 animate-pulse' : 'border-[var(--color-accent)]/50 hover:bg-[var(--color-accent)]/10 text-[var(--color-accent)]'}`}
                                        >
                                            {isSpinning ? 'DISTRIBUTING_RESULT...' : '[INITIATE_SPIN]'}
                                        </button>

                                        {result && (
                                            <div className={`p-6 rounded border font-mono text-center animate-reveal ${result.won ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
                                                <div className='text-[10px] opacity-60 mb-2 uppercase'>Detection_Interface_Result</div>
                                                <div className='text-xl uppercase font-black'>
                                                    {result.won ? `PROFIT_GENERATED: +$${result.amount}` : `CAPITAL_LOSS: -$${result.amount}`}
                                                </div>
                                                <div className='text-[10px] mt-2 opacity-40 uppercase'>WINNING_HEX: {result.color}</div>
                                            </div>
                                        )}
                                        {error && <div className='text-center font-mono text-[10px] text-red-500 animate-shake'>{error}</div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Console decoration */}
                    <div className='mt-4 flex items-center justify-between text-[10px] font-mono text-[var(--color-text-dim)] opacity-40 uppercase tracking-[0.2em] px-4'>
                        <div className='flex gap-6'>
                            <span>P_RATIO: {multiplier.toFixed(2)}x</span>
                            <span>ENTROPY: 0.992</span>
                        </div>
                        <span>Status: pool_ready</span>
                    </div>
                </div>
            </main>
        </>
    );
}
