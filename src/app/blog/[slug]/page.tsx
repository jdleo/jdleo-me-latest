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

    const firstHeadingPattern = new RegExp(`^#\\s+${post.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\n+`);
    const renderedContent = content.replace(firstHeadingPattern, '');

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
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC',
        }).format(new Date(date));

    return (
        <>
            <WebVitals />
            <ViewTracker slug={slug} />
            <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

            <main className='el-page'>
                <header className='el-nav'>
                    <Link href='/' className='el-logo' aria-label='John Leonardo home'>
                        John Leonardo
                    </Link>
                    <nav className='el-nav-links' aria-label='Post navigation'>
                        <Link href='/apps' className='el-nav-link'>
                            Apps
                        </Link>
                        <Link href='/blog' className='el-nav-link'>
                            Blog
                        </Link>
                        <Link href='/apps/resume' className='el-nav-link'>
                            Resume
                        </Link>
                        <a href={strings.GITHUB_URL} target='_blank' rel='noreferrer' className='el-nav-link'>
                            GitHub
                        </a>
                    </nav>
                    <div className='el-nav-actions'>
                        <a href={strings.LINKEDIN_URL} target='_blank' rel='noreferrer' className='el-nav-link'>
                            LinkedIn
                        </a>
                        <a href={`mailto:${strings.EMAIL}`} className='el-btn el-btn-dark el-btn-sm'>
                            Contact
                        </a>
                    </div>
                </header>

                <article className='el-article'>
                    <div className='el-article-back'>
                        <Link href='/blog' className='el-back'>
                            <ArrowLeftIcon aria-hidden='true' />
                            Back to blog
                        </Link>
                    </div>

                    <header className='el-article-header'>
                        <div className='el-eyebrow'>
                            <span className='el-eyebrow-label'>Blog</span>
                            <span className='el-eyebrow-date'>
                                <CalendarIcon aria-hidden='true' />
                                {formatDate(post.date)}
                                <span className='el-meta-dot' aria-hidden='true' />
                                <EyeIcon aria-hidden='true' />
                                {displayViewCount.toLocaleString('en-US')} views
                            </span>
                        </div>
                        <h1>{post.title}</h1>
                        {post.description && <p className='el-article-desc'>{post.description}</p>}
                        {post.tags.length > 0 && (
                            <div className='el-tag-row'>
                                {post.tags.map((tag: string) => (
                                    <span key={tag} className='el-tag'>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </header>

                    <div className='el-prose'>
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
                            {renderedContent}
                        </ReactMarkdown>
                    </div>

                    <div className='el-article-footer'>
                        <Link href='/blog' className='el-back'>
                            <ArrowLeftIcon aria-hidden='true' />
                            Back to all posts
                        </Link>
                    </div>
                </article>

                <footer className='el-footer'>
                    <div className='el-footer-inner'>
                        <span className='el-footer-logo'>John Leonardo</span>
                        <div className='el-footer-links'>
                            <a href={strings.GITHUB_URL} target='_blank' rel='noreferrer'>
                                GitHub
                            </a>
                            <a href={strings.LINKEDIN_URL} target='_blank' rel='noreferrer'>
                                LinkedIn
                            </a>
                            <a href={`mailto:${strings.EMAIL}`}>{strings.EMAIL}</a>
                        </div>
                        <span className='el-footer-copy'>© 2026. All rights reserved.</span>
                    </div>
                </footer>
            </main>
        </>
    );
}
