import { generateMetadata as createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
    title: 'LLM Serialization - Compare Token Efficiency Across Formats',
    description:
        'Compare token efficiency across different serialization formats for LLM contexts.',
    url: '/apps/serialization',
    type: 'article',
});

export default function SerializationLayout({ children }: { children: React.ReactNode }) {
    return children;
}
