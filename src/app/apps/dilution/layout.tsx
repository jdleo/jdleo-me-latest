import { generateMetadata as createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
    title: 'Founder Dilution - Simulate Startup Fundraising Rounds',
    description:
        'Simulate startup fundraising rounds and see how your equity evolves from Seed to Exit.',
    url: '/apps/dilution',
    type: 'article',
});

export default function DilutionLayout({ children }: { children: React.ReactNode }) {
    return children;
}
