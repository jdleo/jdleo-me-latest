'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { strings } from '../../constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import {
    DevicePhoneMobileIcon,
    PencilSquareIcon,
    DocumentTextIcon,
    ChartPieIcon,
    PlusIcon,
    ArrowPathIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';

interface Round {
    id: string;
    name: string;
    preMoneyValuation: number;
    amountRaised: number;
    optionPoolPercent: number;
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
    const [exitValuation, setExitValuation] = useState<string>('100000000');

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

        let founderExitPayout = 0;
        const investorCommonValue = (investorFinalPct / 100) * exitValue;
        const totalParticipatingPref = rounds.reduce((acc, r) => r.isParticipating ? acc + (r.amountRaised * r.liquidationPreference) : acc, 0);
        const totalNonParticipatingPref = totalLiquidationPreference - totalParticipatingPref;
        let remainingExit = Math.max(0, exitValue - totalParticipatingPref);

        if (investorCommonValue > totalLiquidationPreference) {
            founderExitPayout = (founderFinalPct / 100) * exitValue;
        } else {
            remainingExit = Math.max(0, remainingExit - totalNonParticipatingPref);
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

                <div className={`notion-content ${isLoaded ? 'loaded' : ''}`} style={{ maxWidth: '1200px' }}>
                    <div className='notion-title-block'>
                        <h1 className='notion-title'>Startup Equity Calculator</h1>
                        <div className='notion-subtitle'>Visualize dilution and exit scenarios across multiple funding rounds</div>
                    </div>

                    <div className='notion-divider' />

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                        <div className='notion-card' style={{ padding: '24px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated Founder Payout</span>
                            <div style={{ fontSize: '32px', fontWeight: 700, color: '#059669', marginTop: '8px' }}>
                                {formatCurrency(results.founderExitPayout)}
                            </div>
                        </div>
                        <div className='notion-card' style={{ padding: '24px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Final Ownership</span>
                            <div style={{ fontSize: '32px', fontWeight: 700, color: '#6366f1', marginTop: '8px' }}>
                                {results.founderFinalPct.toFixed(2)}%
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }} className="responsive-grid">
                        <div className='notion-section'>
                            <div className='notion-section-title'>
                                <ChartPieIcon className='notion-section-icon' />
                                Cap Table Scenarios
                            </div>

                            <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#37352f', marginBottom: '8px', display: 'block' }}>Hypothetical Exit Valuation ($)</label>
                                    <input
                                        type='number'
                                        value={exitValuation}
                                        onChange={e => setExitValuation(e.target.value)}
                                        className='notion-input'
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(55, 53, 47, 0.16)' }}
                                    />
                                </div>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#37352f', marginBottom: '8px', display: 'block' }}>Initial Founder Equity (%)</label>
                                    <input
                                        type='number'
                                        value={initialFoundersOwnership}
                                        onChange={e => setInitialFoundersOwnership(e.target.value)}
                                        className='notion-input'
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(55, 53, 47, 0.16)' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                                <button onClick={addRound} className='notion-action-btn notion-action-primary'>
                                    <PlusIcon className='notion-action-icon' />
                                    Add Funding Round
                                </button>
                                <button onClick={loadTypical} className='notion-action-btn'>
                                    <ArrowPathIcon className='notion-action-icon' />
                                    Load Silicon Valley Standards
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {rounds.map((round, idx) => (
                                    <div key={round.id} className='notion-card' style={{ padding: '24px', position: 'relative' }}>
                                        <button
                                            onClick={() => removeRound(round.id)}
                                            style={{ position: 'absolute', top: '16px', right: '16px', padding: '4px', color: 'rgba(55, 53, 47, 0.3)', cursor: 'pointer', border: 'none', background: 'transparent' }}
                                        >
                                            <TrashIcon style={{ width: '16px', height: '16px' }} />
                                        </button>

                                        <div style={{ marginBottom: '16px' }}>
                                            <input
                                                value={round.name}
                                                onChange={e => updateRound(round.id, { name: e.target.value })}
                                                className='notion-input'
                                                style={{ fontSize: '16px', fontWeight: 600, border: 'none', background: 'transparent', padding: 0, width: '100%', color: '#37352f' }}
                                                placeholder='Round Name'
                                            />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                                            <div>
                                                <label style={{ fontSize: '10px', color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', fontWeight: 600 }}>Amount Raised</label>
                                                <input
                                                    type='number'
                                                    value={round.amountRaised}
                                                    onChange={e => updateRound(round.id, { amountRaised: Number(e.target.value) })}
                                                    className='notion-input'
                                                    style={{ width: '100%', marginTop: '4px', padding: '8px', fontSize: '13px', borderRadius: '4px', border: '1px solid rgba(55, 53, 47, 0.16)' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '10px', color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', fontWeight: 600 }}>Pre-Money Val</label>
                                                <input
                                                    type='number'
                                                    value={round.preMoneyValuation}
                                                    onChange={e => updateRound(round.id, { preMoneyValuation: Number(e.target.value) })}
                                                    className='notion-input'
                                                    style={{ width: '100%', marginTop: '4px', padding: '8px', fontSize: '13px', borderRadius: '4px', border: '1px solid rgba(55, 53, 47, 0.16)' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '10px', color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', fontWeight: 600 }}>Option Pool %</label>
                                                <input
                                                    type='number'
                                                    value={round.optionPoolPercent}
                                                    onChange={e => updateRound(round.id, { optionPoolPercent: Number(e.target.value) })}
                                                    className='notion-input'
                                                    style={{ width: '100%', marginTop: '4px', padding: '8px', fontSize: '13px', borderRadius: '4px', border: '1px solid rgba(55, 53, 47, 0.16)' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '10px', color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', fontWeight: 600 }}>Liq. Pref (x)</label>
                                                <input
                                                    type='number'
                                                    value={round.liquidationPreference}
                                                    onChange={e => updateRound(round.id, { liquidationPreference: Number(e.target.value) })}
                                                    className='notion-input'
                                                    style={{ width: '100%', marginTop: '4px', padding: '8px', fontSize: '13px', borderRadius: '4px', border: '1px solid rgba(55, 53, 47, 0.16)' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {rounds.length === 0 && (
                                    <div style={{ padding: '32px', textAlign: 'center', border: '2px dashed rgba(55, 53, 47, 0.16)', borderRadius: '8px', color: 'rgba(55, 53, 47, 0.5)' }}>
                                        No rounds added. Start by adding a funding round.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className='notion-section' style={{ position: 'sticky', top: '24px' }}>
                            <div className='notion-section-title'>
                                <ChartPieIcon className='notion-section-icon' />
                                Analysis
                            </div>

                            <div className='notion-card' style={{ padding: '24px', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Ownership Split</h3>
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ height: '24px', width: '100%', backgroundColor: 'rgba(55, 53, 47, 0.06)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                                        <div style={{ width: `${results.founderFinalPct}%`, backgroundColor: '#6366f1', height: '100%' }} />
                                        <div style={{ width: `${results.investorFinalPct}%`, backgroundColor: '#3b82f6', height: '100%' }} />
                                        <div style={{ width: `${results.poolFinalPct}%`, backgroundColor: '#94a3b8', height: '100%' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366f1' }} />
                                            <span>Founders</span>
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{results.founderFinalPct.toFixed(1)}%</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                                            <span>Investors</span>
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{results.investorFinalPct.toFixed(1)}%</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#94a3b8' }} />
                                            <span>Option Pool</span>
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{results.poolFinalPct.toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className='notion-card' style={{ padding: '24px' }}>
                                <h3 style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Dilution Ledger</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {results.roundDetails.map(rd => (
                                        <div key={rd.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', paddingBottom: '8px', borderBottom: '1px solid rgba(55, 53, 47, 0.06)' }}>
                                            <span style={{ fontWeight: 500 }}>{rd.name}</span>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 700, color: '#37352f' }}>{rd.founderOwnershipAfterRound.toFixed(1)}%</div>
                                                <div style={{ fontSize: '10px', color: 'rgba(55, 53, 47, 0.4)' }}>You Own</div>
                                            </div>
                                        </div>
                                    ))}
                                    {results.roundDetails.length === 0 && (
                                        <span style={{ fontSize: '12px', color: 'rgba(55, 53, 47, 0.5)', fontStyle: 'italic' }}>No rounds yet</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer className='notion-footer'>
                        © 2026 {strings.NAME}
                    </footer>
                </div>
            </main>
        </>
    );
}
