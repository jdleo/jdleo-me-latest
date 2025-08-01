import { generateMetadata as createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
    title: 'AI Diagram Generator - Create Perfect Diagrams with Natural Language',
    description:
        'Transform your ideas into beautiful diagrams using AI. Simply describe what you want in plain English and get professionally designed flowcharts, system diagrams, and more.',
    url: '/apps/diagram',
    type: 'article',
});

export default function DiagramLayout({ children }: { children: React.ReactNode }) {
    return children;
}
