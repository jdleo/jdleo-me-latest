import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { getBlogPost } from '@/blog/registry';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const post = getBlogPost(slug);

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Read the markdown file
        const filePath = join(process.cwd(), 'src', 'blog', 'posts', `${slug}.md`);
        const content = await readFile(filePath, 'utf-8');

        return NextResponse.json({ content, post });
    } catch (error) {
        console.error('Error reading blog post:', error);
        return NextResponse.json({ error: 'Failed to read post' }, { status: 500 });
    }
}
