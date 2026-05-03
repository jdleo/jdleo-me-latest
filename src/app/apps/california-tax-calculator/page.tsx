'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { strings } from '../../constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import {
    DevicePhoneMobileIcon,
    PencilSquareIcon,
    DocumentTextIcon,
    CalculatorIcon,
    BanknotesIcon,
    ChevronDownIcon,
} from '@heroicons/react/24/outline';

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
            <main className={`jd-home jd-apps-home ${isLoaded ? 'is-loaded' : ''}`}>
                <header className='jd-nav-wrap'>
                    <Link href='/' className='jd-logo'>{strings.NAME}</Link>
                    <nav className='jd-nav' aria-label='Primary navigation'>
                        <Link href='/apps' className='jd-nav-link'>Apps</Link>
                        <Link href='/blog' className='jd-nav-link'>Blog</Link>
                        <Link href='/apps/resume' className='jd-nav-link'>Resume</Link>
                    </nav>
                    <div className='jd-nav-actions'>
                        <Link href='/apps/chat' className='jd-login'>Chat</Link>
                        <Link href='/' className='jd-top-cta'>Home</Link>
                    </div>
                </header>

                <div className={`notion-content ${isLoaded ? 'loaded' : ''}`} style={{ maxWidth: '1100px' }}>
                    <div className='notion-title-block'>
                        <h1 className='notion-title'>2026 California Tax Calculator</h1>
                        <div className='notion-subtitle'>Estimate your effective tax rate and net income for the 2026 tax year</div>
                    </div>

                    <div className='notion-divider' />

                    {!taxBreakdown && (
                        <div style={{ textAlign: 'center', padding: '64px', opacity: 0.6 }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(55, 53, 47, 0.06)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                                🧮
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.88)', marginBottom: '8px' }}>Ready to Calculate</h3>
                            <p style={{ color: 'rgba(255, 255, 255, 0.58)' }}>Enter your financial details to see the breakdown.</p>
                        </div>
                    )}

                    <div className='notion-section'>
                        <div className='notion-card' style={{ padding: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.58)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Gross Annual Income</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.46)', fontWeight: 600 }}>$</span>
                                        <input
                                            type='number'
                                            value={income}
                                            onChange={e => setIncome(e.target.value)}
                                            className='notion-input'
                                            style={{ paddingLeft: '28px', width: '100%', borderRadius: '6px', padding: '10px 12px 10px 28px', border: '1px solid rgba(255, 255, 255, 0.13)' }}
                                            placeholder='0.00'
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.58)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Filing Status</label>
                                    <div className='jd-select-wrap'>
                                        <button
                                            type='button'
                                            className={`jd-select-button ${isFilingOpen ? 'is-open' : ''}`}
                                            onClick={() => setIsFilingOpen(open => !open)}
                                            aria-haspopup='listbox'
                                            aria-expanded={isFilingOpen}
                                        >
                                            <span>{selectedFilingLabel}</span>
                                            <ChevronDownIcon />
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
                            <div className='notion-divider' />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                                <div className='notion-card' style={{ padding: '24px', backgroundColor: 'rgba(255, 255, 255, 0.055)' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.58)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Pay (Monthly)</span>
                                    <div style={{ fontSize: '36px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.88)', marginTop: '8px', letterSpacing: '-0.02em' }}>
                                        {formatCurrency(taxBreakdown.netIncome / 12)}
                                    </div>
                                    <div style={{ marginTop: '8px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.58)' }}>
                                        {formatCurrency(taxBreakdown.netIncome)} / year
                                    </div>
                                </div>
                                <div className='notion-card' style={{ padding: '24px', backgroundColor: 'rgba(255, 92, 92, 0.08)' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255, 180, 180, 0.9)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Effective Tax Rate</span>
                                    <div style={{ fontSize: '36px', fontWeight: 700, color: 'rgba(255, 180, 180, 0.95)', marginTop: '8px', letterSpacing: '-0.02em' }}>
                                        {taxBreakdown.effectiveRate.toFixed(2)}%
                                    </div>
                                    <div style={{ marginTop: '8px', fontSize: '13px', color: 'rgba(255, 180, 180, 0.72)' }}>
                                        Estimated Liability
                                    </div>
                                </div>
                            </div>

                            <div className='notion-section'>
                                <div className='notion-section-title'>
                                    <BanknotesIcon className='notion-section-icon' />
                                    Tax Breakdown
                                </div>
                                <div className='notion-card' style={{ padding: '0', overflow: 'hidden' }}>
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
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                padding: '16px 24px',
                                                borderBottom: idx !== items.length - 1 ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                                                backgroundColor: item.isHeader ? 'rgba(255, 255, 255, 0.045)' : 'transparent'
                                            }}
                                        >
                                            <span style={{ fontWeight: item.isHeader ? 600 : 400, color: 'rgba(255, 255, 255, 0.88)', fontSize: '14px' }}>{item.label}</span>
                                            <span style={{
                                                fontWeight: item.isHeader ? 700 : 400,
                                                color: item.isHeader ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 180, 180, 0.9)',
                                                fontFamily: 'monospace',
                                                fontSize: '14px'
                                            }}>
                                                {item.isHeader ? '' : '-'}
                                                {formatCurrency(item.value)}
                                            </span>
                                        </div>
                                    ))}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '16px 24px',
                                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                        borderTop: '1px solid rgba(34, 197, 94, 0.24)'
                                    }}>
                                        <span style={{ fontWeight: 600, color: '#15803d', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Pay</span>
                                        <span style={{ fontWeight: 700, color: '#15803d', fontFamily: 'monospace', fontSize: '16px' }}>
                                            {formatCurrency(taxBreakdown.netIncome)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '32px', textAlign: 'center' }}>
                                <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.46)', fontStyle: 'italic' }}>
                                    Estimates use 2026 federal brackets, 2026 Social Security wage base, CA's 2026 estimated-tax worksheet guidance, CA SDI, and the 1% CA Behavioral Health Services Tax above $1M taxable income. Not financial advice.
                                </p>
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
