'use client';

import Link from 'next/link';
import { strings } from '../../constants/strings';
import { useState } from 'react';

type Color = {
    id: string;
    name: string;
    gradient: string;
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
        <div className='flex min-h-screen bg-[#1d1d1d] overflow-hidden'>
            <header className='absolute top-0 right-0 p-4 sm:p-6'>
                <nav className='flex gap-4 sm:gap-6 text-white/70 font-nunito text-sm sm:text-base'>
                    <Link href='/apps' className='hover:text-white transition-colors'>
                        Apps
                    </Link>
                    <a href={`mailto:${strings.EMAIL}`} className='hover:text-white transition-colors'>
                        Email
                    </a>
                    <a
                        href={strings.LINKEDIN_URL}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='hover:text-white transition-colors'
                    >
                        LinkedIn
                    </a>
                    <a
                        href={strings.GITHUB_URL}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='hover:text-white transition-colors'
                    >
                        GitHub
                    </a>
                </nav>
            </header>

            <main className='flex-1 flex flex-col items-center justify-center gap-6 sm:gap-8 p-4'>
                <div className='text-white font-nunito text-lg sm:text-xl'>
                    Balance: {balance.toLocaleString()} coins
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
                                        ? 'scale-105 animate-[selectedGlow_2s_ease-in-out_infinite]'
                                        : 'scale-100 hover:scale-102'
                                }
                            `}
                        >
                            <div
                                className={`
                                    absolute inset-0 bg-gradient-to-br ${color.gradient}
                                    ${
                                        selectedColors.includes(color.id)
                                            ? 'opacity-40 border-2 border-white/30'
                                            : 'opacity-20 border border-white/10'
                                    }
                                    backdrop-blur-md
                                `}
                            />
                            <div
                                className={`
                                    relative text-white font-nunito font-bold
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
                        className='w-full p-2 sm:p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 
                                 text-sm sm:text-base text-white font-nunito placeholder:text-white/50 
                                 focus:outline-none focus:border-white/20'
                    />

                    {error && <div className='text-red-400 font-nunito text-xs sm:text-sm'>{error}</div>}

                    <div className='text-white/70 font-nunito text-xs sm:text-sm'>
                        Potential win: {potentialWin.toLocaleString()} coins ({multiplier}x)
                    </div>

                    <button
                        onClick={handleGamble}
                        disabled={isSpinning}
                        className={`
                            w-full p-3 sm:p-4 rounded-lg font-nunito font-bold text-white text-sm sm:text-base
                            bg-gradient-to-r from-purple-400/80 via-pink-400/80 to-blue-400/80
                            backdrop-blur-sm shadow-lg
                            hover:opacity-90 transition-all duration-300
                            disabled:opacity-50
                        `}
                    >
                        {isSpinning ? 'Spinning...' : 'GAMBLE'}
                    </button>
                </div>

                {result && (
                    <div
                        className={`
                            text-xl sm:text-2xl md:text-3xl font-nunito font-bold text-center
                            animate-fade-in transition-all duration-300
                            ${result.won ? 'text-green-400' : 'text-red-400'}
                        `}
                    >
                        <div className={`text-${result.color}-400`}>{result.color.toUpperCase()} was chosen</div>
                        <div className='mt-2'>
                            {result.won ? (
                                <>🎉 You won {result.amount.toLocaleString()} coins! 🎉</>
                            ) : (
                                <>😢 You lost {result.amount.toLocaleString()} coins 😢</>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
