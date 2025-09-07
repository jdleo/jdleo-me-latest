import { generateMetadata as createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
    title: 'Link Shortener - Create Short, Memorable Links',
    description:
        'Create short, memorable links for your URLs with custom aliases and analytics. Perfect for social media, marketing campaigns, and sharing long URLs.',
    url: '/apps/link-shortener',
    type: 'article',
});

export default function LinkShortenerLayout({ children }: { children: React.ReactNode }) {
    return children;
}
