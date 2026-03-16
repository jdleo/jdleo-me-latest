import { notFound } from 'next/navigation';
import { readFile } from 'fs/promises';
import { join } from 'path';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ArrowLeftIcon, CalendarIcon, EyeIcon } from '@heroicons/react/24/outline';
import { sql } from '@vercel/postgres';
import CodeBlock from '@/components/CodeBlock';
import { getBlogPost } from '@/blog/registry';
import { strings } from '../../constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import ViewTracker from '@/components/ViewTracker';

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

    const formatDate = (date: string) =>
        new Intl.DateTimeFormat('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        }).format(new Date(date));

    return (
        <>
            <WebVitals />
            <ViewTracker slug={slug} />
            <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

            <main className='obsidian-home obsidian-home-blog'>
                <div className='obsidian-orb obsidian-orb-left' />
                <div className='obsidian-orb obsidian-orb-right' />

                <article className='obsidian-sheet is-loaded'>
                    <header className='obsidian-topbar'>
                        <Link href='/' className='obsidian-wordmark'>
                            {strings.NAME}
                        </Link>
                        <nav className='obsidian-nav' aria-label='Post navigation'>
                            <Link href='/blog' className='obsidian-nav-link'>
                                Blog
                            </Link>
                            <Link href='/apps' className='obsidian-nav-link'>
                                Apps
                            </Link>
                            <Link href='/apps/resume' className='obsidian-nav-link'>
                                Resume
                            </Link>
                        </nav>
                    </header>

                    <div className='obsidian-back-row'>
                        <Link href='/blog' className='obsidian-back-link'>
                            <ArrowLeftIcon className='obsidian-inline-icon' />
                            Back to blog
                        </Link>
                    </div>

                    <header className='obsidian-post-header'>
                        <h1 className='obsidian-post-title'>{post.title}</h1>
                        <div className='obsidian-entry-header'>
                            <span className='obsidian-post-meta-item'>
                                <CalendarIcon className='obsidian-entry-icon' />
                                {formatDate(post.date)}
                            </span>
                            <span className='obsidian-post-meta-item'>
                                <EyeIcon className='obsidian-entry-icon' />
                                {displayViewCount.toLocaleString('en-US')} views
                            </span>
                        </div>
                        {post.description && <p className='obsidian-post-description'>{post.description}</p>}
                        {post.tags.length > 0 && (
                            <div className='obsidian-tag-row'>
                                {post.tags.map((tag: string) => (
                                    <span key={tag} className='obsidian-tag'>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </header>

                    <div className='obsidian-prose'>
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

                    <div className='obsidian-post-footer'>
                        <Link href='/blog' className='obsidian-back-link'>
                            <ArrowLeftIcon className='obsidian-inline-icon' />
                            Back to all posts
                        </Link>
                    </div>

                    <footer className='obsidian-footer'>© 2026 {strings.NAME}</footer>
                </article>
            </main>
        </>
    );
}
