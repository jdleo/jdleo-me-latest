import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'California Tax Calculator | Calculate CA State & Federal Taxes',
    description: 'Free California tax calculator. Calculate your CA state income tax, federal tax, and take-home pay with detailed breakdown. Updated for current tax year.',
    keywords: 'California tax calculator, CA state tax, federal tax calculator, take home pay, income tax, tax breakdown, California income tax rates',
    openGraph: {
        title: 'California Tax Calculator | Calculate CA State & Federal Taxes',
        description: 'Free California tax calculator. Calculate your CA state income tax, federal tax, and take-home pay with detailed breakdown.',
        type: 'website',
        url: 'https://jdleo.me/apps/california-tax-calculator',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'California Tax Calculator | Calculate CA State & Federal Taxes',
        description: 'Free California tax calculator. Calculate your CA state income tax, federal tax, and take-home pay with detailed breakdown.',
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
