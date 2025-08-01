import { generateMetadata as createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
    title: 'Chat with John - AI Resume Assistant',
    description:
        "Interactive AI chatbot that knows everything about John Leonardo's professional experience. Ask questions about his background, skills, and career journey.",
    url: '/apps/resume',
    type: 'article',
});

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
    return children;
}
