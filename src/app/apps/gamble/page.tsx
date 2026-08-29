'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactConfetti from 'react-confetti';
import { strings } from '../../constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import { CubeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

type Color = {
    id: string;
    name: string;
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
    { id: 'red', name: 'Red', hex: '#dc2626' },
    { id: 'blue', name: 'Blue', hex: '#2563eb' },
    { id: 'green', name: 'Green', hex: '#16a34a' },
    { id: 'purple', name: 'Purple', hex: '#7c3aed' },
    { id: 'orange', name: 'Orange', hex: '#ea580c' },
    { id: 'pink', name: 'Pink', hex: '#db2777' },
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
            <main className='el-page'>
                <header className='el-nav'>
                    <Link href='/' className='el-logo' aria-label='John Leonardo home'>
                        John Leonardo
                    </Link>
                    <nav className='el-nav-links' aria-label='Primary navigation'>
                        <Link href='/apps' className='el-nav-link'>Apps</Link>
                        <Link href='/blog' className='el-nav-link'>Blog</Link>
                        <Link href='/apps/resume' className='el-nav-link'>Resume</Link>
                    </nav>
                    <div className='el-nav-actions'>
                        <Link href='/apps/chat' className='el-nav-link'>Chat</Link>
                        <Link href={`mailto:${strings.EMAIL}`} className='el-btn el-btn-dark el-btn-sm'>
                            Contact
                        </Link>
                    </div>
                </header>

                <section className='el-hero el-hero-page'>
                    <div className='el-hero-inner'>
                        <div className='el-hero-copy'>
                            <h1>Color Gamble</h1>
                            <p className='el-hero-sub'>
                                Pick colors, place your bet, and test your luck.
                            </p>
                        </div>
                    </div>
                </section>

                <section className='el-section el-sentiment'>
                    <div className='el-stat-grid'>
                        <div className='el-stat-card el-balance-card'>
                            <span className='el-stat-label'>Balance</span>
                            <div className='el-stat-value'>
                                ${balance.toLocaleString()}
                            </div>
                        </div>
                        <div className='el-stat-card'>
                            <span className='el-stat-label'>Multiplier</span>
                            <div className='el-stat-value'>
                                {multiplier > 0 ? `${multiplier.toFixed(2)}x` : '—'}
                            </div>
                        </div>
                    </div>

                    <div className='el-chart-block'>
                        <div className='el-chart-title'>
                            <span className='el-chart-title-label'>
                                <CubeIcon aria-hidden='true' />
                                Select Colors
                            </span>
                            <span className='el-chart-pill'>{selectedColors.length}/5 selected</span>
                        </div>
                        <div className='el-gamble-grid'>
                            {COLORS.map(color => (
                                <button
                                    key={color.id}
                                    onClick={() => handleColorSelect(color.id)}
                                    disabled={isSpinning}
                                    className={`el-gamble-color ${selectedColors.includes(color.id) ? 'is-selected' : ''}`}
                                >
                                    <span
                                        className={`el-gamble-dot ${isSpinning ? 'is-spinning' : ''}`}
                                        style={{ backgroundColor: color.hex }}
                                    />
                                    <span className='el-gamble-name'>{color.name}</span>
                                    {selectedColors.includes(color.id) && (
                                        <span className='el-gamble-check'>✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className='el-chart-block'>
                        <div className='el-chart-title'>
                            <span className='el-chart-title-label'>Place Your Bet</span>
                            {multiplier > 0 && (
                                <span className='el-chart-pill'>
                                    potential win ${(betAmount * multiplier).toFixed(0)}
                                </span>
                            )}
                        </div>
                        <div className='el-file-card'>
                            <label className='ecl-copy-label'>Wager Amount</label>
                            <div className='el-money-wrap'>
                                <span className='el-money-symbol'>$</span>
                                <input
                                    type='number'
                                    value={betAmount || ''}
                                    onChange={e => setBetAmount(Number(e.target.value))}
                                    placeholder='0'
                                    disabled={isSpinning}
                                    className='el-textarea el-el-input el-money-input'
                                />
                            </div>
                            <div className='el-bet-presets'>
                                {PRESET_BETS.map(amt => (
                                    <button
                                        key={amt}
                                        onClick={() => setBetAmount(amt)}
                                        disabled={isSpinning || amt > balance}
                                        className={`el-btn el-btn-sm ${betAmount === amt ? 'el-btn-dark' : 'el-btn-light'}`}
                                    >
                                        ${amt}
                                    </button>
                                ))}
                            </div>
                            <div className='el-gamble-actions'>
                                <button
                                    onClick={handleGamble}
                                    disabled={isSpinning || !selectedColors.length || betAmount <= 0}
                                    className='el-btn el-btn-dark el-generate-btn'
                                >
                                    {isSpinning ? 'Rolling...' : 'Place Bet'}
                                </button>
                                <button onClick={resetGame} className='el-btn el-btn-light el-generate-btn'>
                                    <ArrowPathIcon aria-hidden='true' />
                                    Reset
                                </button>
                            </div>
                            {error && <div className='el-error-text el-error-center'>{error}</div>}
                        </div>
                    </div>

                    {result && (
                        <div className='el-chart-block'>
                            <div className={`el-gamble-result ${result.won ? 'is-win' : 'is-loss'}`}>
                                <div className='el-gamble-result-label'>Round Result</div>
                                <div className='el-gamble-result-amount'>
                                    {result.won ? `+$${result.amount.toLocaleString()}` : `-$${result.amount.toLocaleString()}`}
                                </div>
                                <div className='el-gamble-result-color'>
                                    <span>Winning color:</span>
                                    <span className='el-gamble-dot-sm' style={{ backgroundColor: getColorObject(result.color).hex }} />
                                    <span>{getColorObject(result.color).name}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {gameHistory.length > 0 && (
                        <div className='el-chart-block'>
                            <div className='el-chart-title'>
                                <span className='el-chart-title-label'>History</span>
                                <span className='el-chart-pill'>last 10</span>
                            </div>
                            <div className='el-file-card ecl-history'>
                                {gameHistory.map(game => (
                                    <div key={game.id} className='ecl-history-row'>
                                        <span className={`ecl-history-amount ${game.result === 'win' ? 'is-win' : 'is-loss'}`}>
                                            {game.result === 'win' ? '+' : '-'}${game.amount}
                                        </span>
                                        <span className='ecl-history-color'>
                                            <span className='el-gamble-dot-sm' style={{ backgroundColor: getColorObject(game.winningColor).hex }} />
                                            {getColorObject(game.winningColor).name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                <footer className='el-footer'>
                    <div className='el-footer-inner'>
                        <span className='el-footer-logo'>John Leonardo</span>
                        <div className='el-footer-links'>
                            <a href={strings.GITHUB_URL} target='_blank' rel='noreferrer'>GitHub</a>
                            <a href={strings.LINKEDIN_URL} target='_blank' rel='noreferrer'>LinkedIn</a>
                            <a href={`mailto:${strings.EMAIL}`}>{strings.EMAIL}</a>
                        </div>
                        <span className='el-footer-copy'>© 2026. All rights reserved.</span>
                    </div>
                </footer>
            </main>
        </>
    );
}
