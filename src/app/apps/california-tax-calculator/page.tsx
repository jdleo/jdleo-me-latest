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
} from '@heroicons/react/24/outline';

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
        'head-of-household': 10726,
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
        'married-separate': [
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
        const caBrackets = status.includes('married-joint') ? CA_BRACKETS['married-joint'] : CA_BRACKETS.single;
        const stateTax = calculateProgressive(caTaxable, caBrackets);

        const socialSecurityLimit = 176100;
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

                <div className={`notion-content ${isLoaded ? 'loaded' : ''}`} style={{ maxWidth: '1100px' }}>
                    <div className='notion-title-block'>
                        <h1 className='notion-title'>California Tax Calculator</h1>
                        <div className='notion-subtitle'>Estimate your effective tax rate and net income for the 2025 tax year</div>
                    </div>

                    <div className='notion-divider' />

                    {!taxBreakdown && (
                        <div style={{ textAlign: 'center', padding: '64px', opacity: 0.6 }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(55, 53, 47, 0.06)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                                🧮
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#37352f', marginBottom: '8px' }}>Ready to Calculate</h3>
                            <p style={{ color: 'rgba(55, 53, 47, 0.5)' }}>Enter your financial details to see the breakdown.</p>
                        </div>
                    )}

                    <div className='notion-section'>
                        <div className='notion-card' style={{ padding: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Gross Annual Income</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(55, 53, 47, 0.4)', fontWeight: 600 }}>$</span>
                                        <input
                                            type='number'
                                            value={income}
                                            onChange={e => setIncome(e.target.value)}
                                            className='notion-input'
                                            style={{ paddingLeft: '28px', width: '100%', borderRadius: '6px', padding: '10px 12px 10px 28px', border: '1px solid rgba(55, 53, 47, 0.16)' }}
                                            placeholder='0.00'
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Filing Status</label>
                                    <select
                                        value={filingStatus}
                                        onChange={e => setFilingStatus(e.target.value)}
                                        className='notion-input'
                                        style={{ width: '100%', borderRadius: '6px', padding: '10px 12px', border: '1px solid rgba(55, 53, 47, 0.16)', height: '42px', appearance: 'none', backgroundImage: 'none' }}
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

                    {taxBreakdown && (
                        <>
                            <div className='notion-divider' />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                                <div className='notion-card' style={{ padding: '24px', backgroundColor: '#f8fafc' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Pay (Monthly)</span>
                                    <div style={{ fontSize: '36px', fontWeight: 700, color: '#37352f', marginTop: '8px', letterSpacing: '-0.02em' }}>
                                        {formatCurrency(taxBreakdown.netIncome / 12)}
                                    </div>
                                    <div style={{ marginTop: '8px', fontSize: '13px', color: 'rgba(55, 53, 47, 0.5)' }}>
                                        {formatCurrency(taxBreakdown.netIncome)} / year
                                    </div>
                                </div>
                                <div className='notion-card' style={{ padding: '24px', backgroundColor: '#fff1f2' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#be123c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Effective Tax Rate</span>
                                    <div style={{ fontSize: '36px', fontWeight: 700, color: '#be123c', marginTop: '8px', letterSpacing: '-0.02em' }}>
                                        {taxBreakdown.effectiveRate.toFixed(2)}%
                                    </div>
                                    <div style={{ marginTop: '8px', fontSize: '13px', color: '#be123c', opacity: 0.7 }}>
                                        Total Liability
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
                                        { label: 'Federal Withholding', value: taxBreakdown.federalTax },
                                        { label: 'State Withholding', value: taxBreakdown.stateTax },
                                        { label: 'Social Security', value: taxBreakdown.socialSecurity },
                                        { label: 'Medicare', value: taxBreakdown.medicare },
                                        { label: 'CA SDI', value: taxBreakdown.sdi },
                                    ].map((item, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                padding: '16px 24px',
                                                borderBottom: idx !== 5 ? '1px solid rgba(55, 53, 47, 0.06)' : 'none',
                                                backgroundColor: item.isHeader ? 'rgba(55, 53, 47, 0.03)' : 'transparent'
                                            }}
                                        >
                                            <span style={{ fontWeight: item.isHeader ? 600 : 400, color: '#37352f', fontSize: '14px' }}>{item.label}</span>
                                            <span style={{
                                                fontWeight: item.isHeader ? 700 : 400,
                                                color: item.isHeader ? '#37352f' : '#ef4444',
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
                                        backgroundColor: '#f0fdf4',
                                        borderTop: '1px solid #bbf7d0'
                                    }}>
                                        <span style={{ fontWeight: 600, color: '#15803d', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Pay</span>
                                        <span style={{ fontWeight: 700, color: '#15803d', fontFamily: 'monospace', fontSize: '16px' }}>
                                            {formatCurrency(taxBreakdown.netIncome)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '32px', textAlign: 'center' }}>
                                <p style={{ fontSize: '12px', color: 'rgba(55, 53, 47, 0.4)', fontStyle: 'italic' }}>
                                    Estimates based on 2025 CA Tax Brackets. Not financial advice.
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
