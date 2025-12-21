'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllBlogPosts } from '@/blog/registry';
import { WebVitals } from '@/components/SEO/WebVitals';

async function getAllBlogViewCounts(): Promise<Record<string, number>> {
    try {
        const response = await fetch('/api/blog-views', { cache: 'no-store' });
        if (!response.ok) return {};
        const data = await response.json();
        if (data.success && data.views) {
            return data.views.reduce((acc: Record<string, number>, view: { slug: string; view_count: number }) => {
                acc[view.slug] = view.view_count;
                return acc;
            }, {});
        }
        return {};
    } catch (error) {
        console.error('Error fetching view counts:', error);
        return {};
    }
}

export default function BlogPage() {
    const posts = getAllBlogPosts();
    const [isLoaded, setIsLoaded] = useState(false);
    const [viewCounts, setViewCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchViewCounts = async () => {
            const counts = await getAllBlogViewCounts();
            setViewCounts(counts);
        };
        fetchViewCounts();
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <WebVitals />
            <main className='min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4 md:p-8 selection:bg-[var(--color-accent)] selection:text-[var(--color-bg)]'>
                <div className='fixed inset-0 overflow-hidden pointer-events-none'>
                    <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(62,175,124,0.03),transparent_60%)]' />
                    <div className='absolute inset-0' style={{
                        backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)',
                        backgroundSize: '32px 32px'
                    }} />
                </div>

                <div className={`w-full max-w-6xl h-[85vh] transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className='terminal-window flex flex-col h-full'>
                        <div className='terminal-header'>
                            <div className='terminal-controls'>
                                <div className='terminal-control red' />
                                <div className='terminal-control yellow' />
                                <div className='terminal-control green' />
                            </div>
                            <div className='terminal-title'>johnleonardo — ~/blog</div>
                        </div>

                        <div className='terminal-split flex-grow overflow-y-auto scrollbar-hide'>
                            {/* Left Pane: Navigation & Archive Info */}
                            <div className='terminal-pane border-r border-[var(--color-border)] hidden md:block'>
                                <div className='mb-12'>
                                    <div className='flex items-center gap-2 mb-6 text-[var(--color-accent)]'>
                                        <span className='terminal-prompt'>➜</span>
                                        <span className='text-sm uppercase tracking-widest font-bold'>Archive</span>
                                    </div>
                                    <nav className='flex flex-col gap-4'>
                                        <Link href='/' className='text-xl hover:text-[var(--color-accent)] transition-colors'>~/home</Link>
                                        <Link href='/apps' className='text-xl hover:text-[var(--color-accent)] transition-colors'>~/apps</Link>
                                        <Link href='/blog' className='text-xl text-[var(--color-accent)] transition-colors'>~/blog</Link>
                                    </nav>
                                </div>

                                <div className='space-y-6'>
                                    <div className='font-mono'>
                                        <span className='text-[var(--color-text)] opacity-70'>$ query --stats</span>
                                        <div className='mt-4 flex flex-col gap-2 text-xs text-[var(--color-text-dim)] font-mono'>
                                            <div className='flex justify-between'>
                                                <span>TOTAL_POSTS:</span>
                                                <span className='text-[var(--color-accent)]'>{posts.length}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>TOTAL_VIEWS:</span>
                                                <span className='text-[var(--color-accent)]'>
                                                    {Object.values(viewCounts).reduce((a, b) => a + b, 0).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>LAST_SYNC:</span>
                                                <span className='text-[var(--color-accent)]'>{new Date().toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='pt-8'>
                                        <div className='text-[10px] text-[var(--color-text-dim)] opacity-40 font-mono tracking-[0.2em] uppercase mb-4'>Technical Notes</div>
                                        <p className='text-[11px] text-[var(--color-text-dim)] leading-relaxed font-mono opacity-60 italic'>
                                            Building in public. Documenting distributed systems, AI research, and high-performance design.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Pane: Blog Post List */}
                            <div className='terminal-pane bg-black/5 flex flex-col p-0 overflow-y-auto scrollbar-hide w-full'>
                                <div className='p-6'>
                                    <div className='flex items-center justify-between mb-8 text-[var(--color-accent)]'>
                                        <div className='flex items-center gap-2 font-mono'>
                                            <span>$ cat index.lst</span>
                                        </div>
                                    </div>

                                    <div className='space-y-1'>
                                        {posts.map((post) => (
                                            <Link
                                                key={post.slug}
                                                href={`/blog/${post.slug}`}
                                                className='group block p-4 border border-transparent hover:border-[var(--color-border)] hover:bg-white/5 rounded-lg transition-all'
                                            >
                                                <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                                                    <div className='space-y-1 min-w-0'>
                                                        <div className='flex items-center gap-3'>
                                                            <span className='text-[var(--color-accent)] font-mono text-sm opacity-0 group-hover:opacity-100 transition-opacity'>&gt;</span>
                                                            <h2 className='text-lg font-bold group-hover:text-[var(--color-accent)] transition-colors truncate'>
                                                                {post.title}
                                                            </h2>
                                                        </div>
                                                        <p className='text-xs text-[var(--color-text-dim)] line-clamp-1 opacity-60 font-mono'>
                                                            {post.description}
                                                        </p>
                                                    </div>
                                                    <div className='flex items-center gap-4 text-[10px] font-mono whitespace-nowrap opacity-40 group-hover:opacity-100 transition-opacity'>
                                                        <span className='uppercase'>{post.date.replace(/-/g, '.')}</span>
                                                        <span className='flex items-center gap-1'>
                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                                <path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                                <circle cx="12" cy="12" r="3" />
                                                            </svg>
                                                            {(viewCounts[post.slug] || 0)}
                                                        </span>
                                                        <span className='text-[var(--color-accent)] group-hover:translate-x-1 transition-transform'>[READ_MORE]</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}

                                        {posts.length === 0 && (
                                            <div className='p-12 text-center font-mono opacity-40 border border-dashed border-[var(--color-border)] rounded-xl'>
                                                <div className='mb-4'>[ERR_EMPTY_SET]</div>
                                                <p className='text-xs uppercase tracking-widest'>No entries found in archive.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer decoration */}
                    <div className='mt-6 px-4 flex items-center justify-between text-[10px] font-mono text-[var(--color-text-dim)] opacity-50 uppercase tracking-[0.2em]'>
                        <div className='flex items-center gap-6'>
                            <div className='flex items-center gap-2'>
                                <div className='w-1.5 h-1.5 rounded-full bg-blue-500' />
                                HTTP/2 200 OK
                            </div>
                            <div>GZIP: ON</div>
                        </div>
                        <div>ARCHIVE_ACCESS: GRANTED</div>
                    </div>
                </div>
            </main>
        </>
    );
}
