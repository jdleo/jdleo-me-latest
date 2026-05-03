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
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        }).format(new Date(date));

    return (
        <>
            <WebVitals />
            <ViewTracker slug={slug} />
            <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

            <main className='jd-home jd-blog-home is-loaded'>
                <header className='jd-nav-wrap'>
                    <Link href='/' className='jd-logo' aria-label='John Leonardo home'>
                        {strings.NAME}
                    </Link>
                    <nav className='jd-nav' aria-label='Post navigation'>
                        <Link href='/blog' className='jd-nav-link'>
                            Blog
                        </Link>
                        <Link href='/apps' className='jd-nav-link'>
                            Apps
                        </Link>
                        <Link href='/apps/resume' className='jd-nav-link'>
                            Resume
                        </Link>
                        <a href={strings.GITHUB_URL} target='_blank' rel='noreferrer' className='jd-nav-link'>
                            GitHub
                        </a>
                    </nav>
                    <div className='jd-nav-actions'>
                        <a href={strings.LINKEDIN_URL} target='_blank' rel='noreferrer' className='jd-login'>
                            LinkedIn
                        </a>
                        <a href={`mailto:${strings.EMAIL}`} className='jd-top-cta'>
                            Contact
                        </a>
                    </div>
                </header>

                <article className='jd-article-shell'>
                    <div className='jd-back-row'>
                        <Link href='/blog' className='jd-back-link'>
                            <ArrowLeftIcon aria-hidden='true' />
                            Back to blog
                        </Link>
                    </div>

                    <header className='jd-article-header'>
                        <Link href='/blog' className='jd-pill'>
                            Blog
                        </Link>
                        <h1>{post.title}</h1>
                        <div className='jd-post-meta'>
                            <span>
                                <CalendarIcon aria-hidden='true' />
                                {formatDate(post.date)}
                            </span>
                            <span>
                                <EyeIcon aria-hidden='true' />
                                {displayViewCount.toLocaleString('en-US')} views
                            </span>
                        </div>
                        {post.description && <p>{post.description}</p>}
                        {post.tags.length > 0 && (
                            <div className='jd-tag-row'>
                                {post.tags.map((tag: string) => (
                                    <span key={tag} className='jd-tag'>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </header>

                    <div className='jd-prose'>
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

                    <div className='jd-post-footer'>
                        <Link href='/blog' className='jd-back-link'>
                            <ArrowLeftIcon aria-hidden='true' />
                            Back to all posts
                        </Link>
                    </div>

                    <footer className='jd-footer jd-article-footer'>
                        <span>© 2026 {strings.NAME}</span>
                        <a href={`mailto:${strings.EMAIL}`}>{strings.EMAIL}</a>
                    </footer>
                </article>
            </main>
        </>
    );
}
