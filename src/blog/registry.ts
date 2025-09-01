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
        title: 'Transformers Are Limited',
        date: '2025-08-01',
        tags: ['transformers', 'limitation', 'reasoning', 'llm'],
        description: 'Transformer Architecture Is Fundamentally Limited for True Reasoning',
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
];

export function getBlogPost(slug: string): BlogPost | undefined {
    return blogRegistry.find(post => post.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
    return blogRegistry.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
