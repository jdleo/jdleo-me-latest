import { generateMetadata as createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
    title: 'Color Gamble - Test Your Luck',
    description:
        'Test your luck with this simple but addictive color betting game. A fun interactive game built with modern web technologies.',
    url: '/apps/gamble',
    type: 'article',
});

export default function GambleLayout({ children }: { children: React.ReactNode }) {
    return children;
}
