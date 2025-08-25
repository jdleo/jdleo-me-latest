'use client';

import { strings } from '../../constants/strings';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/SEO/Breadcrumbs';

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
    const [income, setIncome] = useState<string>('');
    const [filingStatus, setFilingStatus] = useState<string>('single');
    const [dependents, setDependents] = useState<string>('0');
    const [childrenUnder17, setChildrenUnder17] = useState<string>('0');
    const [isLoaded, setIsLoaded] = useState(false);
    const [taxBreakdown, setTaxBreakdown] = useState<TaxBreakdown | null>(null);

    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'Apps', href: '/apps' },
        { label: 'California Tax Calculator', href: '/apps/california-tax-calculator' },
    ];

    useEffect(() => {
        // Small delay for smoother loading animation
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // 2025 Federal Tax Brackets
    const federalBrackets2025 = {
        single: [
            { min: 0, max: 11600, rate: 0.1 },
            { min: 11600, max: 47150, rate: 0.12 },
            { min: 47150, max: 100525, rate: 0.22 },
            { min: 100525, max: 191950, rate: 0.24 },
            { min: 191950, max: 243725, rate: 0.32 },
            { min: 243725, max: 626350, rate: 0.35 },
            { min: 626350, max: Infinity, rate: 0.37 },
        ],
        marriedJoint: [
            { min: 0, max: 23200, rate: 0.1 },
            { min: 23200, max: 94300, rate: 0.12 },
            { min: 94300, max: 201050, rate: 0.22 },
            { min: 201050, max: 383900, rate: 0.24 },
            { min: 383900, max: 487450, rate: 0.32 },
            { min: 487450, max: 751600, rate: 0.35 },
            { min: 751600, max: Infinity, rate: 0.37 },
        ],
        marriedSeparate: [
            { min: 0, max: 11600, rate: 0.1 },
            { min: 11600, max: 47150, rate: 0.12 },
            { min: 47150, max: 100525, rate: 0.22 },
            { min: 100525, max: 191950, rate: 0.24 },
            { min: 191950, max: 243725, rate: 0.32 },
            { min: 243725, max: 375800, rate: 0.35 },
            { min: 375800, max: Infinity, rate: 0.37 },
        ],
        headOfHousehold: [
            { min: 0, max: 16550, rate: 0.1 },
            { min: 16550, max: 63100, rate: 0.12 },
            { min: 63100, max: 100500, rate: 0.22 },
            { min: 100500, max: 191950, rate: 0.24 },
            { min: 191950, max: 243700, rate: 0.32 },
            { min: 243700, max: 609350, rate: 0.35 },
            { min: 609350, max: Infinity, rate: 0.37 },
        ],
    };

    // 2025 California Tax Brackets
    const californiaBrackets2025 = {
        single: [
            { min: 0, max: 10412, rate: 0.01 },
            { min: 10412, max: 24970, rate: 0.02 },
            { min: 24970, max: 39942, rate: 0.04 },
            { min: 39942, max: 55576, rate: 0.06 },
            { min: 55576, max: 70606, rate: 0.08 },
            { min: 70606, max: 360659, rate: 0.093 },
            { min: 360659, max: 432787, rate: 0.103 },
            { min: 432787, max: 721314, rate: 0.113 },
            { min: 721314, max: 980987, rate: 0.123 },
            { min: 980987, max: Infinity, rate: 0.133 }, // 12.3% + 1% Mental Health Services Tax
        ],
        marriedJoint: [
            { min: 0, max: 20824, rate: 0.01 },
            { min: 20824, max: 49940, rate: 0.02 },
            { min: 49940, max: 79884, rate: 0.04 },
            { min: 79884, max: 111152, rate: 0.06 },
            { min: 111152, max: 141212, rate: 0.08 },
            { min: 141212, max: 721318, rate: 0.093 },
            { min: 721318, max: 865574, rate: 0.103 },
            { min: 865574, max: 1442628, rate: 0.113 },
            { min: 1442628, max: 1961974, rate: 0.123 },
            { min: 1961974, max: Infinity, rate: 0.133 }, // 12.3% + 1% Mental Health Services Tax
        ],
        marriedSeparate: [
            { min: 0, max: 10412, rate: 0.01 },
            { min: 10412, max: 24970, rate: 0.02 },
            { min: 24970, max: 39942, rate: 0.04 },
            { min: 39942, max: 55576, rate: 0.06 },
            { min: 55576, max: 70606, rate: 0.08 },
            { min: 70606, max: 360659, rate: 0.093 },
            { min: 360659, max: 432787, rate: 0.103 },
            { min: 432787, max: 721314, rate: 0.113 },
            { min: 721314, max: 980987, rate: 0.123 },
            { min: 980987, max: Infinity, rate: 0.133 },
        ],
        headOfHousehold: [
            { min: 0, max: 20824, rate: 0.01 },
            { min: 20824, max: 49940, rate: 0.02 },
            { min: 49940, max: 64928, rate: 0.04 },
            { min: 64928, max: 90506, rate: 0.06 },
            { min: 90506, max: 114096, rate: 0.08 },
            { min: 114096, max: 721318, rate: 0.093 },
            { min: 721318, max: 865574, rate: 0.103 },
            { min: 865574, max: 1442628, rate: 0.113 },
            { min: 1442628, max: 1961974, rate: 0.123 },
            { min: 1961974, max: Infinity, rate: 0.133 },
        ],
    };

    const calculateTaxByBrackets = (income: number, brackets: typeof federalBrackets2025.single): number => {
        let tax = 0;
        let remainingIncome = income;

        for (const bracket of brackets) {
            if (remainingIncome <= 0) break;

            const taxableInThisBracket = Math.min(remainingIncome, bracket.max - bracket.min);
            if (taxableInThisBracket > 0) {
                tax += taxableInThisBracket * bracket.rate;
                remainingIncome -= taxableInThisBracket;
            }
        }

        return tax;
    };

    const calculateFederalTax = (income: number, filingStatus: string): number => {
        let brackets;
        switch (filingStatus) {
            case 'married-joint':
                brackets = federalBrackets2025.marriedJoint;
                break;
            case 'married-separate':
                brackets = federalBrackets2025.marriedSeparate;
                break;
            case 'head-of-household':
                brackets = federalBrackets2025.headOfHousehold;
                break;
            default:
                brackets = federalBrackets2025.single;
        }
        return calculateTaxByBrackets(income, brackets);
    };

    const calculateStateTax = (income: number, filingStatus: string): number => {
        let brackets;
        switch (filingStatus) {
            case 'married-joint':
                brackets = californiaBrackets2025.marriedJoint;
                break;
            case 'married-separate':
                brackets = californiaBrackets2025.marriedSeparate;
                break;
            case 'head-of-household':
                brackets = californiaBrackets2025.headOfHousehold;
                break;
            default:
                brackets = californiaBrackets2025.single;
        }
        return calculateTaxByBrackets(income, brackets);
    };

    const calculateTax = () => {
        const grossIncome = parseFloat(income);
        const numDependents = parseInt(dependents) || 0;
        const numChildrenUnder17 = parseInt(childrenUnder17) || 0;

        if (isNaN(grossIncome) || grossIncome <= 0) {
            setTaxBreakdown(null);
            return;
        }

        // Calculate taxes using 2025 brackets
        const federalTax = calculateFederalTax(grossIncome, filingStatus);
        const stateTax = calculateStateTax(grossIncome, filingStatus);
        const socialSecurity = Math.min(grossIncome * 0.062, 176100 * 0.062); // 2025 cap: $176,100
        const medicare = grossIncome * 0.0145;
        const sdi = Math.min(grossIncome * 0.009, 1601.6); // CA SDI - using 2024 cap, update if you have 2025

        // Calculate tax credits
        const childTaxCredit = calculateChildTaxCredit(grossIncome, filingStatus, numChildrenUnder17);
        const otherDependentCredit = calculateOtherDependentCredit(
            grossIncome,
            filingStatus,
            numDependents,
            numChildrenUnder17
        );

        const totalDeductions = federalTax + stateTax + socialSecurity + medicare + sdi;
        const totalCredits = childTaxCredit + otherDependentCredit;
        const netIncome = grossIncome - totalDeductions + totalCredits; // Credits reduce tax liability
        const effectiveRate = ((totalDeductions - totalCredits) / grossIncome) * 100;

        setTaxBreakdown({
            grossIncome,
            federalTax,
            stateTax,
            socialSecurity,
            medicare,
            sdi,
            childTaxCredit,
            otherDependentCredit,
            totalDeductions,
            totalCredits,
            netIncome,
            effectiveRate: Math.max(0, effectiveRate), // Don't show negative effective rates
        });
    };

    // Auto-calculate when inputs change
    useEffect(() => {
        calculateTax();
    }, [income, filingStatus, dependents, childrenUnder17]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatPercentage = (rate: number) => {
        return `${rate.toFixed(2)}%`;
    };

    const calculateMarginalRate = (income: number, taxType: 'federal' | 'california', filingStatus: string): number => {
        let brackets;

        if (taxType === 'federal') {
            switch (filingStatus) {
                case 'married-joint':
                    brackets = federalBrackets2025.marriedJoint;
                    break;
                case 'married-separate':
                    brackets = federalBrackets2025.marriedSeparate;
                    break;
                case 'head-of-household':
                    brackets = federalBrackets2025.headOfHousehold;
                    break;
                default:
                    brackets = federalBrackets2025.single;
            }
        } else {
            switch (filingStatus) {
                case 'married-joint':
                    brackets = californiaBrackets2025.marriedJoint;
                    break;
                case 'married-separate':
                    brackets = californiaBrackets2025.marriedSeparate;
                    break;
                case 'head-of-household':
                    brackets = californiaBrackets2025.headOfHousehold;
                    break;
                default:
                    brackets = californiaBrackets2025.single;
            }
        }

        // Find the highest bracket that applies to this income
        for (let i = brackets.length - 1; i >= 0; i--) {
            if (income > brackets[i].min) {
                return brackets[i].rate * 100;
            }
        }
        return 0;
    };

    const calculateChildTaxCredit = (income: number, filingStatus: string, childrenUnder17: number): number => {
        if (childrenUnder17 === 0) return 0;

        const creditPerChild = 2200; // 2025 Child Tax Credit amount
        let phaseoutThreshold;

        // Phaseout thresholds for 2025
        switch (filingStatus) {
            case 'married-joint':
                phaseoutThreshold = 400000;
                break;
            default: // single, married-separate, head-of-household
                phaseoutThreshold = 200000;
        }

        const baseCredit = childrenUnder17 * creditPerChild;

        if (income <= phaseoutThreshold) {
            return baseCredit;
        }

        // Phaseout: $50 reduction for every $1,000 over threshold
        const excessIncome = income - phaseoutThreshold;
        const reduction = Math.floor(excessIncome / 1000) * 50;

        return Math.max(0, baseCredit - reduction);
    };

    const calculateOtherDependentCredit = (
        income: number,
        filingStatus: string,
        totalDependents: number,
        childrenUnder17: number
    ): number => {
        const otherDependents = totalDependents - childrenUnder17;
        if (otherDependents <= 0) return 0;

        const creditPerDependent = 500; // 2025 Credit for Other Dependents amount
        let phaseoutThreshold;

        // Same phaseout thresholds as Child Tax Credit
        switch (filingStatus) {
            case 'married-joint':
                phaseoutThreshold = 400000;
                break;
            default:
                phaseoutThreshold = 200000;
        }

        const baseCredit = otherDependents * creditPerDependent;

        if (income <= phaseoutThreshold) {
            return baseCredit;
        }

        // Phaseout: $50 reduction for every $1,000 over threshold
        const excessIncome = income - phaseoutThreshold;
        const reduction = Math.floor(excessIncome / 1000) * 50;

        return Math.max(0, baseCredit - reduction);
    };

    return (
        <div className='min-h-screen bg-[var(--color-bg-light)] relative'>
            {/* Breadcrumbs for SEO */}
            <Breadcrumbs items={breadcrumbItems} />

            {/* Subtle background gradients */}
            <div
                className='fixed inset-0 opacity-40 pointer-events-none'
                style={{
                    background:
                        'radial-gradient(ellipse at 30% 20%, rgba(94, 106, 210, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 60%)',
                }}
            />

            {/* Navigation Bar */}
            <nav className='nav-container'>
                <div className='nav-content'>
                    <Link href='/' className='nav-logo'>
                        JL
                    </Link>
                    <div className='nav-links'>
                        <Link href='/apps' className='nav-link'>
                            Apps
                        </Link>
                        <Link href='/' className='nav-link'>
                            Home
                        </Link>
                        <a href={strings.LINKEDIN_URL} target='_blank' rel='noopener noreferrer' className='nav-link'>
                            LinkedIn
                        </a>
                        <a href={strings.GITHUB_URL} target='_blank' rel='noopener noreferrer' className='nav-link'>
                            GitHub
                        </a>
                    </div>
                </div>
            </nav>

            <main className='main-content'>
                <div className='container-responsive max-w-4xl'>
                    {/* Hero Section */}
                    <section className={`text-center mb-8 animate-reveal ${isLoaded ? '' : 'opacity-0'}`}>
                        <h1 className='text-h1 gradient-text mb-4'>California Tax Calculator</h1>
                        <p className='text-body opacity-80 max-w-2xl mx-auto'>
                            Calculate your California state income tax, federal tax, and take-home pay with a detailed
                            breakdown. Get accurate estimates for your tax liability and net income.
                        </p>
                    </section>

                    {/* Calculator Section */}
                    <div className={`animate-reveal animate-reveal-delay-1 ${isLoaded ? '' : 'opacity-0'}`}>
                        <div className='glass-card-enhanced p-6 md:p-8 mb-8'>
                            <h2 className='text-h3 mb-6'>Tax Calculator</h2>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                                <div>
                                    <label htmlFor='income' className='block text-body font-medium mb-2'>
                                        Annual Gross Income
                                    </label>
                                    <input
                                        type='number'
                                        id='income'
                                        value={income}
                                        onChange={e => setIncome(e.target.value)}
                                        placeholder='Enter your annual income'
                                        className='w-full p-3 rounded-xl bg-white border border-gray-200 text-body placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                                    />
                                </div>

                                <div>
                                    <label htmlFor='filing-status' className='block text-body font-medium mb-2'>
                                        Filing Status
                                    </label>
                                    <select
                                        id='filing-status'
                                        value={filingStatus}
                                        onChange={e => setFilingStatus(e.target.value)}
                                        className='w-full p-3 rounded-xl bg-white border border-gray-200 text-body focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                                    >
                                        <option value='single'>Single</option>
                                        <option value='married-joint'>Married Filing Jointly</option>
                                        <option value='married-separate'>Married Filing Separately</option>
                                        <option value='head-of-household'>Head of Household</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor='dependents' className='block text-body font-medium mb-2'>
                                        Total Dependents
                                        <span className='text-small opacity-60 block font-normal'>
                                            (Including yourself and children)
                                        </span>
                                    </label>
                                    <input
                                        type='number'
                                        id='dependents'
                                        value={dependents}
                                        onChange={e => setDependents(e.target.value)}
                                        placeholder='0'
                                        min='0'
                                        className='w-full p-3 rounded-xl bg-white border border-gray-200 text-body placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                                    />
                                </div>

                                <div>
                                    <label htmlFor='children-under-17' className='block text-body font-medium mb-2'>
                                        Children Under 17
                                        <span className='text-small opacity-60 block font-normal'>
                                            (Eligible for Child Tax Credit)
                                        </span>
                                    </label>
                                    <input
                                        type='number'
                                        id='children-under-17'
                                        value={childrenUnder17}
                                        onChange={e => setChildrenUnder17(e.target.value)}
                                        placeholder='0'
                                        min='0'
                                        className='w-full p-3 rounded-xl bg-white border border-gray-200 text-body placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Results Section */}
                        {taxBreakdown && (
                            <div className={`animate-reveal animate-reveal-delay-2 ${isLoaded ? '' : 'opacity-0'}`}>
                                <div className='glass-card-enhanced p-6 md:p-8'>
                                    <h2 className='text-h3 mb-6'>Tax Breakdown</h2>

                                    {/* Summary Cards */}
                                    <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
                                        <div className='glass-card p-4 text-center'>
                                            <div className='text-small opacity-60 mb-1'>Gross Income</div>
                                            <div className='text-h4 text-green-600'>
                                                {formatCurrency(taxBreakdown.grossIncome)}
                                            </div>
                                        </div>
                                        <div className='glass-card p-4 text-center'>
                                            <div className='text-small opacity-60 mb-1'>Total Taxes</div>
                                            <div className='text-h4 text-red-600'>
                                                {formatCurrency(taxBreakdown.totalDeductions)}
                                            </div>
                                        </div>
                                        <div className='glass-card p-4 text-center'>
                                            <div className='text-small opacity-60 mb-1'>Tax Credits</div>
                                            <div className='text-h4 text-green-600'>
                                                {formatCurrency(taxBreakdown.totalCredits)}
                                            </div>
                                        </div>
                                        <div className='glass-card p-4 text-center'>
                                            <div className='text-small opacity-60 mb-1'>Take-Home Pay</div>
                                            <div className='text-h4 text-blue-600'>
                                                {formatCurrency(taxBreakdown.netIncome)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detailed Breakdown */}
                                    <div className='space-y-4'>
                                        <h3 className='text-h4 mb-4'>Detailed Breakdown</h3>

                                        <div className='space-y-3'>
                                            <div className='flex justify-between items-center p-3 glass-card-subtle rounded-lg'>
                                                <div>
                                                    <span className='text-body'>Federal Income Tax</span>
                                                    <div className='text-small opacity-60'>
                                                        Marginal Rate:{' '}
                                                        {formatPercentage(
                                                            calculateMarginalRate(
                                                                taxBreakdown.grossIncome,
                                                                'federal',
                                                                filingStatus
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                                <span className='text-body font-medium'>
                                                    {formatCurrency(taxBreakdown.federalTax)}
                                                </span>
                                            </div>

                                            <div className='flex justify-between items-center p-3 glass-card-subtle rounded-lg'>
                                                <div>
                                                    <span className='text-body'>California State Tax</span>
                                                    <div className='text-small opacity-60'>
                                                        Marginal Rate:{' '}
                                                        {formatPercentage(
                                                            calculateMarginalRate(
                                                                taxBreakdown.grossIncome,
                                                                'california',
                                                                filingStatus
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                                <span className='text-body font-medium'>
                                                    {formatCurrency(taxBreakdown.stateTax)}
                                                </span>
                                            </div>

                                            <div className='flex justify-between items-center p-3 glass-card-subtle rounded-lg'>
                                                <div>
                                                    <span className='text-body'>Social Security (6.2%)</span>
                                                    <div className='text-small opacity-60'>
                                                        Wage base max: $176,100 (2025)
                                                    </div>
                                                </div>
                                                <span className='text-body font-medium'>
                                                    {formatCurrency(taxBreakdown.socialSecurity)}
                                                </span>
                                            </div>

                                            <div className='flex justify-between items-center p-3 glass-card-subtle rounded-lg'>
                                                <div>
                                                    <span className='text-body'>Medicare (1.45%)</span>
                                                    <div className='text-small opacity-60'>No wage base limit</div>
                                                </div>
                                                <span className='text-body font-medium'>
                                                    {formatCurrency(taxBreakdown.medicare)}
                                                </span>
                                            </div>

                                            <div className='flex justify-between items-center p-3 glass-card-subtle rounded-lg'>
                                                <div>
                                                    <span className='text-body'>
                                                        CA State Disability Insurance (0.9%)
                                                    </span>
                                                    <div className='text-small opacity-60'>
                                                        Wage base max: ~$178,000 (est. 2025)
                                                    </div>
                                                </div>
                                                <span className='text-body font-medium'>
                                                    {formatCurrency(taxBreakdown.sdi)}
                                                </span>
                                            </div>

                                            {/* Tax Credits Section */}
                                            {taxBreakdown.totalCredits > 0 && (
                                                <>
                                                    <div className='border-t border-gray-200 pt-4 mt-4'>
                                                        <h4 className='text-body font-semibold mb-3 text-green-700'>
                                                            Tax Credits
                                                        </h4>
                                                    </div>

                                                    {taxBreakdown.childTaxCredit > 0 && (
                                                        <div className='flex justify-between items-center p-3 glass-card-subtle rounded-lg border-l-4 border-green-500'>
                                                            <div>
                                                                <span className='text-body'>Child Tax Credit</span>
                                                                <div className='text-small opacity-60'>
                                                                    $2,200 per child under 17
                                                                </div>
                                                            </div>
                                                            <span className='text-body font-medium text-green-600'>
                                                                +{formatCurrency(taxBreakdown.childTaxCredit)}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {taxBreakdown.otherDependentCredit > 0 && (
                                                        <div className='flex justify-between items-center p-3 glass-card-subtle rounded-lg border-l-4 border-green-500'>
                                                            <div>
                                                                <span className='text-body'>
                                                                    Credit for Other Dependents
                                                                </span>
                                                                <div className='text-small opacity-60'>
                                                                    $500 per qualifying dependent
                                                                </div>
                                                            </div>
                                                            <span className='text-body font-medium text-green-600'>
                                                                +{formatCurrency(taxBreakdown.otherDependentCredit)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            <div className='flex justify-between items-center p-3 glass-card border-t-2 border-gray-300'>
                                                <div>
                                                    <span className='text-body font-semibold'>Effective Tax Rate</span>
                                                    <div className='text-small opacity-60'>
                                                        Net taxes after credits ÷ Gross income
                                                    </div>
                                                </div>
                                                <span className='text-body font-semibold'>
                                                    {formatPercentage(taxBreakdown.effectiveRate)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SEO Content */}
                    <section className={`mt-12 animate-reveal animate-reveal-delay-3 ${isLoaded ? '' : 'opacity-0'}`}>
                        <div className='glass-card-enhanced p-6 md:p-8'>
                            <h2 className='text-h3 mb-4'>About California Tax Calculator</h2>
                            <div className='prose prose-sm max-w-none text-body opacity-80'>
                                <p className='mb-4'>
                                    This California tax calculator helps you estimate your state and federal tax
                                    liability based on your income and filing status. The calculator includes all major
                                    tax components including federal income tax, California state income tax, Social
                                    Security, Medicare, and California State Disability Insurance (SDI).
                                </p>
                                <p className='mb-4'>
                                    California has one of the highest state income tax rates in the United States, with
                                    rates ranging from 1% to 13.3% depending on your income level. Understanding your
                                    tax obligation helps with financial planning and budgeting.
                                </p>
                                <p>
                                    This calculator provides estimates based on current tax rates and should be used for
                                    planning purposes. Consult a tax professional for detailed tax advice and filing
                                    assistance.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
