import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { generateMetadata as createMetadata, personStructuredData, websiteStructuredData } from '@/lib/metadata';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
    display: 'swap',
    preload: true,
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
    display: 'swap',
    preload: false,
});

export const metadata: Metadata = createMetadata();

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    themeColor: '#5e6ad2',
    colorScheme: 'light',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en'>
            <head>
                <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: personStructuredData }} />
                <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: websiteStructuredData }} />
                <link rel='preconnect' href='https://fonts.googleapis.com' />
                <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
                <link rel='dns-prefetch' href='https://vercel.com' />
                <link rel='dns-prefetch' href='https://vitals.vercel-analytics.com' />
                <link rel='manifest' href='/manifest.json' />
                <link rel='apple-touch-icon' href='/og-image.png' />
                <meta name='apple-mobile-web-app-capable' content='yes' />
                <meta name='apple-mobile-web-app-status-bar-style' content='default' />
                <meta name='mobile-web-app-capable' content='yes' />
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                {children}
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
}
