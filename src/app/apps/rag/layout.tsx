import { generateMetadata as createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
    title: 'PDF Chat - Chat with Any Document Using AI Semantic Search',
    description:
        'Upload any document and chat with it using AI semantic search and embeddings.',
    url: '/apps/rag',
    type: 'article',
});

export default function RagLayout({ children }: { children: React.ReactNode }) {
    return children;
}
