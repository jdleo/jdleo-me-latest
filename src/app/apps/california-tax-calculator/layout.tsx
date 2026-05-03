import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '2026 California Tax Calculator | Calculate CA State & Federal Taxes',
    description: 'Free 2026 California tax calculator. Calculate estimated CA state income tax, federal tax, payroll taxes, and take-home pay with detailed breakdown.',
    keywords: 'California tax calculator, CA state tax, federal tax calculator, take home pay, income tax, tax breakdown, California income tax rates',
    openGraph: {
        title: '2026 California Tax Calculator | Calculate CA State & Federal Taxes',
        description: 'Free 2026 California tax calculator. Calculate estimated CA state income tax, federal tax, payroll taxes, and take-home pay with detailed breakdown.',
        type: 'website',
        url: 'https://jdleo.me/apps/california-tax-calculator',
    },
    twitter: {
        card: 'summary_large_image',
        title: '2026 California Tax Calculator | Calculate CA State & Federal Taxes',
        description: 'Free 2026 California tax calculator. Calculate estimated CA state income tax, federal tax, payroll taxes, and take-home pay with detailed breakdown.',
    },
    alternates: {
        canonical: 'https://jdleo.me/apps/california-tax-calculator',
    },
};

export default function CaliforniaTaxCalculatorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
