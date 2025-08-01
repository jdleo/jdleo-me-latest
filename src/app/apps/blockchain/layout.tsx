import { generateMetadata as createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
    title: 'Blockchain 101 - Interactive Blockchain Demo',
    description:
        'Learn how blockchain technology works with this interactive demonstration. Explore mining, hashing, and distributed ledger concepts in a hands-on way.',
    url: '/apps/blockchain',
    type: 'article',
});

export default function BlockchainLayout({ children }: { children: React.ReactNode }) {
    return children;
}
