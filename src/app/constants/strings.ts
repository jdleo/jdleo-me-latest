export const strings = {
    NAME: 'John Leonardo',
    DESCRIPTION:
        'Senior Software Engineer specializing in distributed systems, high-scale architectures, and AI services. Experience at Amazon (Search Science) and IBM (iX). Expert in Java, Python, TypeScript, Rust, Go, and AWS.',
    SUBTITLE:
        '👋 Hey there! I build distributed systems @ Amazon (search science). Previously IBM. I can build pretty much anything - from high scale APIs to AI services to blockchain stuff. Fluent in Java, Python, TypeScript, Rust, Go, Elixir and everything AWS. Feel free to email me below or check out some fun mini apps.',
    KEYWORDS: [
        'software engineer',
        'distributed systems',
        'aws',
        'amazon',
        'ibm',
        'search science',
        'system design',
        'backend engineer',
        'full stack',
        'ai engineering',
        'high scale',
        'typescript',
        'rust',
        'go',
        'java',
    ],
    AUTHORS: [{ name: 'John Leonardo', url: 'https://jdleo.me' }],
    OPEN_GRAPH: {
        type: 'website',
        title: 'John Leonardo | Senior Software Engineer',
        description: 'Building scalable distributed systems and AI services at Amazon. Previously IBM.',
        url: 'https://jdleo.me',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
            },
        ],
        twitter: {
            card: 'summary_large_image',
            title: 'John Leonardo',
            description: 'Software Engineer & Builder',
            images: ['/og-image.png'],
        },
    },
    LINKEDIN_URL: 'https://linkedin.com/in/jdleo',
    GITHUB_URL: 'https://github.com/jdleo',
    EMAIL: 'j@jdleo.me',
} as const;
