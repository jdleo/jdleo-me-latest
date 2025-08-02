import Link from 'next/link';
import { Metadata } from 'next';
import { getAllBlogPosts } from '@/blog/registry';
import { generateMetadata as createMetadata } from '@/lib/metadata';

export const metadata: Metadata = createMetadata({
    title: 'Blog',
    description: 'Technical insights, tutorials, and thoughts on software development from a Senior Software Engineer.',
    url: '/blog',
    type: 'website',
});

export default function BlogPage() {
    const posts = getAllBlogPosts();

    return (
        <div className='max-w-4xl mx-auto px-4 py-8'>
            <h1 className='text-4xl font-bold mb-8'>Blog</h1>

            <div className='space-y-6'>
                {posts.map(post => (
                    <article key={post.slug} className='border-b border-gray-200 pb-6'>
                        <Link href={`/blog/${post.slug}`} className='block hover:opacity-75 transition-opacity'>
                            <h2 className='text-2xl font-semibold mb-2'>{post.title}</h2>
                            <p className='text-gray-600 mb-2'>{post.description}</p>
                            <div className='flex items-center gap-4 text-sm text-gray-500'>
                                <time dateTime={post.date}>
                                    {new Date(post.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </time>
                                <div className='flex gap-2'>
                                    {post.tags.map(tag => (
                                        <span key={tag} className='px-2 py-1 bg-gray-100 rounded-md text-xs'>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </Link>
                    </article>
                ))}
            </div>
        </div>
    );
}
