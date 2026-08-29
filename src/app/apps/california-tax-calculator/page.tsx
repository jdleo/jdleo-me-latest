'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { strings } from '../../constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import { BanknotesIcon } from '@heroicons/react/24/outline';

type TaxBreakdown = {
    grossIncome: number;
    federalTax: number;
    stateTax: number;
    californiaBaseTax: number;
    behavioralHealthTax: number;
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
    const [isFilingOpen, setIsFilingOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [taxBreakdown, setTaxBreakdown] = useState<TaxBreakdown | null>(null);

    const filingOptions = [
        { value: 'single', label: 'Single' },
        { value: 'married-joint', label: 'Married Filing Jointly' },
        { value: 'married-separate', label: 'Married Filing Separately' },
        { value: 'head-of-household', label: 'Head of Household' },
    ];

    const selectedFilingLabel = filingOptions.find(option => option.value === filingStatus)?.label || 'Single';

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // 2026 tax constants. California 2026 estimated-tax guidance uses the
    // 2025 Form 540 tax table/rate schedule with 2026 estimated income.
    const STANDARD_DEDUCTION_FED = {
        single: 16100,
        'married-joint': 32200,
        'married-separate': 16100,
        'head-of-household': 24150,
    };

    const STANDARD_DEDUCTION_CA = {
        single: 5706,
        'married-joint': 11412,
        'married-separate': 5706,
        'head-of-household': 11412,
    };

    const FED_BRACKETS = {
        single: [
            { limit: 12400, rate: 0.10 },
            { limit: 50400, rate: 0.12 },
            { limit: 105700, rate: 0.22 },
            { limit: 201775, rate: 0.24 },
            { limit: 256225, rate: 0.32 },
            { limit: 640600, rate: 0.35 },
            { limit: Infinity, rate: 0.37 },
        ],
        'married-joint': [
            { limit: 24800, rate: 0.10 },
            { limit: 100800, rate: 0.12 },
            { limit: 211400, rate: 0.22 },
            { limit: 403550, rate: 0.24 },
            { limit: 512450, rate: 0.32 },
            { limit: 768700, rate: 0.35 },
            { limit: Infinity, rate: 0.37 },
        ],
        'married-separate': [
            { limit: 12400, rate: 0.10 },
            { limit: 50400, rate: 0.12 },
            { limit: 105700, rate: 0.22 },
            { limit: 201775, rate: 0.24 },
            { limit: 256225, rate: 0.32 },
            { limit: 384350, rate: 0.35 },
            { limit: Infinity, rate: 0.37 },
        ],
        'head-of-household': [
            { limit: 17700, rate: 0.10 },
            { limit: 67450, rate: 0.12 },
            { limit: 105700, rate: 0.22 },
            { limit: 201750, rate: 0.24 },
            { limit: 256200, rate: 0.32 },
            { limit: 640600, rate: 0.35 },
            { limit: Infinity, rate: 0.37 },
        ]
    };

    const CA_BRACKETS = {
        single: [
            { limit: 11079, rate: 0.01 },
            { limit: 26264, rate: 0.02 },
            { limit: 41452, rate: 0.04 },
            { limit: 57542, rate: 0.06 },
            { limit: 72724, rate: 0.08 },
            { limit: 371479, rate: 0.093 },
            { limit: 445771, rate: 0.103 },
            { limit: 742953, rate: 0.113 },
            { limit: Infinity, rate: 0.123 },
        ],
        'married-joint': [
            { limit: 22158, rate: 0.01 },
            { limit: 52528, rate: 0.02 },
            { limit: 82904, rate: 0.04 },
            { limit: 115084, rate: 0.06 },
            { limit: 145448, rate: 0.08 },
            { limit: 742958, rate: 0.093 },
            { limit: 891542, rate: 0.103 },
            { limit: 1485906, rate: 0.113 },
            { limit: Infinity, rate: 0.123 },
        ],
        'head-of-household': [
            { limit: 22173, rate: 0.01 },
            { limit: 52530, rate: 0.02 },
            { limit: 67716, rate: 0.04 },
            { limit: 83805, rate: 0.06 },
            { limit: 98990, rate: 0.08 },
            { limit: 505208, rate: 0.093 },
            { limit: 606251, rate: 0.103 },
            { limit: 1010417, rate: 0.113 },
            { limit: Infinity, rate: 0.123 },
        ]
    };

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

        const fedTaxable = Math.max(0, grossIncome - fedStandardDeduction);
        const fedBrackets = FED_BRACKETS[status] || FED_BRACKETS.single;
        const federalTax = calculateProgressive(fedTaxable, fedBrackets);

        const caTaxable = Math.max(0, grossIncome - caStandardDeduction);
        const caBrackets =
            status === 'married-joint'
                ? CA_BRACKETS['married-joint']
                : status === 'head-of-household'
                    ? CA_BRACKETS['head-of-household']
                    : CA_BRACKETS.single;
        const californiaBaseTax = calculateProgressive(caTaxable, caBrackets);
        const behavioralHealthTax = Math.max(0, caTaxable - 1000000) * 0.01;
        const stateTax = californiaBaseTax + behavioralHealthTax;

        const socialSecurityLimit = 184500;
        const socialSecurity = Math.min(grossIncome, socialSecurityLimit) * 0.062;

        const medicareBase = grossIncome * 0.0145;
        let medicareSurcharge = 0;
        const medicareThreshold = status === 'married-joint' ? 250000 : 200000;
        if (grossIncome > medicareThreshold) {
            medicareSurcharge = (grossIncome - medicareThreshold) * 0.009;
        }
        const medicare = medicareBase + medicareSurcharge;

        const sdiRate = 0.011;
        const sdi = grossIncome * sdiRate;

        const totalDeductions = federalTax + stateTax + socialSecurity + medicare + sdi;
        const netIncome = grossIncome - totalDeductions;
        const effectiveRate = (totalDeductions / grossIncome) * 100;

        setTaxBreakdown({
            grossIncome,
            federalTax,
            stateTax,
            californiaBaseTax,
            behavioralHealthTax,
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
    }, [income, filingStatus]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <>
            <WebVitals />
            <main className='el-page el-tax'>
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
                            <h1>2026 CA Tax Calculator</h1>
                            <p className='el-hero-sub'>
                                Estimate your effective tax rate and net income for the 2026 tax year.
                            </p>
                        </div>
                    </div>
                </section>

                <section className='el-section el-sentiment'>
                    <div className='el-chart-block'>
                        <div className='el-chart-title'>
                            <span className='el-chart-title-label'>Your Details</span>
                        </div>
                        <div className='el-file-card'>
                            <div className='el-tax-input-grid'>
                                <div>
                                    <label className='ecl-copy-label'>Gross Annual Income</label>
                                    <div className='el-money-wrap'>
                                        <span className='el-money-symbol'>$</span>
                                        <input
                                            type='number'
                                            value={income}
                                            onChange={e => setIncome(e.target.value)}
                                            className='el-textarea el-el-input el-money-input'
                                            placeholder='0.00'
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className='ecl-copy-label'>Filing Status</label>
                                    <div className='jd-select-wrap'>
                                        <button
                                            type='button'
                                            className={`jd-select-button ${isFilingOpen ? 'is-open' : ''}`}
                                            onClick={() => setIsFilingOpen(open => !open)}
                                            aria-haspopup='listbox'
                                            aria-expanded={isFilingOpen}
                                        >
                                            <span>{selectedFilingLabel}</span>
                                            <ChevronDownSvg />
                                        </button>
                                        {isFilingOpen && (
                                            <div className='jd-select-menu' role='listbox'>
                                                {filingOptions.map(option => (
                                                    <button
                                                        key={option.value}
                                                        type='button'
                                                        className={filingStatus === option.value ? 'is-selected' : ''}
                                                        onClick={() => {
                                                            setFilingStatus(option.value);
                                                            setIsFilingOpen(false);
                                                        }}
                                                        role='option'
                                                        aria-selected={filingStatus === option.value}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {taxBreakdown && (
                        <>
                            <div className='el-stat-grid'>
                                <div className='el-stat-card'>
                                    <span className='el-stat-label'>Net Pay (Monthly)</span>
                                    <div className='el-stat-value'>
                                        {formatCurrency(taxBreakdown.netIncome / 12)}
                                    </div>
                                    <div className='el-stat-sub'>
                                        {formatCurrency(taxBreakdown.netIncome)} / year
                                    </div>
                                </div>
                                <div className='el-stat-card el-stat-card-accent'>
                                    <span className='el-stat-label'>Effective Tax Rate</span>
                                    <div className='el-stat-value'>
                                        {taxBreakdown.effectiveRate.toFixed(2)}%
                                    </div>
                                    <div className='el-stat-sub'>Estimated liability</div>
                                </div>
                            </div>

                            <div className='el-chart-block'>
                                <div className='el-chart-title'>
                                    <span className='el-chart-title-label'>
                                        <BanknotesIcon aria-hidden='true' />
                                        Tax Breakdown
                                    </span>
                                </div>
                                <div className='el-breakdown-card'>
                                    {[
                                        { label: 'Gross Income', value: taxBreakdown.grossIncome, isHeader: true },
                                        { label: 'Federal Income Tax', value: taxBreakdown.federalTax },
                                        { label: 'CA Income Tax', value: taxBreakdown.californiaBaseTax },
                                        ...(taxBreakdown.behavioralHealthTax > 0
                                            ? [{ label: 'CA Behavioral Health Services Tax', value: taxBreakdown.behavioralHealthTax }]
                                            : []),
                                        { label: 'Social Security', value: taxBreakdown.socialSecurity },
                                        { label: 'Medicare', value: taxBreakdown.medicare },
                                        { label: 'CA SDI', value: taxBreakdown.sdi },
                                    ].map((item, idx, items) => (
                                        <div
                                            key={idx}
                                            className={`el-breakdown-row ${item.isHeader ? 'is-header' : ''}`}
                                        >
                                            <span>{item.label}</span>
                                            <span className='el-breakdown-amount'>
                                                {item.isHeader ? '' : '-'}
                                                {formatCurrency(item.value)}
                                            </span>
                                        </div>
                                    ))}
                                    <div className='el-breakdown-row el-breakdown-net'>
                                        <span>Net Pay</span>
                                        <span className='el-breakdown-amount'>
                                            {formatCurrency(taxBreakdown.netIncome)}
                                        </span>
                                    </div>
                                </div>

                                <p className='el-tax-disclaimer'>
                                    Estimates use 2026 federal brackets, 2026 Social Security wage base,
                                    CA&apos;s 2026 estimated-tax worksheet guidance, CA SDI, and the 1% CA
                                    Behavioral Health Services Tax above $1M taxable income. Not financial advice.
                                </p>
                            </div>
                        </>
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

function ChevronDownSvg() {
    return (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} className='el-select-chevron'>
            <path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7' />
        </svg>
    );
}
