'use client';

import Link from 'next/link';
import { strings } from '../../constants/strings';
import { useState, useEffect } from 'react';
import ReactConfetti from 'react-confetti';

type Color = {
    id: string;
    name: string;
    gradient: string;
    textColor: string;
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
    const [particles, setParticles] = useState<Particle[]>([]);
    const [showConfetti, setShowConfetti] = useState(false);
    const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        setIsLoaded(true);

        // Generate particles once on component mount
        const newParticles = Array.from({ length: 12 }, (_, i) => {
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
                animationDuration: `${Math.random() * 15 + 10}s`,
                animationDelay: `${Math.random() * 8}s`,
            };
        });

        setParticles(newParticles);
    }, []);

    const multiplier = selectedColors.length ? 6 / selectedColors.length : 0;
    const potentialWin = betAmount * multiplier;

    const handleColorSelect = (colorId: string) => {
        setError(null);
        setResult(null);
        if (selectedColors.includes(colorId)) {
            setSelectedColors(prev => prev.filter(id => id !== colorId));
        } else if (selectedColors.length >= 5) {
            setError('Maximum 5 colors allowed');
            return;
        } else {
            setSelectedColors(prev => [...prev, colorId]);
        }
    };

    const handleBetChange = (value: string) => {
        setError(null);
        setResult(null);
        const amount = Number(value);
        if (amount > balance) {
            setError('Insufficient balance');
            setBetAmount(0);
        } else {
            setBetAmount(amount);
        }
    };

    const handlePresetBet = (amount: number) => {
        setError(null);
        setResult(null);
        if (amount > balance) {
            setError('Insufficient balance');
            return;
        }
        setBetAmount(amount);
    };

    const handleGamble = async () => {
        if (isSpinning) return;
        if (!selectedColors.length) {
            setError('Select at least one color');
            return;
        }
        if (betAmount <= 0) {
            setError('Enter a valid bet amount');
            return;
        }
        if (betAmount > balance) {
            setError('Insufficient balance');
            return;
        }

        setIsSpinning(true);
        setError(null);
        setResult(null);

        // Extended spin animation
        await new Promise(resolve => setTimeout(resolve, 1500));

        const winningColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        const won = selectedColors.includes(winningColor.id);

        const gameResult: GameResult = {
            won,
            amount: won ? betAmount * multiplier - betAmount : betAmount,
            color: winningColor.id,
            multiplier,
        };

        // Add to history
        const historyEntry: GameHistory = {
            id: Date.now(),
            bet: betAmount,
            selectedColors: [...selectedColors],
            winningColor: winningColor.id,
            result: won ? 'win' : 'loss',
            amount: gameResult.amount,
            timestamp: Date.now(),
        };

        setGameHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10 games

        if (won) {
            setBalance(prev => prev + gameResult.amount);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 4000);
        } else {
            setBalance(prev => prev - gameResult.amount);
        }

        setResult(gameResult);
        setIsSpinning(false);

        // Reset selections after game
        setTimeout(() => {
            setSelectedColors([]);
            setBetAmount(0);
        }, 3000);
    };

    const resetGame = () => {
        setBalance(1000);
        setSelectedColors([]);
        setBetAmount(0);
        setResult(null);
        setError(null);
        setGameHistory([]);
    };

    const getColorObject = (colorId: string) => COLORS.find(c => c.id === colorId) || COLORS[0];

    return (
        <div className='min-h-screen bg-[color:var(--background)] overflow-hidden orbital-grid'>
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
                className={`flex-1 flex flex-col items-center justify-center gap-6 sm:gap-8 p-4 pt-24 pb-8 transition-opacity duration-700 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
            >
                {/* Title and Balance */}
                <div className='text-center'>
                    <h1 className='text-2xl sm:text-3xl font-bold mb-4'>
                        <span className='gradient-text'>Color Gamble</span>
                    </h1>
                    <div className='glass-card px-6 py-3 rounded-full'>
                        <span className='text-[color:var(--foreground)] font-semibold text-lg'>
                            💰 {balance.toLocaleString()} coins
                        </span>
                    </div>
                </div>

                {/* Color Selection */}
                <div className='w-full max-w-2xl'>
                    <h2 className='text-[color:var(--foreground)] text-opacity-80 text-center mb-4 font-semibold'>
                        Choose your colors ({selectedColors.length}/5)
                    </h2>
                    <div className='grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4'>
                        {COLORS.map(color => (
                            <button
                                key={color.id}
                                onClick={() => handleColorSelect(color.id)}
                                className={`
                                    relative p-4 sm:p-6 rounded-xl overflow-hidden transition-all duration-300
                                    ${
                                        selectedColors.includes(color.id)
                                            ? 'scale-105 shadow-orbital-glow-sm ring-2 ring-white/50'
                                            : 'scale-100 hover:scale-[1.02] hover:shadow-lg'
                                    }
                                    ${isSpinning ? 'pointer-events-none' : ''}
                                `}
                                disabled={isSpinning}
                            >
                                <div
                                    className={`
                                        absolute inset-0 bg-gradient-to-br ${color.gradient}
                                        ${selectedColors.includes(color.id) ? 'opacity-80' : 'opacity-40'}
                                        backdrop-blur-md transition-opacity duration-300
                                    `}
                                />
                                <div className='relative text-white font-bold text-sm sm:text-base flex items-center justify-center'>
                                    {selectedColors.includes(color.id) && '✓ '}
                                    {color.name}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Betting Interface */}
                <div className='w-full max-w-md space-y-4'>
                    <div>
                        <h3 className='text-[color:var(--foreground)] text-opacity-80 text-center mb-3 font-semibold'>
                            Place your bet
                        </h3>

                        {/* Preset bet buttons */}
                        <div className='flex gap-2 mb-3 justify-center flex-wrap'>
                            {PRESET_BETS.map(amount => (
                                <button
                                    key={amount}
                                    onClick={() => handlePresetBet(amount)}
                                    disabled={isSpinning || amount > balance}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                        betAmount === amount
                                            ? 'bg-[color:var(--primary)] text-white'
                                            : amount > balance
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                                            : 'glass-card hover:bg-[color:var(--primary)] hover:bg-opacity-20'
                                    }`}
                                >
                                    {amount}
                                </button>
                            ))}
                        </div>

                        <input
                            type='number'
                            value={betAmount || ''}
                            onChange={e => handleBetChange(e.target.value)}
                            placeholder='Enter custom amount'
                            disabled={isSpinning}
                            className='w-full p-3 sm:p-4 rounded-lg bg-[color:var(--secondary)] border border-[color:var(--border)]
                                     text-sm sm:text-base text-[color:var(--foreground)] placeholder:text-[color:var(--foreground)] placeholder:text-opacity-50 
                                     focus:outline-none focus:border-[color:var(--primary)] focus:border-opacity-50
                                     transition-all duration-300 disabled:opacity-50'
                        />
                    </div>

                    {/* Game Stats */}
                    {selectedColors.length > 0 && betAmount > 0 && (
                        <div className='glass-card p-4 rounded-xl text-center space-y-2'>
                            <div className='text-[color:var(--foreground)] text-opacity-70 text-sm'>
                                <div>
                                    Selected: {selectedColors.length} color{selectedColors.length !== 1 ? 's' : ''}
                                </div>
                                <div>
                                    Multiplier:{' '}
                                    <span className='font-bold text-[color:var(--primary)]'>
                                        {multiplier.toFixed(2)}x
                                    </span>
                                </div>
                                <div>
                                    Potential win:{' '}
                                    <span className='font-bold text-green-500'>
                                        +{(potentialWin - betAmount).toLocaleString()}
                                    </span>{' '}
                                    coins
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className='text-red-500 bg-red-50 px-4 py-2 rounded-lg border border-red-200 text-sm text-center animate-pulse'>
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Gamble Button */}
                    <button
                        onClick={handleGamble}
                        disabled={isSpinning || !selectedColors.length || betAmount <= 0}
                        className={`button-primary disabled:opacity-50 disabled:cursor-not-allowed w-full group text-sm sm:text-base justify-center ${
                            isSpinning ? 'animate-pulse' : ''
                        }`}
                    >
                        <span className='font-bold'>{isSpinning ? 'SPINNING...' : '🎲 ROLL THE DICE'}</span>
                        <svg
                            width='20'
                            height='20'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            className={isSpinning ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}
                        >
                            <rect x='3' y='3' width='18' height='18' rx='2' ry='2' />
                            <circle cx='9' cy='9' r='1' />
                            <circle cx='15' cy='15' r='1' />
                        </svg>
                    </button>
                </div>

                {/* Result Display */}
                {result && (
                    <div
                        className={`glass-card p-6 rounded-xl text-center space-y-3 transition-all duration-500 animate-pulse-slow ${
                            result.won ? 'ring-2 ring-green-400' : 'ring-2 ring-red-400'
                        }`}
                    >
                        <div className='text-lg font-semibold text-[color:var(--foreground)] text-opacity-80'>
                            🎯 Winning Color:{' '}
                            <span className={`font-bold ${getColorObject(result.color).textColor}`}>
                                {getColorObject(result.color).name.toUpperCase()}
                            </span>
                        </div>
                        <div
                            className={`text-xl sm:text-2xl font-bold ${
                                result.won ? 'text-green-500' : 'text-red-500'
                            }`}
                        >
                            {result.won ? (
                                <>🎉 YOU WON {result.amount.toLocaleString()} COINS! 🎉</>
                            ) : (
                                <>💸 You lost {result.amount.toLocaleString()} coins 💸</>
                            )}
                        </div>
                        {result.won && (
                            <div className='text-sm text-[color:var(--foreground)] text-opacity-70'>
                                Multiplier: {result.multiplier.toFixed(2)}x
                            </div>
                        )}
                    </div>
                )}

                {/* Game Controls */}
                <div className='flex gap-4 justify-center'>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className='button-secondary text-sm'
                        disabled={isSpinning}
                    >
                        <span>📊 History</span>
                    </button>
                    <button onClick={resetGame} className='button-secondary text-sm' disabled={isSpinning}>
                        <span>🔄 Reset Game</span>
                    </button>
                </div>

                {/* Game History */}
                {showHistory && gameHistory.length > 0 && (
                    <div className='w-full max-w-md glass-card p-4 rounded-xl'>
                        <h3 className='font-semibold text-[color:var(--foreground)] mb-3 text-center'>Recent Games</h3>
                        <div className='space-y-2 max-h-40 overflow-y-auto'>
                            {gameHistory.map(game => (
                                <div
                                    key={game.id}
                                    className='flex justify-between items-center text-sm py-2 border-b border-[color:var(--border)]'
                                >
                                    <div className='flex items-center gap-2'>
                                        <span
                                            className={`font-bold ${
                                                game.result === 'win' ? 'text-green-500' : 'text-red-500'
                                            }`}
                                        >
                                            {game.result === 'win' ? '+' : '-'}
                                            {game.amount}
                                        </span>
                                        <span className={`text-xs ${getColorObject(game.winningColor).textColor}`}>
                                            {getColorObject(game.winningColor).name}
                                        </span>
                                    </div>
                                    <div className='text-[color:var(--foreground)] text-opacity-50 text-xs'>
                                        Bet: {game.bet}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
