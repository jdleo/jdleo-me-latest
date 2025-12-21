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

            <main className='min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4 md:p-8 selection:bg-[var(--color-accent)] selection:text-[var(--color-bg)]'>
                <div className='fixed inset-0 overflow-hidden pointer-events-none'>
                    <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(62,175,124,0.03),transparent_60%)]' />
                    <div className='absolute inset-0' style={{
                        backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)',
                        backgroundSize: '32px 32px'
                    }} />
                </div>

                <div className='w-full max-w-6xl h-[90vh] animate-reveal'>
                    <div className='terminal-window flex flex-col h-full'>
                        <div className='terminal-header'>
                            <div className='terminal-controls'>
                                <div className='terminal-control red' />
                                <div className='terminal-control yellow' />
                                <div className='terminal-control green' />
                            </div>
                            <div className='terminal-title'>johnleonardo — ~/blog/{slug}.md</div>
                        </div>

                        <div className='terminal-split flex-grow overflow-hidden'>
                            {/* Sidebar: Metadata & Navigation */}
                            <div className='terminal-pane border-r border-[var(--color-border)] hidden lg:block'>
                                <nav className='mb-12 flex flex-col gap-3'>
                                    <Link href='/blog' className='text-lg hover:text-[var(--color-accent)] transition-colors inline-flex items-center gap-2'>
                                        <span className='opacity-50 font-mono'>&lt;</span> ~/blog
                                    </Link>
                                    <Link href='/apps' className='text-lg hover:text-[var(--color-accent)] transition-colors inline-flex items-center gap-2'>
                                        <span className='opacity-50 font-mono'>&lt;</span> ~/apps
                                    </Link>
                                </nav>

                                <div className='space-y-8'>
                                    <div className='font-mono'>
                                        <div className='text-[var(--color-text)] opacity-40 text-[10px] uppercase tracking-widest mb-4'>File Metadata</div>
                                        <div className='space-y-3 text-xs text-[var(--color-text-dim)]'>
                                            <div className='flex justify-between border-b border-[var(--color-border)] pb-2'>
                                                <span>CREATED</span>
                                                <span className='text-[var(--color-text)]'>{post.date.replace(/-/g, '.')}</span>
                                            </div>
                                            <div className='flex justify-between border-b border-[var(--color-border)] pb-2'>
                                                <span>VIEWS</span>
                                                <span className='text-[var(--color-text)]'>{displayViewCount.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between border-b border-[var(--color-border)] pb-2'>
                                                <span>TYPE</span>
                                                <span className='text-[var(--color-text)]'>MARKDOWN</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='font-mono'>
                                        <div className='text-[var(--color-text)] opacity-40 text-[10px] uppercase tracking-widest mb-4'>Tags</div>
                                        <div className='flex flex-wrap gap-2'>
                                            {post.tags.map((tag: string) => (
                                                <span key={tag} className='px-2 py-0.5 bg-white/5 border border-[var(--color-border)] rounded text-[10px] text-[var(--color-accent)] uppercase'>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className='pt-8 border-t border-[var(--color-border)]'>
                                        <a href={`mailto:${strings.EMAIL}`} className='block w-full text-center py-2 px-4 border border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-mono transition-all rounded'>
                                            [SEND_FEEDBACK]
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Main Post Content */}
                            <div className='terminal-pane bg-black/5 flex-grow overflow-y-auto scrollbar-hide'>
                                <article className='max-w-4xl mx-auto py-12 px-6 md:px-12'>
                                    <header className='mb-16 pb-8 border-b border-[var(--color-border)]'>
                                        <h1 className='text-4xl md:text-5xl font-bold text-[var(--color-text)] leading-tight mb-8'>
                                            {post.title}
                                        </h1>
                                        <div className='flex items-center gap-6 text-xs font-mono text-[var(--color-text-dim)] opacity-60'>
                                            <div className='flex items-center gap-2'>
                                                <div className='w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]' />
                                                WRITTEN BY JOHN LEONARDO
                                            </div>
                                            <div className='md:hidden'>
                                                {post.date.replace(/-/g, '.')}
                                            </div>
                                        </div>
                                    </header>

                                    <div className='font-mono text-sm leading-relaxed text-[var(--color-text-dim)]'>
                                        <div className='prose prose-invert prose-sm max-w-none'>
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                rehypePlugins={[rehypeRaw]}
                                                components={{
                                                    code: CodeBlock as any,
                                                }}
                                            >
                                                {content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>

                                    <footer className='mt-24 pt-8 border-t border-[var(--color-border)]'>
                                        <div className='flex flex-col md:flex-row md:items-center justify-between gap-8 opacity-60'>
                                            <div className='text-xs font-mono'>
                                                EOF // END OF CONTENT
                                            </div>
                                            <div className='flex items-center gap-4'>
                                                <Link href='/blog' className='text-xs font-mono hover:text-[var(--color-accent)] transition-colors'>~/archive</Link>
                                                <Link href='/' className='text-xs font-mono hover:text-[var(--color-accent)] transition-colors'>~/root</Link>
                                            </div>
                                        </div>
                                    </footer>
                                </article>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
