'use client';

import Link from 'next/link';
import { strings } from '../../constants/strings';
import { useState, useEffect } from 'react';

type Color = {
    id: string;
    name: string;
    gradient: string;
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

const COLORS: Color[] = [
    { id: 'red', name: 'Red', gradient: 'from-red-400 to-red-600' },
    { id: 'blue', name: 'Blue', gradient: 'from-blue-400 to-blue-600' },
    { id: 'green', name: 'Green', gradient: 'from-green-400 to-green-600' },
    { id: 'purple', name: 'Purple', gradient: 'from-purple-400 to-purple-600' },
    { id: 'orange', name: 'Orange', gradient: 'from-orange-400 to-orange-600' },
    { id: 'pink', name: 'Pink', gradient: 'from-pink-400 to-pink-600' },
];

export default function Gamble() {
    const [balance, setBalance] = useState(1000); // start with 1000 coins
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [betAmount, setBetAmount] = useState<number>(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [result, setResult] = useState<{ won: boolean; amount: number; color: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [particles, setParticles] = useState<Particle[]>([]);

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

    const multiplier = selectedColors.length ? 6 / selectedColors.length : 0;
    const potentialWin = betAmount * multiplier;

    const handleColorSelect = (colorId: string) => {
        setError(null);
        if (selectedColors.includes(colorId)) {
            setSelectedColors(prev => prev.filter(id => id !== colorId));
        } else if (selectedColors.length >= 5) {
            setError("You can't select more than 5 colors");
            return;
        } else {
            setSelectedColors(prev => [...prev, colorId]);
        }
    };

    const handleBetChange = (value: string) => {
        setError(null);
        const amount = Number(value);
        if (amount > balance) {
            setError("You don't have enough balance");
            setBetAmount(0);
        } else {
            setBetAmount(amount);
        }
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

        // Simulate spin
        await new Promise(resolve => setTimeout(resolve, 500));

        const winningColor = COLORS[Math.floor(Math.random() * COLORS.length)].id;
        const won = selectedColors.includes(winningColor);

        if (won) {
            const winAmount = betAmount * multiplier - betAmount;
            setBalance(prev => prev + winAmount);
            setResult({ won: true, amount: winAmount, color: winningColor });
        } else {
            setBalance(prev => prev - betAmount);
            setResult({ won: false, amount: betAmount, color: winningColor });
        }

        setIsSpinning(false);
    };

    return (
        <div className='min-h-screen bg-[color:var(--background)] overflow-hidden orbital-grid'>
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
            <header className='absolute top-0 right-0 p-4 sm:p-6'>
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
                className={`flex-1 flex flex-col items-center justify-center gap-6 sm:gap-8 p-4 pt-24 transition-opacity duration-700 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <div className='mb-4 text-center'>
                    <h1 className='text-2xl sm:text-3xl font-bold mb-2'>
                        <span className='gradient-text'>Color Gamble</span>
                    </h1>
                </div>

                <div className='glass-card px-6 py-3 rounded-full mb-2'>
                    <span className='text-[color:var(--foreground)] font-semibold'>
                        Balance: {balance.toLocaleString()} coins
                    </span>
                </div>

                <div className='grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl w-full'>
                    {COLORS.map(color => (
                        <button
                            key={color.id}
                            onClick={() => handleColorSelect(color.id)}
                            className={`
                                relative p-4 sm:p-6 rounded-xl overflow-hidden transition-all duration-300
                                ${
                                    selectedColors.includes(color.id)
                                        ? 'scale-105 shadow-orbital-glow-sm'
                                        : 'scale-100 hover:scale-[1.02]'
                                }
                            `}
                        >
                            <div
                                className={`
                                    absolute inset-0 bg-gradient-to-br ${color.gradient}
                                    ${
                                        selectedColors.includes(color.id)
                                            ? 'opacity-60 border-2 border-white/30'
                                            : 'opacity-30 border border-white/10'
                                    }
                                    backdrop-blur-md
                                `}
                            />
                            <div
                                className={`
                                    relative text-white font-bold
                                    ${
                                        selectedColors.includes(color.id)
                                            ? 'text-base sm:text-lg'
                                            : 'text-sm sm:text-base'
                                    }
                                `}
                            >
                                {color.name}
                            </div>
                        </button>
                    ))}
                </div>

                <div className='flex flex-col items-center gap-3 sm:gap-4 w-full max-w-md'>
                    <input
                        type='number'
                        value={betAmount || ''}
                        onChange={e => handleBetChange(e.target.value)}
                        placeholder='Enter bet amount'
                        className='w-full p-3 sm:p-4 rounded-lg bg-[color:var(--secondary)] border border-[color:var(--border)]
                                 text-sm sm:text-base text-[color:var(--foreground)] placeholder:text-[color:var(--foreground)] placeholder:text-opacity-50 
                                 focus:outline-none focus:border-[color:var(--primary)] focus:border-opacity-50
                                 transition-all duration-300'
                    />

                    {error && (
                        <div className='text-red-400 bg-red-400 bg-opacity-10 px-4 py-2 rounded-lg border border-red-400 border-opacity-20 text-sm w-full'>
                            {error}
                        </div>
                    )}

                    <div className='text-[color:var(--foreground)] text-opacity-70 text-xs sm:text-sm'>
                        Potential win: {potentialWin.toLocaleString()} coins ({multiplier.toFixed(2)}x)
                    </div>

                    <button
                        onClick={handleGamble}
                        disabled={isSpinning}
                        className='relative px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-bold overflow-hidden group transition-all w-full hover:shadow-orbital-glow hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none'
                    >
                        <span className='absolute inset-0 w-full h-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></span>
                        <span className='absolute inset-0 w-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-50 group-hover:w-full transition-all duration-500 blur-lg'></span>
                        <span className='relative z-10'>{isSpinning ? 'Spinning...' : 'GAMBLE'}</span>
                    </button>
                </div>

                {result && (
                    <div className='glass-card p-6 rounded-xl transition-all duration-300 animate-pulse-slow text-center'>
                        <div className={`text-xl sm:text-2xl font-bold mb-2 text-${result.color}-400`}>
                            {result.color.toUpperCase()} was chosen
                        </div>
                        <div
                            className={`text-xl sm:text-2xl font-bold ${
                                result.won ? 'text-green-400' : 'text-red-400'
                            }`}
                        >
                            {result.won ? (
                                <>🎉 You won {result.amount.toLocaleString()} coins! 🎉</>
                            ) : (
                                <>😢 You lost {result.amount.toLocaleString()} coins 😢</>
                            )}
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
