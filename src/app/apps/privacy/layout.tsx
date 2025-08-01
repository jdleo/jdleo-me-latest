import { generateMetadata as createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
    title: 'Privacy Scanner - Browser Fingerprinting Demo',
    description:
        'See what websites can learn about you through browser fingerprinting. Interactive demonstration of digital privacy and tracking techniques.',
    url: '/apps/privacy',
    type: 'article',
});

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
    return children;
}
