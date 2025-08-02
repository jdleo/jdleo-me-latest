import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { getBlogPost, getAllBlogPosts } from '@/blog/registry';
import { generateMetadata as createMetadata } from '@/lib/metadata';

interface BlogPostPageProps {
    params: Promise<{ slug: string }>;
}

// Generate metadata for each blog post
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
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

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;
    const post = getBlogPost(slug);

    if (!post) {
        notFound();
    }

    // Read the markdown file
    const filePath = join(process.cwd(), 'src', 'blog', 'posts', `${slug}.md`);
    let content: string;

    try {
        content = await readFile(filePath, 'utf-8');
    } catch (error) {
        notFound();
    }

    // Generate structured data for the blog post
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description || `Read about ${post.title}`,
        author: {
            '@type': 'Person',
            name: 'John Leonardo',
            url: 'https://jdleo.me',
        },
        publisher: {
            '@type': 'Person',
            name: 'John Leonardo',
            url: 'https://jdleo.me',
        },
        datePublished: post.date,
        dateModified: post.date,
        keywords: post.tags.join(', '),
        articleSection: 'Technology',
        url: `https://jdleo.me/blog/${slug}`,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://jdleo.me/blog/${slug}`,
        },
    };

    return (
        <>
            <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            <div className='max-w-4xl mx-auto px-4 py-8'>
                <article itemScope itemType='https://schema.org/BlogPosting'>
                    <header className='mb-8'>
                        <h1 className='text-4xl font-bold mb-4' itemProp='headline'>
                            {post.title}
                        </h1>
                        <div className='flex items-center gap-4 text-sm text-gray-500 mb-4'>
                            <time dateTime={post.date} itemProp='datePublished'>
                                {new Date(post.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </time>
                            <div className='flex gap-2'>
                                {post.tags.map(tag => (
                                    <span
                                        key={tag}
                                        className='px-2 py-1 bg-gray-100 rounded-md text-xs'
                                        itemProp='keywords'
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div itemProp='author' itemScope itemType='https://schema.org/Person' className='hidden'>
                            <span itemProp='name'>John Leonardo</span>
                        </div>
                    </header>

                    <div className='prose prose-lg max-w-none' itemProp='articleBody'>
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                </article>
            </div>
        </>
    );
}

// Generate static params for all blog posts
export async function generateStaticParams() {
    const posts = getAllBlogPosts();
    return posts.map(post => ({
        slug: post.slug,
    }));
}
