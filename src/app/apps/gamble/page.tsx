'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactConfetti from 'react-confetti';
import { strings } from '../../constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import {
    DevicePhoneMobileIcon,
    PencilSquareIcon,
    DocumentTextIcon,
    CubeIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';

type Color = {
    id: string;
    name: string;
    gradient: string;
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
    { id: 'red', name: 'Red', gradient: 'from-red-400 to-red-600', hex: '#F87171' },
    { id: 'blue', name: 'Blue', gradient: 'from-blue-400 to-blue-600', hex: '#60A5FA' },
    { id: 'green', name: 'Green', gradient: 'from-green-400 to-green-600', hex: '#4ADE80' },
    { id: 'purple', name: 'Purple', gradient: 'from-purple-400 to-purple-600', hex: '#C084FC' },
    { id: 'orange', name: 'Orange', gradient: 'from-orange-400 to-orange-600', hex: '#FB923C' },
    { id: 'pink', name: 'Pink', gradient: 'from-pink-400 to-pink-600', hex: '#F472B6' },
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

                <div className={`notion-content ${isLoaded ? 'loaded' : ''}`} style={{ maxWidth: '900px' }}>
                    <div className='notion-title-block'>
                        <h1 className='notion-title'>Color Gamble</h1>
                        <div className='notion-subtitle'>Pick colors, place your bet, and test your luck</div>
                    </div>

                    <div className='notion-divider' />

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                        <div className='notion-card' style={{ padding: '20px', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white' }}>
                            <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>Balance</span>
                            <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>${balance.toLocaleString()}</div>
                        </div>
                        <div className='notion-card' style={{ padding: '20px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Multiplier</span>
                            <div style={{ fontSize: '28px', fontWeight: 700, color: '#6366f1', marginTop: '4px' }}>
                                {multiplier > 0 ? `${multiplier.toFixed(2)}x` : '—'}
                            </div>
                        </div>
                    </div>

                    <div className='notion-section'>
                        <div className='notion-section-title'>
                            <CubeIcon className='notion-section-icon' />
                            Select Colors
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginTop: '16px' }}>
                            {COLORS.map(color => (
                                <button
                                    key={color.id}
                                    onClick={() => handleColorSelect(color.id)}
                                    disabled={isSpinning}
                                    style={{
                                        position: 'relative',
                                        height: '120px',
                                        borderRadius: '12px',
                                        border: selectedColors.includes(color.id) ? '3px solid #6366f1' : '1px solid rgba(55, 53, 47, 0.09)',
                                        backgroundColor: 'white',
                                        cursor: isSpinning ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s ease',
                                        transform: selectedColors.includes(color.id) ? 'scale(1.02)' : 'scale(1)',
                                        boxShadow: selectedColors.includes(color.id) ? '0 4px 12px rgba(99, 102, 241, 0.25)' : 'none'
                                    }}
                                >
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        backgroundColor: color.hex,
                                        transition: 'transform 0.3s ease',
                                        animation: isSpinning ? 'spin 0.5s linear infinite' : 'none'
                                    }} />
                                    <span style={{
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                        color: selectedColors.includes(color.id) ? '#6366f1' : 'rgba(55, 53, 47, 0.5)'
                                    }}>
                                        {color.name}
                                    </span>
                                    {selectedColors.includes(color.id) && (
                                        <div style={{ position: 'absolute', top: '8px', right: '8px', color: '#6366f1' }}>
                                            ✓
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className='notion-divider' />

                    <div className='notion-card' style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Wager Amount</span>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#6366f1' }}>
                                        {multiplier > 0 ? `Potential Win: $${(betAmount * multiplier).toFixed(0)}` : ''}
                                    </span>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(55, 53, 47, 0.5)', fontWeight: 600 }}>$</span>
                                    <input
                                        type='number'
                                        value={betAmount || ''}
                                        onChange={e => setBetAmount(Number(e.target.value))}
                                        placeholder='0'
                                        disabled={isSpinning}
                                        className='notion-input'
                                        style={{ paddingLeft: '28px' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {PRESET_BETS.map(amt => (
                                    <button
                                        key={amt}
                                        onClick={() => setBetAmount(amt)}
                                        disabled={isSpinning || amt > balance}
                                        className={betAmount === amt ? 'notion-action-btn notion-action-primary' : 'notion-action-btn'}
                                        style={{ padding: '8px 16px' }}
                                    >
                                        ${amt}
                                    </button>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <button
                                    onClick={handleGamble}
                                    disabled={isSpinning || !selectedColors.length || betAmount <= 0}
                                    className='notion-action-btn notion-action-primary'
                                    style={{
                                        flex: 1,
                                        padding: '16px',
                                        justifyContent: 'center',
                                        backgroundColor: isSpinning ? '#facc15' : undefined,
                                        animation: isSpinning ? 'pulse 1s infinite' : 'none'
                                    }}
                                >
                                    {isSpinning ? 'Rolling...' : 'Place Bet'}
                                </button>
                                <button onClick={resetGame} className='notion-action-btn' style={{ padding: '16px' }}>
                                    <ArrowPathIcon className='notion-action-icon' />
                                    Reset
                                </button>
                            </div>

                            {error && (
                                <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: '#dc2626', fontSize: '13px', fontWeight: 500, textAlign: 'center' }}>
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>

                    {result && (
                        <>
                            <div className='notion-divider' />
                            <div className='notion-card' style={{
                                padding: '24px',
                                textAlign: 'center',
                                border: result.won ? '2px solid #059669' : '2px solid #dc2626',
                                backgroundColor: result.won ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)'
                            }}>
                                <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(55, 53, 47, 0.5)', marginBottom: '8px' }}>Round Result</div>
                                <div style={{ fontSize: '32px', fontWeight: 800, color: result.won ? '#059669' : '#dc2626', marginBottom: '12px' }}>
                                    {result.won ? `+$${result.amount}` : `-$${result.amount}`}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Winning Color:</span>
                                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: getColorObject(result.color).hex }} />
                                    <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>{getColorObject(result.color).name}</span>
                                </div>
                            </div>
                        </>
                    )}

                    {gameHistory.length > 0 && (
                        <>
                            <div className='notion-divider' />
                            <div className='notion-section'>
                                <div className='notion-section-title'>
                                    <DocumentTextIcon className='notion-section-icon' />
                                    History
                                </div>
                                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {gameHistory.map(game => (
                                        <div key={game.id} className='notion-card' style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <span style={{ fontSize: '14px', fontWeight: 600, color: game.result === 'win' ? '#059669' : '#dc2626' }}>
                                                    {game.result === 'win' ? '+' : '-'}${game.amount}
                                                </span>
                                                <span style={{ fontSize: '11px', color: 'rgba(55, 53, 47, 0.5)', marginLeft: '8px', textTransform: 'uppercase' }}>
                                                    {getColorObject(game.winningColor).name}
                                                </span>
                                            </div>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getColorObject(game.winningColor).hex }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <footer className='notion-footer'>
                        © 2026 {strings.NAME}
                    </footer>
                </div>
            </main>
        </>
    );
}
