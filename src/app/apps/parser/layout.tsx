import { generateMetadata as createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
    title: 'Resume Parser - AI-Powered Resume Analysis',
    description:
        'Upload a resume and extract structured data with AI parsing. Advanced natural language processing for professional document analysis.',
    url: '/apps/parser',
    type: 'article',
});

export default function ParserLayout({ children }: { children: React.ReactNode }) {
    return children;
}
