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
        title: 'SWE Job Search for New Grads',
        date: '2025-08-02',
        tags: [],
        description: '',
    },
];

export function getBlogPost(slug: string): BlogPost | undefined {
    return blogRegistry.find(post => post.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
    return blogRegistry.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
