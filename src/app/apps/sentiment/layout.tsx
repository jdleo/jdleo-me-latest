import { generateMetadata as createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
    title: 'AI Sentiment - Public Sentiment Toward AI Over Time',
    description:
        'Track how public sentiment toward AI shifts week by week, based on 250 news articles classified into 5 categories using a lightweight model.',
    url: '/apps/sentiment',
    type: 'article',
});

export default function SentimentLayout({ children }: { children: React.ReactNode }) {
    return children;
}
