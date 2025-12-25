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

    return (
        <>
            <WebVitals />
            <main className='min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4 md:p-8 selection:bg-[var(--color-accent)] selection:text-[var(--color-bg)]'>
                <div className='fixed inset-0 overflow-hidden pointer-events-none'>
                    <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(62,175,124,0.03),transparent_60%)]' />
                    <div className='absolute inset-0' style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                </div>

                <div className={`w-full max-w-6xl h-[85vh] transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className='terminal-window flex flex-col h-full'>
                        <div className='terminal-header'>
                            <div className='terminal-controls'>
                                <div className='terminal-control red' />
                                <div className='terminal-control yellow' />
                                <div className='terminal-control green' />
                            </div>
                            <div className='terminal-title'>johnleonardo — ~/founder-dilution-calc</div>
                        </div>

                        <div className='terminal-split flex-grow overflow-hidden'>
                            {/* Left Pane: Config */}
                            <div className='terminal-pane border-r border-[var(--color-border)] hidden md:flex flex-col gap-8 w-[350px] flex-shrink-0 relative overflow-hidden'>
                                <div className='absolute inset-0 bg-[var(--color-bg)] opacity-95 pointer-events-none' style={{ zIndex: -1 }} />
                                {/* ^ Ensures legibility if backgrounds overlap, standard in my other apps */}

                                <div className='flex flex-col h-full'>
                                    <div className='flex items-center gap-2 mb-6 text-[var(--color-accent)]'>
                                        <span className='terminal-prompt'>➜</span>
                                        <span className='text-sm uppercase tracking-widest font-bold'>Configuration</span>
                                    </div>

                                    <nav className='flex flex-col gap-4 mb-8'>
                                        <Link href='/' className='text-lg hover:text-[var(--color-accent)] transition-colors'>~/home</Link>
                                        <Link href='/apps' className='text-lg hover:text-[var(--color-accent)] transition-colors'>~/apps</Link>
                                    </nav>

                                    <div className='space-y-6 flex-grow overflow-y-auto pr-2 scrollbar-hide'>
                                        <div className='font-mono'>
                                            <span className='text-[var(--color-text)] opacity-40 text-[10px] uppercase tracking-widest block mb-4'>$ set --exit-value</span>
                                            <div className='relative'>
                                                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-accent)] font-bold text-xs'>$</span>
                                                <input
                                                    type='number'
                                                    value={exitValuation}
                                                    onChange={e => setExitValuation(e.target.value)}
                                                    className='w-full bg-black/40 border border-[var(--color-border)] rounded p-2 pl-7 text-[13px] font-mono text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none transition-colors'
                                                />
                                            </div>
                                        </div>

                                        <div className='font-mono'>
                                            <span className='text-[var(--color-text)] opacity-40 text-[10px] uppercase tracking-widest block mb-4'>$ set --initial-equity</span>
                                            <div className='relative'>
                                                <input
                                                    type='number'
                                                    value={initialFoundersOwnership}
                                                    onChange={e => setInitialFoundersOwnership(e.target.value)}
                                                    className='w-full bg-black/40 border border-[var(--color-border)] rounded p-2 pl-4 text-[13px] font-mono text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none transition-colors'
                                                />
                                                <span className='absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-accent)]/50 font-bold text-xs'>%</span>
                                            </div>
                                        </div>

                                        <div className='pt-6 border-t border-[var(--color-border)] font-mono'>
                                            <div className='flex justify-between items-center mb-4'>
                                                <span className='text-[var(--color-text)] opacity-40 text-[10px] uppercase tracking-widest'>Rounds Database</span>
                                                <button
                                                    onClick={loadTypical}
                                                    className='text-[9px] text-[var(--color-accent)] hover:underline uppercase tracking-wider'
                                                >
                                                    [Load_Defaults]
                                                </button>
                                            </div>

                                            <div className='space-y-3 mb-4'>
                                                {rounds.map((round) => (
                                                    <div key={round.id} className='group border border-[var(--color-border)] bg-black/20 p-3 rounded hover:border-[var(--color-accent)]/50 transition-all'>
                                                        <div className='flex justify-between items-start mb-2'>
                                                            <input
                                                                value={round.name}
                                                                onChange={(e) => updateRound(round.id, { name: e.target.value })}
                                                                className='bg-transparent text-[11px] font-bold text-[var(--color-text)] w-24 outline-none border-b border-transparent focus:border-[var(--color-accent)]'
                                                            />
                                                            <button onClick={() => removeRound(round.id)} className='text-red-500/30 hover:text-red-500 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity'>[DEL]</button>
                                                        </div>
                                                        <div className='grid grid-cols-2 gap-2'>
                                                            <div>
                                                                <label className='text-[8px] opacity-30 uppercase block'>Raise</label>
                                                                <input
                                                                    type='number'
                                                                    value={round.amountRaised}
                                                                    onChange={(e) => updateRound(round.id, { amountRaised: Number(e.target.value) })}
                                                                    className='w-full bg-black/30 text-[10px] p-1 rounded border border-transparent focus:border-[var(--color-accent)] outline-none'
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className='text-[8px] opacity-30 uppercase block'>Pre-Val</label>
                                                                <input
                                                                    type='number'
                                                                    value={round.preMoneyValuation}
                                                                    onChange={(e) => updateRound(round.id, { preMoneyValuation: Number(e.target.value) })}
                                                                    className='w-full bg-black/30 text-[10px] p-1 rounded border border-transparent focus:border-[var(--color-accent)] outline-none'
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <button
                                                onClick={addRound}
                                                className='w-full py-2 border border-dashed border-[var(--color-border)] rounded text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all'
                                            >
                                                + Append_Round_Node
                                            </button>
                                        </div>
                                    </div>

                                    <div className='mt-auto pt-4 border-t border-[var(--color-border)] opacity-30 font-mono text-[9px] leading-relaxed uppercase tracking-tighter'>
                                        "Simulates standard SV-style dilution mechanics. Use at own risk."
                                    </div>
                                </div>
                            </div>

                            {/* Main Pane: Calculation Output */}
                            <div className='terminal-pane bg-black/5 flex flex-col p-0 overflow-y-auto w-full'>
                                {rounds.length > 0 ? (
                                    <div className='p-8 md:p-12 max-w-3xl mx-auto w-full space-y-12 animate-reveal'>
                                        {/* Top Headline Stats */}
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                                            <div className='border border-[var(--color-border)] p-6 rounded-lg bg-white/5 group hover:border-[var(--color-accent)]/30 transition-all'>
                                                <span className='text-[10px] font-mono opacity-40 uppercase tracking-widest block mb-2'>FOUNDER_EXIT_PAYOUT</span>
                                                <div className='text-3xl md:text-4xl font-bold text-[var(--color-accent)] font-mono tracking-tight group-hover:scale-105 transition-transform origin-left'>
                                                    {formatCurrency(results.founderExitPayout)}
                                                </div>
                                                <span className='text-[9px] font-mono opacity-30 block mt-2'>* PRE-TAX ESTIMATION</span>
                                            </div>
                                            <div className='border border-[var(--color-border)] p-6 rounded-lg bg-white/5 group hover:border-blue-500/30 transition-all'>
                                                <span className='text-[10px] font-mono opacity-40 uppercase tracking-widest block mb-2'>FINAL_OWNERSHIP</span>
                                                <div className='text-3xl md:text-4xl font-bold text-blue-400 font-mono tracking-tight'>
                                                    {results.founderFinalPct.toFixed(2)}%
                                                </div>
                                                <span className='text-[9px] font-mono opacity-30 block mt-2'>* POST-DILUTION EQUITY</span>
                                            </div>
                                        </div>

                                        {/* Visualization Bar */}
                                        <div className='space-y-4'>
                                            <div className='flex items-center gap-4 text-[var(--color-accent)] opacity-60'>
                                                <div className='h-[1px] flex-grow bg-[var(--color-border)]' />
                                                <span className='text-[10px] font-mono uppercase tracking-widest whitespace-nowrap'>Cap Table Distribution</span>
                                                <div className='h-[1px] flex-grow bg-[var(--color-border)]' />
                                            </div>

                                            <div className='h-8 w-full bg-black/40 rounded flex border border-[var(--color-border)] p-1 overflow-hidden'>
                                                <div className='h-full bg-[var(--color-accent)] transition-all duration-1000' style={{ width: `${results.founderFinalPct}%` }} />
                                                <div className='h-full bg-blue-500 transition-all duration-1000' style={{ width: `${results.investorFinalPct}%` }} />
                                                <div className='h-full bg-purple-500 transition-all duration-1000' style={{ width: `${results.poolFinalPct}%` }} />
                                            </div>

                                            <div className='flex gap-6 justify-center font-mono text-[10px]'>
                                                <div className='flex items-center gap-2'>
                                                    <div className='w-2 h-2 rounded bg-[var(--color-accent)]' />
                                                    <span className='opacity-60'>FOUNDERS ({results.founderFinalPct.toFixed(1)}%)</span>
                                                </div>
                                                <div className='flex items-center gap-2'>
                                                    <div className='w-2 h-2 rounded bg-blue-500' />
                                                    <span className='opacity-60'>INVESTORS ({results.investorFinalPct.toFixed(1)}%)</span>
                                                </div>
                                                <div className='flex items-center gap-2'>
                                                    <div className='w-2 h-2 rounded bg-purple-500' />
                                                    <span className='opacity-60'>POOL ({results.poolFinalPct.toFixed(1)}%)</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Detailed Ledger */}
                                        <div className='space-y-6'>
                                            <div className='flex items-center gap-4 text-[var(--color-accent)] opacity-60'>
                                                <div className='h-[1px] flex-grow bg-[var(--color-border)]' />
                                                <span className='text-[10px] font-mono uppercase tracking-widest whitespace-nowrap'>Round Evolution</span>
                                                <div className='h-[1px] flex-grow bg-[var(--color-border)]' />
                                            </div>

                                            <div className='font-mono space-y-1'>
                                                {results.roundDetails.map((rd, idx) => (
                                                    <div key={rd.id} className='flex justify-between items-center py-3 border-b border-[var(--color-border)] hover:bg-white/5 px-2 transition-colors'>
                                                        <div className='flex flex-col'>
                                                            <span className='text-xs font-bold text-[var(--color-text)] uppercase'>{rd.name}</span>
                                                            <span className='text-[9px] opacity-40 uppercase tracking-wider'>VAL: {formatCurrency(rd.postMoney)}</span>
                                                        </div>
                                                        <div className='text-right'>
                                                            <span className='text-sm text-[var(--color-accent)] font-bold block'>{rd.founderOwnershipAfterRound.toFixed(2)}%</span>
                                                            <span className='text-[9px] opacity-40 uppercase tracking-widest'>Your Equity</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Advisory Note */}
                                        <div className='p-4 border border-yellow-500/20 rounded bg-yellow-500/5 flex gap-4 items-start'>
                                            <span className='text-xl'>😉</span>
                                            <div>
                                                <h4 className='text-[10px] font-mono text-yellow-500 uppercase mb-1 tracking-widest'>Tax Advisory Protocol</h4>
                                                <p className='text-[10px] font-mono text-[var(--color-text-dim)] leading-relaxed opacity-70'>
                                                    REMINDER: GROSS_PAYOUT != NET_PAYOUT. UNCLE_SAM_PROCESS (IRS) CONSUMES RESOURCES. PLAN ACCORDINGLY.
                                                </p>
                                            </div>
                                        </div>

                                    </div>
                                ) : (
                                    <div className='flex flex-col items-center justify-center flex-grow opacity-20'>
                                        <div className='text-4xl font-mono mb-4 text-[var(--color-accent)]'>[AWAITING_ROUNDS]</div>
                                        <div className='text-xs font-mono uppercase tracking-[0.4em]'>Inject financing data to compute dilution</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Console decoration */}
                    <div className='mt-4 flex items-center justify-between text-[10px] font-mono text-[var(--color-text-dim)] opacity-40 uppercase tracking-[0.2em] px-4'>
                        <div className='flex gap-6'>
                            <span>Engine: DilutionSim_v1</span>
                            <span>Model: 2024_STD</span>
                        </div>
                        <span>Status: Active</span>
                    </div>
                </div>
            </main>
        </>
    );
}
