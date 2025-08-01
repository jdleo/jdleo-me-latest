import { generateMetadata as createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
    title: 'Hash Lab - Convert Text Between Hash Algorithms',
    description:
        'Convert text between different hash algorithms instantly. Explore MD5, SHA-1, SHA-256, and other cryptographic hash functions.',
    url: '/apps/hash',
    type: 'article',
});

export default function HashLayout({ children }: { children: React.ReactNode }) {
    return children;
}
