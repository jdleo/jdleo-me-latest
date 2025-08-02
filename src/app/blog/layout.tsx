import { Metadata } from 'next';
import { generateMetadata as createMetadata } from '@/lib/metadata';

export const metadata: Metadata = createMetadata({
    title: 'Blog',
    description: 'Technical insights, tutorials, and thoughts on software development from a Senior Software Engineer.',
    url: '/blog',
    type: 'website',
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
