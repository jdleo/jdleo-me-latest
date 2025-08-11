import { generateMetadata as createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
    title: 'LLM Leaderboard - AI Model Battle Arena & Rankings | Compare GPT, Claude, Gemini & More',
    description:
        'Vote on head-to-head LLM battles between GPT-4, Claude, Gemini, and other AI models. Compare responses side-by-side with ELO ratings to determine the ultimate AI leaderboard. Free community-driven AI model comparison tool.',
    url: '/apps/llm-leaderboard',
    type: 'article',
    tags: [
        'AI',
        'LLM',
        'GPT',
        'Claude',
        'Gemini',
        'Machine Learning',
        'Artificial Intelligence',
        'Model Comparison',
        'ELO Rating',
        'AI Tools',
    ],
});

export default function LLMLeaderboardLayout({ children }: { children: React.ReactNode }) {
    return children;
}
