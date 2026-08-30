import { generateMetadata as createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
    title: 'Knowledge Graph - Build Graphs from Any Body of Text',
    description:
        'Construct and chat with dynamic knowledge graphs from any body of text.',
    url: '/apps/knowledge-graph',
    type: 'article',
});

export default function KnowledgeGraphLayout({ children }: { children: React.ReactNode }) {
    return children;
}
