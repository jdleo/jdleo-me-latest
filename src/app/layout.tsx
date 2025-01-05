import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { strings } from './constants/strings';
import { Author } from 'next/dist/lib/metadata/types/metadata-types';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: strings.NAME,
    description: strings.DESCRIPTION,
    keywords: strings.KEYWORDS as unknown as string[],
    authors: strings.AUTHORS as unknown as Author[],
    openGraph: strings.OPEN_GRAPH as unknown as Metadata['openGraph'],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en'>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
        </html>
    );
}
