import { notFound } from 'next/navigation';
import { readFile } from 'fs/promises';
import { join } from 'path';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import CodeBlock from '@/components/CodeBlock';
import { getBlogPost } from '@/blog/registry';
import { strings } from '../../constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import ViewTracker from '@/components/ViewTracker';
import { sql } from '@vercel/postgres';
import { ArrowLeftIcon, EyeIcon, CalendarIcon } from '@heroicons/react/24/outline';

async function getBlogViewCount(slug: string): Promise<number> {
    try {
        const result = await sql`SELECT view_count FROM blog_views WHERE slug = ${slug}`;
        return result.rows.length > 0 ? result.rows[0].view_count : 0;
    } catch (error) {
        console.error('Error fetching view count:', error);
        return 0;
    }
}

interface BlogPostPageProps {
    params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;
    const post = getBlogPost(slug);
    if (!post) notFound();

    const currentViewCount = await getBlogViewCount(slug);
    const displayViewCount = currentViewCount + 1;

    let content: string;
    try {
        const filePath = join(process.cwd(), 'src', 'blog', 'posts', `${slug}.md`);
        content = await readFile(filePath, 'utf-8');
    } catch (error) {
        notFound();
    }

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description || `Read about ${post.title}`,
        author: { '@type': 'Person', name: 'John Leonardo', url: 'https://jdleo.me' },
        datePublished: post.date,
        keywords: post.tags.join(', '),
        url: `https://jdleo.me/blog/${slug}`,
    };

    return (
        <>
            <WebVitals />
            <ViewTracker slug={slug} />
            <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

            <main className='notion-page'>
                {/* Header */}
                <header className='notion-header loaded'>
                    <div className='notion-nav' style={{ justifyContent: 'space-between', maxWidth: '900px' }}>
                        <Link href='/blog' className='notion-nav-link'>
                            <ArrowLeftIcon className='notion-nav-icon' />
                            Back to Blog
                        </Link>
                        <Link href='/' className='notion-nav-link' style={{ fontWeight: 600 }}>
                            {strings.NAME}
                        </Link>
                    </div>
                </header>

                <article className='notion-content loaded' style={{ maxWidth: '900px' }}>
                    {/* Article Header */}
                    <div className='notion-blog-post-header'>
                        <h1 className='notion-blog-post-title'>{post.title}</h1>
                        <div className='notion-blog-post-meta'>
                            <div className='notion-blog-post-meta-item'>
                                <CalendarIcon className='notion-blog-post-meta-icon' />
                                <span>{post.date}</span>
                            </div>
                            <div className='notion-blog-post-meta-item'>
                                <EyeIcon className='notion-blog-post-meta-icon' />
                                <span>{displayViewCount.toLocaleString()} views</span>
                            </div>
                        </div>
                        {post.tags.length > 0 && (
                            <div className='notion-blog-post-tags'>
                                {post.tags.map((tag: string) => (
                                    <span key={tag} className='notion-blog-post-tag'>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className='notion-divider' />

                    {/* Article Content */}
                    <div className='notion-blog-content'>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                code: CodeBlock as any,
                                table: ({ children }) => (
                                    <div className='table-wrapper'>
                                        <table>{children}</table>
                                    </div>
                                ),
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>

                    {/* Footer */}
                    <div className='notion-divider' style={{ marginTop: '48px' }} />
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                        <Link href='/blog' className='notion-action-btn'>
                            <ArrowLeftIcon className='notion-action-icon' />
                            Back to All Posts
                        </Link>
                    </div>

                    <footer className='notion-footer'>
                        © 2026 {strings.NAME}
                    </footer>
                </article>
            </main>
        </>
    );
}
