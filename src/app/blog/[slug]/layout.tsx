import { Metadata } from 'next';
import { getBlogPost, getAllBlogPosts } from '@/blog/registry';
import { generateMetadata as createMetadata } from '@/lib/metadata';

interface BlogPostLayoutProps {
    params: Promise<{ slug: string }>;
    children: React.ReactNode;
}

// Generate metadata for each blog post
export async function generateMetadata({ params }: BlogPostLayoutProps): Promise<Metadata> {
    const { slug } = await params;
    const post = getBlogPost(slug);

    if (!post) {
        return createMetadata({
            title: 'Post Not Found',
            description: 'The requested blog post could not be found.',
            noIndex: true,
        });
    }

    return createMetadata({
        title: post.title,
        description: post.description || `Read about ${post.title} - ${post.tags.join(', ')}`,
        url: `/blog/${slug}`,
        type: 'article',
        publishedTime: post.date,
        tags: post.tags,
    });
}

// Generate static params for all blog posts
export async function generateStaticParams() {
    const posts = getAllBlogPosts();
    return posts.map(post => ({
        slug: post.slug,
    }));
}

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
