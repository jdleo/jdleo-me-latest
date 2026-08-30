import { generateMetadata as createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
    title: 'Resume Screen - Generate Unguessable Screening Questions',
    description:
        'For recruiters: generate ungooglable screening questions from any resume to verify candidate claims.',
    url: '/apps/screen',
    type: 'article',
});

export default function ScreenLayout({ children }: { children: React.ReactNode }) {
    return children;
}
