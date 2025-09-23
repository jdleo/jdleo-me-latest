export interface BlogPost {
    slug: string;
    title: string;
    date: string;
    tags: string[];
    description?: string;
}

export const blogRegistry: BlogPost[] = [
    {
        slug: 'first-post',
        title: 'Welcome to My Blog',
        date: '2025-06-09',
        tags: ['welcome', 'blog', 'jdleo'],
        description: 'Welcome to my blog!',
    },
    {
        slug: 'transformers-are-limited',
        title: 'Transformers are Limited',
        date: '2025-08-01',
        tags: ['transformers', 'limitation', 'reasoning', 'llm'],
        description: 'The transformer architecture is fundamentally limited for true reasoning.',
    },
    {
        slug: 'new-grad-swe-search',
        title: 'New Grad Job Search for Software Engineers',
        date: '2025-08-02',
        tags: ['career', 'job search', 'new grad', 'software engineering', 'tech industry'],
        description:
            'A quick guide for new grads looking to break into the software engineering industry, including networking tips, technical preparation advice, and insights into why the current job market is more challenging.',
    },
    {
        slug: 'semantic-diversity-benchmark',
        title: 'The Semantic Diversity Benchmark: A New Way to Test AI Language Models',
        date: '2025-08-31',
        tags: ['ai', 'llm', 'benchmark', 'semantic diversity', 'language models', 'experiment'],
        description:
            'A simple but powerful benchmark for testing AI language models by asking them to generate maximally semantically unrelated words, revealing surprising insights about model capabilities.',
    },
    {
        slug: 'nutrition-benchmark',
        title: 'The Nutrition Prediction Benchmark: Testing LLMs on Google Cafeteria Menus',
        date: '2025-09-07',
        tags: ['ai', 'llm', 'benchmark', 'nutrition', 'google', 'experiment'],
        description:
            "Testing large language models on their ability to predict accurate nutritional information from Google cafeteria dishes, revealing surprising insights about AI's understanding of food science.",
    },
    {
        slug: 'clash-royale-ai-deck-prediction',
        title: 'I Trained AI on 70k Clash Royale Battles to Settle the Ultimate Debate: Does Your Deck Actually Matter?',
        date: '2025-09-14',
        tags: [
            'ai',
            'machine learning',
            'clash royale',
            'game analysis',
            'data science',
            'lightgbm',
            'pytorch',
            'decks',
            'experiment',
        ],
        description:
            "Using machine learning on 70,000+ real battles from the Clash Royale API to definitively answer whether deck composition actually predicts victory, or if it's just skill and luck.",
    },
    {
        slug: 'are-computer-science-majors-cooked',
        title: 'Are Computer Science Majors "Cooked" because of AI?',
        date: '2025-09-22',
        tags: [],
        description: 'A speculative deep dive on whether AI will augment or replace new software engineers.',
    },
];

export function getBlogPost(slug: string): BlogPost | undefined {
    return blogRegistry.find(post => post.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
    return blogRegistry.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
