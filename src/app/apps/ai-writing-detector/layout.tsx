import { generateMetadata as createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
    title: 'AI Writing Detector - Estimate if Text Was AI-Written',
    description:
        'Paste any text and get an estimated % chance it was AI-generated, with concrete reasons why — or why not.',
    url: '/apps/ai-writing-detector',
    type: 'article',
});

export default function AIDetectorLayout({ children }: { children: React.ReactNode }) {
    return children;
}
