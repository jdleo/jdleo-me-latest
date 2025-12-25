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

            <main className='relative min-h-screen overflow-hidden selection:bg-[var(--purple-2)] selection:text-[var(--purple-4)]'>
                {/* Floating Decorations */}
                <div className='float-decoration float-1' />
                <div className='float-decoration float-2' />

                {/* Return Navigation */}
                <header className='fixed top-0 left-0 right-0 z-50 px-6 py-4 pointer-events-none'>
                    <div className='max-w-6xl mx-auto flex justify-between items-center pointer-events-auto'>
                        <Link
                            href='/blog'
                            className='group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted hover:text-[var(--purple-4)] transition-colors'
                        >
                            <span className='group-hover:-translate-x-1 transition-transform'>←</span>
                            Back to Blog
                        </Link>

                        <Link href='/' className='text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--fg-4)] hover:text-[var(--purple-4)] transition-colors'>
                            {strings.NAME}
                        </Link>
                    </div>
                </header>

                <article className='container mx-auto px-6 pt-32 pb-20 animate-reveal'>
                    <div className='max-w-3xl mx-auto'>
                        {/* Article Header */}
                        <header className='mb-12 text-center'>
                            <div className='flex items-center justify-center gap-3 mb-6'>
                                <span className='px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[var(--purple-1)] text-[var(--purple-4)] border border-[var(--purple-a2)]'>
                                    Article
                                </span>
                                <span className='text-[10px] font-bold uppercase tracking-widest text-muted'>
                                    {post.date}
                                </span>
                            </div>

                            <h1 className='text-3xl md:text-5xl font-extrabold mb-6 leading-tight text-[var(--fg-4)]'>
                                {post.title}
                            </h1>

                            <div className='flex items-center justify-center gap-6 text-xs font-bold text-muted'>
                                <div className='flex items-center gap-2'>
                                    <div className='w-2 h-2 rounded-full bg-[var(--blue-4)]' />
                                    <span>John Leonardo</span>
                                </div>
                                <span>•</span>
                                <span>{displayViewCount.toLocaleString()} views</span>
                            </div>
                        </header>

                        {/* Article Content */}
                        <div className='card p-8 md:p-12 mb-12 blog-content'>
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

                        {/* Footer / Tags */}
                        <div className='flex flex-wrap gap-2 justify-center mb-16'>
                            {post.tags.map((tag: string) => (
                                <span key={tag} className='px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white border-2 border-[var(--border-light)] text-muted'>
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        {/* Article Footer */}
                        <footer className='py-12 border-t border-[var(--border-light)] text-center'>
                            <Link
                                href='/blog'
                                className='btn btn-secondary inline-flex px-8 py-3 text-xs'
                            >
                                Read More Articles
                            </Link>
                        </footer>
                    </div>
                </article>
            </main>
        </>
    );
}
