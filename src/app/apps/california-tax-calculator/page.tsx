'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WebVitals } from '@/components/SEO/WebVitals';
import { strings } from '../../constants/strings';

type TaxBreakdown = {
    grossIncome: number;
    federalTax: number;
    stateTax: number;
    socialSecurity: number;
    medicare: number;
    sdi: number;
    childTaxCredit: number;
    otherDependentCredit: number;
    totalDeductions: number;
    totalCredits: number;
    netIncome: number;
    effectiveRate: number;
};

export default function CaliforniaTaxCalculator() {
    const [income, setIncome] = useState<string>('120000');
    const [filingStatus, setFilingStatus] = useState<string>('single');
    const [dependents, setDependents] = useState<string>('0');
    const [childrenUnder17, setChildrenUnder17] = useState<string>('0');
    const [isLoaded, setIsLoaded] = useState(false);
    const [taxBreakdown, setTaxBreakdown] = useState<TaxBreakdown | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // 2025 Tax Constants (Estimated/Projected)
    const STANDARD_DEDUCTION_FED = {
        single: 14600,
        'married-joint': 29200,
        'married-separate': 14600,
        'head-of-household': 21900,
    };

    const STANDARD_DEDUCTION_CA = {
        single: 5363,
        'married-joint': 10726,
        'married-separate': 5363,
        'head-of-household': 10726, // Uses Single for standard, but different credits usually. Simplified here.
    };

    const FED_BRACKETS = {
        single: [
            { limit: 11600, rate: 0.10 },
            { limit: 47150, rate: 0.12 },
            { limit: 100525, rate: 0.22 },
            { limit: 191950, rate: 0.24 },
            { limit: 243725, rate: 0.32 },
            { limit: 609350, rate: 0.35 },
            { limit: Infinity, rate: 0.37 },
        ],
        'married-joint': [
            { limit: 23200, rate: 0.10 },
            { limit: 94300, rate: 0.12 },
            { limit: 201050, rate: 0.22 },
            { limit: 383900, rate: 0.24 },
            { limit: 487450, rate: 0.32 },
            { limit: 731200, rate: 0.35 },
            { limit: Infinity, rate: 0.37 },
        ],
        // Mapping other statuses to Single/Married for simplicity or adding specific tables if needed
        'married-separate': [ /* Same as single mostly */
            { limit: 11600, rate: 0.10 },
            { limit: 47150, rate: 0.12 },
            { limit: 100525, rate: 0.22 },
            { limit: 191950, rate: 0.24 },
            { limit: 243725, rate: 0.32 },
            { limit: 365600, rate: 0.35 },
            { limit: Infinity, rate: 0.37 },
        ],
        'head-of-household': [
            { limit: 16550, rate: 0.10 },
            { limit: 63100, rate: 0.12 },
            { limit: 100500, rate: 0.22 },
            { limit: 191950, rate: 0.24 },
            { limit: 243700, rate: 0.32 },
            { limit: 609350, rate: 0.35 },
            { limit: Infinity, rate: 0.37 },
        ]
    };

    const CA_BRACKETS = {
        single: [
            { limit: 10412, rate: 0.01 },
            { limit: 24684, rate: 0.02 },
            { limit: 38959, rate: 0.04 },
            { limit: 54081, rate: 0.06 },
            { limit: 68350, rate: 0.08 },
            { limit: 349137, rate: 0.093 },
            { limit: 418961, rate: 0.103 },
            { limit: 698271, rate: 0.113 },
            { limit: Infinity, rate: 0.123 },
        ],
        'married-joint': [
            { limit: 20824, rate: 0.01 },
            { limit: 49368, rate: 0.02 },
            { limit: 77918, rate: 0.04 },
            { limit: 108162, rate: 0.06 },
            { limit: 136700, rate: 0.08 },
            { limit: 698274, rate: 0.093 },
            { limit: 837922, rate: 0.103 },
            { limit: 1396542, rate: 0.113 },
            { limit: Infinity, rate: 0.123 },
        ]
        // Others map to Single/Joint roughly
    };

    // Helper for progressive tax calculation
    const calculateProgressive = (taxableIncome: number, brackets: { limit: number; rate: number }[]) => {
        let tax = 0;
        let previousLimit = 0;

        if (taxableIncome <= 0) return 0;

        for (const bracket of brackets) {
            const incomeInBracket = Math.min(taxableIncome, bracket.limit) - previousLimit;
            if (incomeInBracket <= 0) break;
            tax += incomeInBracket * bracket.rate;
            previousLimit = bracket.limit;
        }
        return tax;
    };

    const calculateTax = () => {
        const grossIncome = parseFloat(income);
        if (isNaN(grossIncome) || grossIncome <= 0) {
            setTaxBreakdown(null);
            return;
        }

        const status = filingStatus as keyof typeof STANDARD_DEDUCTION_FED;
        const fedStandardDeduction = STANDARD_DEDUCTION_FED[status] || STANDARD_DEDUCTION_FED.single;
        const caStandardDeduction = STANDARD_DEDUCTION_CA[status] || STANDARD_DEDUCTION_CA.single;

        // Federal Tax
        const fedTaxable = Math.max(0, grossIncome - fedStandardDeduction);
        const fedBrackets = FED_BRACKETS[status] || FED_BRACKETS.single;
        const federalTax = calculateProgressive(fedTaxable, fedBrackets);

        // CA State Tax
        const caTaxable = Math.max(0, grossIncome - caStandardDeduction);
        const caBrackets = status.includes('married-joint') ? CA_BRACKETS['married-joint'] : CA_BRACKETS.single;
        const stateTax = calculateProgressive(caTaxable, caBrackets); // Note: CA also has a 1% surcharge > 1M, implied in top bracket for simple approximation here.

        // FICA
        // Social Security: 6.2% on up to $176,100 (2025 proj)
        const socialSecurityLimit = 176100;
        const socialSecurity = Math.min(grossIncome, socialSecurityLimit) * 0.062;

        // Medicare: 1.45% no limit + 0.9% > 200k (Single) / 250k (Married)
        const medicareBase = grossIncome * 0.0145;
        let medicareSurcharge = 0;
        const medicareThreshold = status === 'married-joint' ? 250000 : 200000;
        if (grossIncome > medicareThreshold) {
            medicareSurcharge = (grossIncome - medicareThreshold) * 0.009;
        }
        const medicare = medicareBase + medicareSurcharge;

        // CA SDI (1.1% projected 2024/25, usually capped ~1.6k but cap removed recently? SDI cap was removed in 2024. 1.1% on all wages)
        // Wait, standard limitation on SDI was removed? Yes, effectively 1.1% on all wages for 2024+.
        const sdiRate = 0.011;
        const sdi = grossIncome * sdiRate;

        const totalDeductions = federalTax + stateTax + socialSecurity + medicare + sdi;
        const netIncome = grossIncome - totalDeductions;
        const effectiveRate = (totalDeductions / grossIncome) * 100;

        setTaxBreakdown({
            grossIncome,
            federalTax,
            stateTax,
            socialSecurity,
            medicare,
            sdi,
            childTaxCredit: 0,
            otherDependentCredit: 0,
            totalDeductions,
            totalCredits: 0,
            netIncome,
            effectiveRate,
        });
    };

    useEffect(() => {
        calculateTax();
    }, [income, filingStatus, dependents, childrenUnder17]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
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
                        <span>Inputs</span>
                        <span className='text-[10px]'>▼</span>
                    </button>
                </header>

                {/* Left Sidebar (Desktop) */}
                <aside className='hidden md:flex flex-col w-80 h-full border-r border-[var(--border-light)] bg-white/50 backdrop-blur-xl z-20'>
                    <div className='p-6 border-b border-[var(--border-light)]'>
                        <div className='flex items-center gap-3 mb-6'>
                            <div className='w-3 h-3 rounded-full bg-[var(--purple-4)]' />
                            <span className='font-bold uppercase tracking-widest text-sm text-[var(--fg-4)]'>CA Tax Engine</span>
                        </div>
                        <nav className='flex flex-col gap-2'>
                            <Link href='/apps' className='text-xs font-bold uppercase tracking-wider text-muted hover:text-[var(--purple-4)] transition-colors flex items-center gap-2'>
                                <span>←</span> Back to Apps
                            </Link>
                        </nav>
                    </div>

                    <div className='flex-grow overflow-y-auto p-6 space-y-8'>
                        <div>
                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Financials</h3>
                            <div className='space-y-4'>
                                <div className='space-y-1.5'>
                                    <label className='text-[10px] font-bold uppercase tracking-wider text-[var(--fg-4)] ml-1'>Gross Annual Income</label>
                                    <div className='relative'>
                                        <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted font-bold text-sm'>$</span>
                                        <input
                                            type='number'
                                            value={income}
                                            onChange={e => setIncome(e.target.value)}
                                            className='w-full bg-white border border-[var(--border-light)] rounded-xl py-3 pl-7 pr-3 text-sm font-medium text-[var(--fg-4)] focus:border-[var(--purple-4)] focus:ring-2 focus:ring-[var(--purple-1)] outline-none transition-all'
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div className='space-y-1.5'>
                                    <label className='text-[10px] font-bold uppercase tracking-wider text-[var(--fg-4)] ml-1'>Filing Status</label>
                                    <select
                                        value={filingStatus}
                                        onChange={e => setFilingStatus(e.target.value)}
                                        className='w-full bg-white border border-[var(--border-light)] rounded-xl p-3 text-sm font-medium text-[var(--fg-4)] focus:border-[var(--purple-4)] focus:ring-2 focus:ring-[var(--purple-1)] outline-none appearance-none cursor-pointer'
                                    >
                                        <option value='single'>Single</option>
                                        <option value='married-joint'>Married Filing Jointly</option>
                                        <option value='married-separate'>Married Filing Separately</option>
                                        <option value='head-of-household'>Head of Household</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className='flex-grow flex flex-col h-full relative bg-[#fafbff] overflow-hidden'>
                    {/* Floating decorations */}
                    <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--purple-1)] opacity-30 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2' />

                    <div className='flex-grow overflow-auto p-4 md:p-8 z-10 custom-scrollbar'>
                        {taxBreakdown ? (
                            <div className='max-w-4xl mx-auto space-y-8 animate-fade-in-up'>
                                {/* Top Cards */}
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                    <div className='bg-white p-6 rounded-2xl shadow-sm border border-[var(--border-light)]'>
                                        <span className='text-[10px] font-bold uppercase tracking-widest text-muted block mb-3'>Net Take Home</span>
                                        <div className='flex items-baseline gap-2'>
                                            <span className='text-4xl font-bold text-[var(--purple-4)] tracking-tight'>{formatCurrency(taxBreakdown.netIncome)}</span>
                                            <span className='text-sm text-muted font-medium'>/ yr</span>
                                        </div>
                                        <div className='mt-4 pt-4 border-t border-[var(--border-light)] flex justify-between items-center'>
                                            <span className='text-[10px] font-bold uppercase tracking-wider text-muted'>Monthly</span>
                                            <span className='text-sm font-bold text-[var(--fg-4)]'>{formatCurrency(taxBreakdown.netIncome / 12)}</span>
                                        </div>
                                    </div>

                                    <div className='bg-white p-6 rounded-2xl shadow-sm border border-[var(--border-light)] relative overflow-hidden'>
                                        <span className='text-[10px] font-bold uppercase tracking-widest text-muted block mb-3'>Effective Tax Rate</span>
                                        <div className='flex items-baseline gap-2 relative z-10'>
                                            <span className='text-4xl font-bold text-red-500 tracking-tight'>{taxBreakdown.effectiveRate.toFixed(1)}%</span>
                                            <span className='text-sm text-muted font-medium'>total liability</span>
                                        </div>
                                        <div className='mt-4 pt-4 border-t border-[var(--border-light)] flex gap-2 relative z-10 text-[10px] uppercase font-bold text-muted tracking-wider'>
                                            <span>CA State + Federal + FICA</span>
                                        </div>
                                        <div className='absolute right-0 bottom-0 w-32 h-32 bg-red-50 rounded-full blur-2xl -mr-10 -mb-10 pointer-events-none' />
                                    </div>
                                </div>

                                {/* Distribution Bar */}
                                <div className='bg-white p-6 rounded-2xl shadow-sm border border-[var(--border-light)]'>
                                    <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-6'>Liability Distribution</h3>
                                    <div className='h-4 bg-[var(--bg-2)] rounded-full overflow-hidden flex'>
                                        <div style={{ width: `${(taxBreakdown.federalTax / taxBreakdown.grossIncome) * 100}%` }} className='bg-blue-400 h-full' title="Federal Tax" />
                                        <div style={{ width: `${(taxBreakdown.stateTax / taxBreakdown.grossIncome) * 100}%` }} className='bg-blue-300 h-full' title="State Tax" />
                                        <div style={{ width: `${(taxBreakdown.socialSecurity / taxBreakdown.grossIncome) * 100}%` }} className='bg-red-400 h-full' title="Social Security" />
                                        <div style={{ width: `${(taxBreakdown.medicare / taxBreakdown.grossIncome) * 100}%` }} className='bg-red-300 h-full' title="Medicare" />
                                        <div style={{ width: `${(taxBreakdown.sdi / taxBreakdown.grossIncome) * 100}%` }} className='bg-yellow-400 h-full' title="CA SDI" />
                                    </div>
                                    <div className='flex flex-wrap gap-4 mt-4 justify-center'>
                                        <div className='flex items-center gap-2'>
                                            <div className='w-2 h-2 rounded-full bg-blue-400' />
                                            <span className='text-[10px] font-bold uppercase text-muted'>Federal</span>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <div className='w-2 h-2 rounded-full bg-blue-300' />
                                            <span className='text-[10px] font-bold uppercase text-muted'>State</span>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <div className='w-2 h-2 rounded-full bg-red-400' />
                                            <span className='text-[10px] font-bold uppercase text-muted'>Soc. Sec</span>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <div className='w-2 h-2 rounded-full bg-red-300' />
                                            <span className='text-[10px] font-bold uppercase text-muted'>Medicare</span>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <div className='w-2 h-2 rounded-full bg-yellow-400' />
                                            <span className='text-[10px] font-bold uppercase text-muted'>SDI</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Ledger */}
                                <div className='bg-white rounded-2xl shadow-sm border border-[var(--border-light)] overflow-hidden'>
                                    <div className='p-4 border-b border-[var(--border-light)] bg-[var(--bg-2)]'>
                                        <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted'>Detailed Ledger</h3>
                                    </div>
                                    <div className='divide-y divide-[var(--border-light)]'>
                                        {[
                                            { label: 'Gross Annual Income', value: taxBreakdown.grossIncome, isTotal: true },
                                            { label: 'Federal Withholding', value: -taxBreakdown.federalTax, color: 'text-red-500' },
                                            { label: 'State Withholding', value: -taxBreakdown.stateTax, color: 'text-red-500' },
                                            { label: 'Social Security', value: -taxBreakdown.socialSecurity, color: 'text-red-500' },
                                            { label: 'Medicare', value: -taxBreakdown.medicare, color: 'text-red-500' },
                                            { label: 'CA SDI (Disability)', value: -taxBreakdown.sdi, color: 'text-red-500' },
                                        ].map((item, idx) => (
                                            <div key={idx} className={`flex justify-between items-center p-4 hover:bg-[var(--bg-2)] transition-colors ${item.isTotal ? 'bg-[var(--purple-1)]/10' : ''}`}>
                                                <span className={`text-xs font-bold uppercase tracking-wider ${item.isTotal ? 'text-[var(--purple-4)]' : 'text-[var(--fg-4)]'}`}>{item.label}</span>
                                                <span className={`text-sm font-bold font-mono ${item.color || (item.isTotal ? 'text-[var(--purple-4)]' : 'text-[var(--fg-4)]')}`}>
                                                    {item.value > 0 ? '' : '-'}{formatCurrency(Math.abs(item.value))}
                                                </span>
                                            </div>
                                        ))}
                                        <div className='flex justify-between items-center p-4 bg-[var(--purple-4)] text-white'>
                                            <span className='text-xs font-bold uppercase tracking-wider'>Net Pay</span>
                                            <span className='text-sm font-bold font-mono'>{formatCurrency(taxBreakdown.netIncome)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className='text-center'>
                                    <p className='text-[10px] font-bold uppercase tracking-wider text-muted opacity-50'>
                                        Estimates based on 2025 CA Tax Brackets. Not financial advice.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className='flex flex-col items-center justify-center p-12 text-center opacity-60'>
                                <div className='w-20 h-20 bg-[var(--purple-1)] rounded-full flex items-center justify-center text-3xl mb-4 text-[var(--purple-4)]'>
                                    📊
                                </div>
                                <h3 className='text-lg font-bold text-[var(--fg-4)]'>Ready to Calculate</h3>
                                <p className='text-sm text-muted'>Enter your income details on the sidebar to view your liability breakdown.</p>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Overlay */}
                    {isMobileMenuOpen && (
                        <div className='fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 md:hidden' onClick={() => setIsMobileMenuOpen(false)}>
                            <div className='w-full max-w-sm bg-white rounded-2xl shadow-2xl animate-slide-up overflow-hidden border border-[var(--border-light)]' onClick={e => e.stopPropagation()}>
                                <div className='p-4 border-b border-[var(--border-light)] flex justify-between items-center bg-[var(--bg-2)]'>
                                    <span className='text-xs font-bold uppercase tracking-widest text-[var(--fg-4)]'>Input Parameters</span>
                                    <button onClick={() => setIsMobileMenuOpen(false)} className='w-6 h-6 rounded-full bg-white border border-[var(--border-light)] flex items-center justify-center text-muted'>✕</button>
                                </div>
                                <div className='p-4 space-y-4'>
                                    <div className='space-y-1.5'>
                                        <label className='text-[10px] font-bold uppercase tracking-wider text-[var(--fg-4)] ml-1'>Gross Annual Income</label>
                                        <div className='relative'>
                                            <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted font-bold text-sm'>$</span>
                                            <input
                                                type='number'
                                                value={income}
                                                onChange={e => setIncome(e.target.value)}
                                                className='w-full bg-[var(--bg-2)] border border-[var(--border-light)] rounded-xl py-3 pl-7 pr-3 text-sm font-medium text-[var(--fg-4)] focus:border-[var(--purple-4)] focus:ring-2 focus:ring-[var(--purple-1)] outline-none transition-all'
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div className='space-y-1.5'>
                                        <label className='text-[10px] font-bold uppercase tracking-wider text-[var(--fg-4)] ml-1'>Filing Status</label>
                                        <select
                                            value={filingStatus}
                                            onChange={e => setFilingStatus(e.target.value)}
                                            className='w-full bg-[var(--bg-2)] border border-[var(--border-light)] rounded-xl p-3 text-sm font-medium text-[var(--fg-4)] focus:border-[var(--purple-4)] focus:ring-2 focus:ring-[var(--purple-1)] outline-none appearance-none'
                                        >
                                            <option value='single'>Single</option>
                                            <option value='married-joint'>Married Filing Jointly</option>
                                            <option value='married-separate'>Married Filing Separately</option>
                                            <option value='head-of-household'>Head of Household</option>
                                        </select>
                                    </div>
                                    <button onClick={() => setIsMobileMenuOpen(false)} className='w-full py-3 bg-[var(--purple-4)] text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg'>
                                        Apply Updates
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
