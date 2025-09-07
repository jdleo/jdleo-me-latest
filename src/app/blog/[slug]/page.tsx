import { notFound } from 'next/navigation';
import { readFile } from 'fs/promises';
import { join } from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import CodeBlock from '@/components/CodeBlock';
import { getBlogPost } from '@/blog/registry';
import { strings } from '../../constants/strings';
import { Breadcrumbs } from '@/components/SEO/Breadcrumbs';
import ViewTracker from '@/components/ViewTracker';
import { sql } from '@vercel/postgres';

// Fetch view count for a blog post directly from database
async function getBlogViewCount(slug: string): Promise<number> {
    try {
        const result = await sql`
            SELECT view_count FROM blog_views WHERE slug = ${slug}
        `;

        return result.rows.length > 0 ? result.rows[0].view_count : 0;
    } catch (error) {
        console.error('Error fetching view count:', error);
        return 0;
    }
}

interface BlogPostPageProps {
    params: Promise<{ slug: string }>;
}

// Enable ISR - revalidate every hour
export const revalidate = 3600;

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;
    const post = getBlogPost(slug);

    if (!post) {
        notFound();
    }

    // Fetch the current view count and add 1 for display (since we'll increment on load)
    const currentViewCount = await getBlogViewCount(slug);
    const displayViewCount = currentViewCount + 1;

    // Read the markdown file directly (server-side)
    let content: string;
    try {
        const filePath = join(process.cwd(), 'src', 'blog', 'posts', `${slug}.md`);
        content = await readFile(filePath, 'utf-8');
    } catch (error) {
        console.error('Error reading blog post:', error);
        notFound();
    }

    // Generate breadcrumb items
    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'Blog', href: '/blog' },
        { label: post.title, href: `/blog/${slug}` },
    ];

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
            <ViewTracker slug={slug} />
            <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

            <div className='min-h-screen bg-[var(--color-bg-light)] relative'>
                {/* Subtle background gradients */}
                <div
                    className='fixed inset-0 opacity-40 pointer-events-none'
                    style={{
                        background:
                            'radial-gradient(ellipse at 30% 20%, rgba(94, 106, 210, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 60%)',
                    }}
                />

                {/* Strong Navigation Bar */}
                <nav className='nav-container'>
                    <div className='nav-content'>
                        <a href='/' className='nav-logo'>
                            JL
                        </a>
                        <div className='nav-links'>
                            <a href='/apps' className='nav-link'>
                                Apps
                            </a>
                            <a href='/blog' className='nav-link'>
                                Blog
                            </a>
                            <a href='/apps/resume' className='nav-link'>
                                Resume
                            </a>
                            <a
                                href={strings.LINKEDIN_URL}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='nav-link'
                            >
                                LinkedIn
                            </a>
                            <a href={strings.GITHUB_URL} target='_blank' rel='noopener noreferrer' className='nav-link'>
                                GitHub
                            </a>
                        </div>
                    </div>
                </nav>

                <main className='main-content' style={{ paddingTop: 'clamp(3rem, 5vw, 5rem)' }}>
                    <div className='container-responsive'>
                        <div className='max-w-4xl mx-auto'>
                            <Breadcrumbs items={breadcrumbItems} />
                        </div>

                        <article
                            className='max-w-4xl mx-auto animate-reveal animate-reveal-delay-1'
                            itemScope
                            itemType='https://schema.org/BlogPosting'
                        >
                            {/* Article Header */}
                            <header className='glass-card-enhanced p-8 md:p-12 mb-4 text-center relative'>
                                {/* View Count - Top Right */}
                                <div className='absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2 text-small opacity-70'>
                                    <svg
                                        width='16'
                                        height='16'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        className='opacity-60'
                                    >
                                        <path d='M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z' />
                                        <path d='M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' />
                                    </svg>
                                    <span className='font-medium'>{displayViewCount.toLocaleString()} views</span>
                                </div>

                                <h1 className='text-display gradient-text mb-6 leading-tight' itemProp='headline'>
                                    {post.title}
                                </h1>

                                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4 mb-2'>
                                    <time
                                        dateTime={post.date}
                                        itemProp='datePublished'
                                        className='text-small opacity-70 flex items-center justify-center gap-2'
                                    >
                                        <svg
                                            width='14'
                                            height='14'
                                            viewBox='0 0 24 24'
                                            fill='none'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            className='opacity-60'
                                        >
                                            <path d='M8 2v4' />
                                            <path d='M16 2v4' />
                                            <rect width='18' height='18' x='3' y='4' rx='2' />
                                            <path d='M3 10h18' />
                                        </svg>
                                        {(() => {
                                            const [year, month, day] = post.date.split('-');
                                            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                                            return date.toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            });
                                        })()}
                                    </time>

                                    <div className='flex flex-wrap gap-2 justify-center'>
                                        {post.tags.map((tag: string) => (
                                            <span key={tag} className='tech-tag' itemProp='keywords'>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div
                                    itemProp='author'
                                    itemScope
                                    itemType='https://schema.org/Person'
                                    className='hidden'
                                >
                                    <span itemProp='name'>John Leonardo</span>
                                </div>
                            </header>

                            {/* Article Content */}
                            <div className='blog-content max-w-none' itemProp='articleBody'>
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeRaw]}
                                    remarkRehypeOptions={{ passThrough: ['link'] }}
                                    components={{
                                        code: CodeBlock,
                                    }}
                                >
                                    {content}
                                </ReactMarkdown>
                            </div>

                            {/* Article Footer */}
                            <footer className='glass-card-subtle p-6 mt-8 text-center'>
                                <p className='text-small opacity-70 mb-4'>
                                    Thanks for reading! Feel free to reach out if you have any questions or feedback.
                                </p>
                                <div className='flex flex-wrap gap-4 justify-center'>
                                    <a
                                        href={`mailto:${strings.EMAIL}`}
                                        className='button-secondary text-small py-2 px-4 min-h-0'
                                    >
                                        Email Me
                                    </a>
                                    <a
                                        href={strings.LINKEDIN_URL}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='button-secondary text-small py-2 px-4 min-h-0'
                                    >
                                        LinkedIn
                                    </a>
                                </div>
                            </footer>
                        </article>
                    </div>
                </main>
            </div>
        </>
    );
}

// Note: generateStaticParams moved to layout since this is now a client component
