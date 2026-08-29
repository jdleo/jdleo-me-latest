'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { strings } from '../../constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import {
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
                            <h1>Founder Dilution</h1>
                            <p className='el-hero-sub'>
                                Visualize dilution and exit scenarios across multiple funding rounds.
                            </p>
                        </div>
                    </div>
                </section>

                <section className='el-section el-sentiment'>
                    <div className='el-stat-grid'>
                        <div className='el-stat-card'>
                            <span className='el-stat-label'>Estimated Founder Payout</span>
                            <div className='el-stat-value el-stat-positive'>
                                {formatCurrency(results.founderExitPayout)}
                            </div>
                        </div>
                        <div className='el-stat-card'>
                            <span className='el-stat-label'>Final Founder Ownership</span>
                            <div className='el-stat-value'>
                                {results.founderFinalPct.toFixed(2)}%
                            </div>
                        </div>
                    </div>

                    <div className='ecl-dilution-grid'>
                        <div>
                            <div className='el-chart-block' style={{ marginTop: 0 }}>
                                <div className='el-chart-title'>
                                    <span className='el-chart-title-label'>Scenario Inputs</span>
                                </div>
                                <div className='el-file-card'>
                                    <div className='ecl-dilution-inputs'>
                                        <div>
                                            <label className='ecl-copy-label'>Hypothetical Exit Valuation ($)</label>
                                            <input
                                                type='number'
                                                value={exitValuation}
                                                onChange={e => setExitValuation(e.target.value)}
                                                className='el-textarea el-el-input'
                                            />
                                        </div>
                                        <div>
                                            <label className='ecl-copy-label'>Initial Founder Equity (%)</label>
                                            <input
                                                type='number'
                                                value={initialFoundersOwnership}
                                                onChange={e => setInitialFoundersOwnership(e.target.value)}
                                                className='el-textarea el-el-input'
                                            />
                                        </div>
                                    </div>
                                    <div className='el-serialize-row'>
                                        <button onClick={addRound} className='el-btn el-btn-dark el-btn-sm'>
                                            <PlusIcon aria-hidden='true' />
                                            Add Funding Round
                                        </button>
                                        <button onClick={loadTypical} className='el-btn el-btn-light el-btn-sm'>
                                            <ArrowPathIcon aria-hidden='true' />
                                            Load Silicon Valley Standards
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className='el-chart-block'>
                                <div className='el-chart-title'>
                                    <span className='el-chart-title-label'>Funding Rounds</span>
                                    <span className='el-chart-pill'>{rounds.length} rounds</span>
                                </div>
                                <div className='ecl-round-list'>
                                    {rounds.map((round) => (
                                        <div key={round.id} className='el-file-card ecl-round-card'>
                                            <button
                                                onClick={() => removeRound(round.id)}
                                                className='ecl-round-delete'
                                                aria-label={`Remove ${round.name}`}
                                            >
                                                <TrashIcon aria-hidden='true' />
                                            </button>
                                            <input
                                                value={round.name}
                                                onChange={e => updateRound(round.id, { name: e.target.value })}
                                                className='ecl-round-name'
                                                placeholder='Round Name'
                                            />
                                            <div className='ecl-round-inputs'>
                                                <div>
                                                    <label className='ecl-copy-label'>Amount Raised</label>
                                                    <input
                                                        type='number'
                                                        value={round.amountRaised}
                                                        onChange={e => updateRound(round.id, { amountRaised: Number(e.target.value) })}
                                                        className='el-textarea el-el-input ecl-round-input'
                                                    />
                                                </div>
                                                <div>
                                                    <label className='ecl-copy-label'>Pre-Money Val</label>
                                                    <input
                                                        type='number'
                                                        value={round.preMoneyValuation}
                                                        onChange={e => updateRound(round.id, { preMoneyValuation: Number(e.target.value) })}
                                                        className='el-textarea el-el-input ecl-round-input'
                                                    />
                                                </div>
                                                <div>
                                                    <label className='ecl-copy-label'>Option Pool %</label>
                                                    <input
                                                        type='number'
                                                        value={round.optionPoolPercent}
                                                        onChange={e => updateRound(round.id, { optionPoolPercent: Number(e.target.value) })}
                                                        className='el-textarea el-el-input ecl-round-input'
                                                    />
                                                </div>
                                                <div>
                                                    <label className='ecl-copy-label'>Liq. Pref (x)</label>
                                                    <input
                                                        type='number'
                                                        value={round.liquidationPreference}
                                                        onChange={e => updateRound(round.id, { liquidationPreference: Number(e.target.value) })}
                                                        className='el-textarea el-el-input ecl-round-input'
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {rounds.length === 0 && (
                                        <div className='ecl-dilution-empty'>
                                            No rounds added. Start by adding a funding round.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className='ecl-dilution-analysis'>
                            <div className='el-chart-block' style={{ marginTop: 0 }}>
                                <div className='el-chart-title'>
                                    <span className='el-chart-title-label'>
                                        <ChartPieIcon aria-hidden='true' />
                                        Ownership Split
                                    </span>
                                </div>
                                <div className='el-file-card'>
                                    <div className='ecl-split-bar'>
                                        <div className='ecl-split-founders' style={{ width: `${results.founderFinalPct}%` }} />
                                        <div className='ecl-split-investors' style={{ width: `${results.investorFinalPct}%` }} />
                                        <div className='ecl-split-pool' style={{ width: `${results.poolFinalPct}%` }} />
                                    </div>
                                    <div className='ecl-split-legend'>
                                        <div className='ecl-split-row'>
                                            <span className='ecl-split-name'>
                                                <i className='ecl-dot ecl-dot-founders' />
                                                Founders
                                            </span>
                                            <span className='ecl-split-value'>{results.founderFinalPct.toFixed(1)}%</span>
                                        </div>
                                        <div className='ecl-split-row'>
                                            <span className='ecl-split-name'>
                                                <i className='ecl-dot ecl-dot-investors' />
                                                Investors
                                            </span>
                                            <span className='ecl-split-value'>{results.investorFinalPct.toFixed(1)}%</span>
                                        </div>
                                        <div className='ecl-split-row'>
                                            <span className='ecl-split-name'>
                                                <i className='ecl-dot ecl-dot-pool' />
                                                Option Pool
                                            </span>
                                            <span className='ecl-split-value'>{results.poolFinalPct.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='el-chart-block'>
                                <div className='el-chart-title'>
                                    <span className='el-chart-title-label'>Dilution Ledger</span>
                                </div>
                                <div className='el-file-card'>
                                    <div className='ecl-ledger'>
                                        {results.roundDetails.map(rd => (
                                            <div key={rd.id} className='ecl-ledger-row'>
                                                <span className='ecl-ledger-name'>{rd.name}</span>
                                                <span className='ecl-ledger-value'>
                                                    {rd.founderOwnershipAfterRound.toFixed(1)}%
                                                </span>
                                            </div>
                                        ))}
                                        {results.roundDetails.length === 0 && (
                                            <span className='ecl-ledger-empty'>No rounds yet</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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
