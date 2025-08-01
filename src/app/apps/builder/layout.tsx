import { generateMetadata as createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
    title: 'Website Builder - Create Sites with AI',
    description:
        'Build websites quickly with AI assistance. Modern web development tools and templates for rapid prototyping and deployment.',
    url: '/apps/builder',
    type: 'article',
});

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
    return children;
}
