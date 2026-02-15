type MiniApp = {
    title: string;
    subtitle: string;
    emoji: string;
    href: string;
};

export const apps: MiniApp[] = [
    {
        title: 'AI Chat',
        subtitle: 'Chat with cutting-edge AI models including GPT-5, Claude Sonnet 4, Grok 4, and more.',
        emoji: '💬',
        href: '/apps/chat',
    },
    {
        title: 'Chat w/ John',
        subtitle: "This is an AI/LLM that knows everything about John's resume.",
        emoji: '🤖',
        href: '/apps/resume',
    },
    {
        title: 'AI Sentiment',
        subtitle: 'Track how public sentiment toward AI shifts week by week across 250 news articles.',
        emoji: '🌡️',
        href: '/apps/sentiment',
    },
    {
        title: 'Resume Screen',
        subtitle: 'FOR RECRUITERS: Generate ungooglable screening questions from a resume.',
        emoji: '🕵️',
        href: '/apps/screen',
    },
    {
        title: 'PDF Chat (Embeddings)',
        subtitle: 'Upload any document and chat with it using AI semantic search.',
        emoji: '📚',
        href: '/apps/rag',
    },
    {
        title: 'Knowledge Graph',
        subtitle: 'Construct and chat with dynamic knowledge graphs from any body of text.',
        emoji: '🕸️',
        href: '/apps/knowledge-graph',
    },
    {
        title: 'LLM Serialization',
        subtitle: 'Compare token efficiency across different serialization formats for LLMs.',
        emoji: '🔢',
        href: '/apps/serialization',
    },
    {
        title: 'Link Shortener',
        subtitle: 'Create short links for your URLs with free analytics.',
        emoji: '🔗',
        href: '/apps/link-shortener',
    },
    {
        title: 'AI Diagram Generator',
        subtitle: 'Use human language, and a perfect diagram will be generated for you.',
        emoji: '🪄',
        href: '/apps/diagram',
    },
    {
        title: 'Resume Parser',
        subtitle: 'Upload a resume and extract structured data with AI parsing.',
        emoji: '📄',
        href: '/apps/parser',
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
    {
        title: 'Privacy Scanner',
        subtitle: 'See what websites can learn about you through browser fingerprinting.',
        emoji: '🕵️',
        href: '/apps/privacy',
    },
    {
        title: 'California Tax Calculator',
        subtitle: 'Calculate your CA state income tax, federal tax, and take-home pay with detailed breakdown.',
        emoji: '🧮',
        href: '/apps/california-tax-calculator',
    },
    {
        title: 'Founder Dilution',
        subtitle: 'Simulate startup fundraising rounds and see how your equity evolves from Seed to Exit.',
        emoji: '📈',
        href: '/apps/dilution',
    },
] as const;
