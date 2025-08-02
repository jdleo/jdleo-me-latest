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
        date: '2025-08-02',
        tags: ['welcome', 'blog', 'jdleo'],
        description: 'Welcome to my blog!',
    },
];

export function getBlogPost(slug: string): BlogPost | undefined {
    return blogRegistry.find(post => post.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
    return blogRegistry.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
