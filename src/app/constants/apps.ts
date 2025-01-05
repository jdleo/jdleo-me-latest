type MiniApp = {
    title: string;
    subtitle: string;
    emoji: string;
    href: string;
};

export const apps: MiniApp[] = [
    {
        title: 'Chat w/ John',
        subtitle: "This is an AI/LLM that knows everything about John's resume.",
        emoji: '🤖',
        href: '/apps/resume',
    },
    {
        title: 'Color Gamble',
        subtitle: 'Test your luck with this simple but addictive color betting game.',
        emoji: '🎲',
        href: '/apps/gamble',
    },
    {
        title: 'Sort Viz',
        subtitle: 'Watch and learn how different sorting algorithms work in real-time.',
        emoji: '📊',
        href: '/apps/sort',
    },
    {
        title: 'Blockchain 101',
        subtitle: 'Interactive demo showing how blockchain technology actually works.',
        emoji: '⛓️',
        href: '/apps/blockchain',
    },
    {
        title: 'Hash Lab',
        subtitle: 'Convert text between different hash algorithms instantly.',
        emoji: '🔐',
        href: '/apps/hash',
    },
] as const;
