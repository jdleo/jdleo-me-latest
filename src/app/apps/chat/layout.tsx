import { generateMetadata as createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
    title: 'AI Chat - Multi-Model Chat Interface',
    description:
        'Chat with multiple AI models for free. Compare responses from different language models including GPT, Claude, and more in a single interface.',
    url: '/apps/chat',
    type: 'article',
});

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    return children;
}
