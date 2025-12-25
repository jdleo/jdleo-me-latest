'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { WebVitals } from '@/components/SEO/WebVitals';

interface Round {
    id: string;
    name: string;
    preMoneyValuation: number;
    amountRaised: number;
    optionPoolPercent: number; // Percent of post-money to top up
    stockType: 'Preferred' | 'Common';
    isParticipating: boolean;
    liquidationPreference: number;
}

const TYPICAL_2024: Round[] = [
    {
        id: '1',
        name: 'Pre-Seed',
        preMoneyValuation: 8000000,
        amountRaised: 1000000,
        optionPoolPercent: 10,
        stockType: 'Preferred',
        isParticipating: false,
        liquidationPreference: 1,
    },
    {
        id: '2',
        name: 'Seed',
        preMoneyValuation: 20000000,
        amountRaised: 4000000,
        optionPoolPercent: 5,
        stockType: 'Preferred',
        isParticipating: false,
        liquidationPreference: 1,
    },
    {
        id: '3',
        name: 'Series A',
        preMoneyValuation: 80000000,
        amountRaised: 15000000,
        optionPoolPercent: 5,
        stockType: 'Preferred',
        isParticipating: false,
        liquidationPreference: 1,
    }
];

export default function DilutionCalculator() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [rounds, setRounds] = useState<Round[]>([]);
    const [initialFoundersOwnership, setInitialFoundersOwnership] = useState<string>('100');
    const [exitValuation, setExitValuation] = useState<string>('100000000'); // 100M default exit

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const addRound = () => {
        const newRound: Round = {
            id: Math.random().toString(36).substr(2, 9),
            name: `Round ${rounds.length + 1}`,
            preMoneyValuation: 10000000,
            amountRaised: 2000000,
            optionPoolPercent: 10,
            stockType: 'Preferred',
            isParticipating: false,
            liquidationPreference: 1,
        };
        setRounds([...rounds, newRound]);
    };

    const removeRound = (id: string) => {
        setRounds(rounds.filter(r => r.id !== id));
    };

    const updateRound = (id: string, updates: Partial<Round>) => {
        setRounds(rounds.map(r => r.id === id ? { ...r, ...updates } : r));
    };

    const loadTypical = () => {
        setRounds([...TYPICAL_2024]);
    };

    const results = useMemo(() => {
        const initialEquity = parseFloat(initialFoundersOwnership) || 0;
        const exitValue = parseFloat(exitValuation) || 0;

        let currentFounder = initialEquity / 100;
        let currentPool = 0.0;
        let currentInvestors = 0.0;
        let totalLiquidationPreference = 0;

        const roundDetails = rounds.map(round => {
            const postMoney = round.preMoneyValuation + round.amountRaised;
            const investorEquity = round.amountRaised / postMoney;
            const poolEquity = round.optionPoolPercent / 100;

            // Dilution factor (everyone except the new round gets diluted)
            const dilutionFactor = 1 - investorEquity - poolEquity;

            currentFounder *= dilutionFactor;
            currentPool = (currentPool * dilutionFactor) + poolEquity;
            currentInvestors = (currentInvestors * dilutionFactor) + investorEquity;

            if (round.stockType === 'Preferred') {
                totalLiquidationPreference += round.amountRaised * round.liquidationPreference;
            }

            return {
                ...round,
                postMoney,
                founderOwnershipAfterRound: currentFounder * 100,
                poolOwnershipAfterRound: currentPool * 100,
                investorOwnershipAfterRound: currentInvestors * 100
            };
        });

        const founderFinalPct = currentFounder * 100;
        const poolFinalPct = currentPool * 100;
        const investorFinalPct = currentInvestors * 100;

        // Exit Logic
        let founderExitPayout = 0;

        // Simplified multi-round liquidation preference
        const investorPref = totalLiquidationPreference;
        const investorCommonValue = (investorFinalPct / 100) * exitValue;

        const totalParticipatingPref = rounds.reduce((acc, r) => r.isParticipating ? acc + (r.amountRaised * r.liquidationPreference) : acc, 0);
        const totalNonParticipatingPref = totalLiquidationPreference - totalParticipatingPref;

        let remainingExit = Math.max(0, exitValue - totalParticipatingPref);

        if (investorCommonValue > totalLiquidationPreference) {
            founderExitPayout = (founderFinalPct / 100) * exitValue;
        } else {
            remainingExit = Math.max(0, remainingExit - totalNonParticipatingPref);
            // Actually, let's just do: Remaining * (FounderPct / (1 - NonParticipatingInvestorPct))
            const commonTotalPct = founderFinalPct + poolFinalPct;
            if (commonTotalPct > 0) {
                founderExitPayout = remainingExit * (currentFounder / (1 - (totalNonParticipatingPref / (exitValue || 1))));
            }
        }
        founderExitPayout = Math.min(founderExitPayout, exitValue);

        return {
            founderFinalPct,
            poolFinalPct,
            investorFinalPct,
            founderExitPayout,
            roundDetails
        };
    }, [rounds, initialFoundersOwnership, exitValuation]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                        <span>Config</span>
                        <span className='text-[10px]'>▼</span>
                    </button>
                </header>

                {/* Left Sidebar (Desktop) - Global Settings */}
                <aside className='hidden md:flex flex-col w-80 h-full border-r border-[var(--border-light)] bg-white/50 backdrop-blur-xl z-20'>
                    <div className='p-6 border-b border-[var(--border-light)]'>
                        <div className='flex items-center gap-3 mb-6'>
                            <div className='w-3 h-3 rounded-full bg-[var(--purple-4)]' />
                            <span className='font-bold uppercase tracking-widest text-sm text-[var(--fg-4)]'>Dilution Engine</span>
                        </div>
                        <nav className='flex flex-col gap-2'>
                            <Link href='/apps' className='text-xs font-bold uppercase tracking-wider text-muted hover:text-[var(--purple-4)] transition-colors flex items-center gap-2'>
                                <span>←</span> Back to Apps
                            </Link>
                        </nav>
                    </div>

                    <div className='flex-grow overflow-y-auto p-6 space-y-8'>
                        <div>
                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Global Scenarios</h3>
                            <div className='space-y-4'>
                                <div className='space-y-2'>
                                    <label className='text-xs font-bold text-[var(--fg-4)]'>Exit Valuation ($)</label>
                                    <input
                                        type='number'
                                        value={exitValuation}
                                        onChange={e => setExitValuation(e.target.value)}
                                        className='w-full bg-white border border-[var(--border-light)] rounded-xl p-3 text-sm text-[var(--fg-4)] focus:border-[var(--purple-4)] focus:ring-2 focus:ring-[var(--purple-1)] outline-none transition-all'
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <label className='text-xs font-bold text-[var(--fg-4)]'>Initial Founder Equity (%)</label>
                                    <div className='relative'>
                                        <input
                                            type='number'
                                            value={initialFoundersOwnership}
                                            onChange={e => setInitialFoundersOwnership(e.target.value)}
                                            className='w-full bg-white border border-[var(--border-light)] rounded-xl p-3 text-sm text-[var(--fg-4)] focus:border-[var(--purple-4)] focus:ring-2 focus:ring-[var(--purple-1)] outline-none transition-all'
                                        />
                                        <div className='absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xs font-bold'>%</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Actions</h3>
                            <div className='space-y-3'>
                                <button
                                    onClick={addRound}
                                    className='w-full py-3 bg-[var(--fg-4)] hover:bg-[var(--purple-4)] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-lg'
                                >
                                    + Add Round
                                </button>
                                <button
                                    onClick={loadTypical}
                                    className='w-full py-3 bg-white border border-[var(--border-light)] hover:border-[var(--purple-4)] text-[var(--fg-4)] hover:text-[var(--purple-4)] font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm hover:shadow-md'
                                >
                                    Load Defaults
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className='flex-grow flex flex-col h-full relative bg-[#fafbff] overflow-hidden'>
                    {/* Floating decorations */}
                    <div className='absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--purple-1)] opacity-30 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2' />

                    <div className='flex-grow overflow-y-auto p-4 md:p-8 scrollbar-hide z-10'>
                        <div className='max-w-6xl mx-auto space-y-8 animate-fade-in-up'>

                            {/* Top Summary Cards */}
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8'>
                                <div className='bg-white p-6 rounded-2xl border border-[var(--border-light)] shadow-sm relative overflow-hidden group hover:border-[var(--purple-4)] transition-colors'>
                                    <div className='relative z-10'>
                                        <span className='text-[10px] font-bold uppercase tracking-wider text-muted block mb-2'>Projected Founder Payout</span>
                                        <div className='text-3xl md:text-5xl font-black text-[var(--purple-4)] tracking-tight'>
                                            {formatCurrency(results.founderExitPayout)}
                                        </div>
                                    </div>
                                    <div className='absolute right-0 bottom-0 opacity-5 transform translate-x-1/3 translate-y-1/3 text-[150px] leading-none text-[var(--purple-4)] group-hover:scale-110 transition-transform'>$</div>
                                </div>
                                <div className='bg-white p-6 rounded-2xl border border-[var(--border-light)] shadow-sm relative overflow-hidden group hover:border-blue-500 transition-colors'>
                                    <div className='relative z-10'>
                                        <span className='text-[10px] font-bold uppercase tracking-wider text-muted block mb-2'>Final Ownership</span>
                                        <div className='text-3xl md:text-5xl font-black text-blue-500 tracking-tight'>
                                            {results.founderFinalPct.toFixed(2)}%
                                        </div>
                                    </div>
                                    <div className='absolute right-0 bottom-0 opacity-5 transform translate-x-1/4 translate-y-1/4 text-[150px] leading-none text-blue-500 group-hover:scale-110 transition-transform'>%</div>
                                </div>
                            </div>

                            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                                {/* Left Column: Rounds Editor */}
                                <div className='lg:col-span-2 space-y-6'>
                                    <h2 className='text-lg font-bold text-[var(--fg-4)] flex items-center gap-2'>
                                        <span className='w-2 h-2 rounded-full bg-[var(--purple-4)]' />
                                        Investment Rounds
                                    </h2>

                                    {rounds.length === 0 ? (
                                        <div className='bg-white rounded-2xl border border-dashed border-[var(--border-light)] p-12 text-center'>
                                            <div className='w-16 h-16 bg-[var(--bg-2)] rounded-full flex items-center justify-center text-3xl mx-auto mb-4 text-muted'>∅</div>
                                            <h3 className='font-bold text-[var(--fg-4)] mb-2'>No Rounds Defined</h3>
                                            <p className='text-sm text-muted mb-6'>Add a financing round to calculate dilution effects.</p>
                                            <button onClick={addRound} className='px-6 py-2 bg-[var(--purple-4)] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md hover:bg-[var(--purple-4)]/90'>
                                                Add First Round
                                            </button>
                                        </div>
                                    ) : (
                                        <div className='space-y-4'>
                                            {rounds.map((round) => (
                                                <div key={round.id} className='bg-white rounded-2xl border border-[var(--border-light)] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden'>
                                                    {/* Header */}
                                                    <div className='flex justify-between items-start mb-6'>
                                                        <div className='flex-grow mr-4'>
                                                            <label className='text-[10px] font-bold uppercase tracking-wider text-muted block mb-1'>Round Name</label>
                                                            <input
                                                                value={round.name}
                                                                onChange={(e) => updateRound(round.id, { name: e.target.value })}
                                                                className='text-lg font-bold text-[var(--fg-4)] bg-transparent border-b border-transparent hover:border-[var(--border-light)] focus:border-[var(--purple-4)] outline-none w-full transition-colors'
                                                                placeholder='Series Name'
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => removeRound(round.id)}
                                                            className='w-8 h-8 rounded-full bg-[var(--bg-2)] text-muted hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors'
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>

                                                    {/* Inputs Grid */}
                                                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                                                        <div>
                                                            <label className='text-[10px] font-bold text-muted uppercase tracking-wider block mb-2'>Amount Raised</label>
                                                            <input
                                                                type='number'
                                                                value={round.amountRaised}
                                                                onChange={(e) => updateRound(round.id, { amountRaised: Number(e.target.value) })}
                                                                className='w-full bg-[var(--bg-2)] border border-[var(--border-light)] rounded-lg p-2 text-sm text-[var(--fg-4)] focus:border-[var(--purple-4)] outline-none'
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className='text-[10px] font-bold text-muted uppercase tracking-wider block mb-2'>Pre-Money Val</label>
                                                            <input
                                                                type='number'
                                                                value={round.preMoneyValuation}
                                                                onChange={(e) => updateRound(round.id, { preMoneyValuation: Number(e.target.value) })}
                                                                className='w-full bg-[var(--bg-2)] border border-[var(--border-light)] rounded-lg p-2 text-sm text-[var(--fg-4)] focus:border-[var(--purple-4)] outline-none'
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className='text-[10px] font-bold text-muted uppercase tracking-wider block mb-2'>Option Pool %</label>
                                                            <input
                                                                type='number'
                                                                value={round.optionPoolPercent}
                                                                onChange={(e) => updateRound(round.id, { optionPoolPercent: Number(e.target.value) })}
                                                                className='w-full bg-[var(--bg-2)] border border-[var(--border-light)] rounded-lg p-2 text-sm text-[var(--fg-4)] focus:border-[var(--purple-4)] outline-none'
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className='text-[10px] font-bold text-muted uppercase tracking-wider block mb-2'>Liq. Pref</label>
                                                            <input
                                                                type='number'
                                                                value={round.liquidationPreference}
                                                                onChange={(e) => updateRound(round.id, { liquidationPreference: Number(e.target.value) })}
                                                                className='w-full bg-[var(--bg-2)] border border-[var(--border-light)] rounded-lg p-2 text-sm text-[var(--fg-4)] focus:border-[var(--purple-4)] outline-none'
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={addRound}
                                                className='w-full py-4 border-2 border-dashed border-[var(--border-light)] rounded-2xl text-[var(--fg-4)] font-bold text-sm hover:border-[var(--purple-4)] hover:text-[var(--purple-4)] hover:bg-[var(--purple-1)]/10 transition-all flex items-center justify-center gap-2'
                                            >
                                                <span>+</span> Add Another Round
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Cap Table Visualization */}
                                <div className='space-y-6'>
                                    <h2 className='text-lg font-bold text-[var(--fg-4)] flex items-center gap-2'>
                                        <span className='w-2 h-2 rounded-full bg-blue-500' />
                                        Cap Table Analysis
                                    </h2>

                                    <div className='bg-white p-6 rounded-2xl border border-[var(--border-light)] shadow-sm sticky top-6'>
                                        <div className='mb-6'>
                                            <h3 className='text-xs font-bold uppercase tracking-wider text-muted mb-4'>Ownership Distribution</h3>
                                            <div className='h-4 w-full bg-[var(--bg-2)] rounded-full overflow-hidden flex mb-3'>
                                                <div className='h-full bg-[var(--purple-4)]' style={{ width: `${results.founderFinalPct}%` }} title='Founders' />
                                                <div className='h-full bg-blue-500' style={{ width: `${results.investorFinalPct}%` }} title='Investors' />
                                                <div className='h-full bg-gray-400' style={{ width: `${results.poolFinalPct}%` }} title='Option Pool' />
                                            </div>
                                            <div className='flex gap-4 flex-wrap'>
                                                <div className='flex items-center gap-2 text-xs'>
                                                    <div className='w-2 h-2 rounded-full bg-[var(--purple-4)]' />
                                                    <span className='text-[var(--fg-4)] font-medium'>Founders ({results.founderFinalPct.toFixed(1)}%)</span>
                                                </div>
                                                <div className='flex items-center gap-2 text-xs'>
                                                    <div className='w-2 h-2 rounded-full bg-blue-500' />
                                                    <span className='text-[var(--fg-4)] font-medium'>Investors ({results.investorFinalPct.toFixed(1)}%)</span>
                                                </div>
                                                <div className='flex items-center gap-2 text-xs'>
                                                    <div className='w-2 h-2 rounded-full bg-gray-400' />
                                                    <span className='text-[var(--fg-4)] font-medium'>Pool ({results.poolFinalPct.toFixed(1)}%)</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className='pt-6 border-t border-[var(--border-light)]'>
                                            <h3 className='text-xs font-bold uppercase tracking-wider text-muted mb-4'>Round Ledger</h3>
                                            <div className='space-y-4'>
                                                {results.roundDetails.map((rd) => (
                                                    <div key={rd.id} className='flex justify-between items-center text-sm'>
                                                        <span className='font-bold text-[var(--fg-4)]'>{rd.name}</span>
                                                        <div className='text-right'>
                                                            <span className='block font-bold text-[var(--purple-4)]'>{rd.founderOwnershipAfterRound.toFixed(2)}%</span>
                                                            <span className='text-[10px] text-muted uppercase tracking-wider'>Your Share</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {results.roundDetails.length === 0 && (
                                                    <span className='text-sm text-muted italic'>No active rounds</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className='fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 md:hidden' onClick={() => setIsMobileMenuOpen(false)}>
                        <div className='w-full max-w-sm bg-white rounded-2xl shadow-2xl animate-slide-up overflow-hidden border border-[var(--border-light)]' onClick={e => e.stopPropagation()}>
                            <div className='p-4 border-b border-[var(--border-light)] flex justify-between items-center bg-[var(--bg-2)]'>
                                <span className='text-xs font-bold uppercase tracking-widest text-[var(--fg-4)]'>Configuration</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className='w-6 h-6 rounded-full bg-white border border-[var(--border-light)] flex items-center justify-center text-muted'>✕</button>
                            </div>
                            <div className='p-4 space-y-6'>
                                <div className='space-y-4'>
                                    <div className='space-y-2'>
                                        <label className='text-xs font-bold text-[var(--fg-4)]'>Exit Valuation ($)</label>
                                        <input
                                            type='number'
                                            value={exitValuation}
                                            onChange={e => setExitValuation(e.target.value)}
                                            className='w-full bg-[var(--bg-2)] border border-[var(--border-light)] rounded-xl p-3 text-sm text-[var(--fg-4)] focus:border-[var(--purple-4)] outline-none'
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <label className='text-xs font-bold text-[var(--fg-4)]'>Initial Founder Equity (%)</label>
                                        <input
                                            type='number'
                                            value={initialFoundersOwnership}
                                            onChange={e => setInitialFoundersOwnership(e.target.value)}
                                            className='w-full bg-[var(--bg-2)] border border-[var(--border-light)] rounded-xl p-3 text-sm text-[var(--fg-4)] focus:border-[var(--purple-4)] outline-none'
                                        />
                                    </div>
                                </div>
                                <div className='space-y-3 pt-4 border-t border-[var(--border-light)]'>
                                    <button
                                        onClick={() => { addRound(); setIsMobileMenuOpen(false); }}
                                        className='w-full py-3 bg-[var(--fg-4)] text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-md'
                                    >
                                        + Add Round
                                    </button>
                                    <button
                                        onClick={() => { loadTypical(); setIsMobileMenuOpen(false); }}
                                        className='w-full py-3 bg-white border border-[var(--border-light)] text-[var(--fg-4)] font-bold text-xs uppercase tracking-widest rounded-xl shadow-sm'
                                    >
                                        Load Defaults
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
