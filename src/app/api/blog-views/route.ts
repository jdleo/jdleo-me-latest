import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';

// Increment view count for a blog post
export async function POST(request: NextRequest) {
    try {
        const { slug } = await request.json();

        if (!slug || typeof slug !== 'string') {
            return NextResponse.json({ error: 'Blog post slug is required' }, { status: 400 });
        }

        // Use the upsert pattern provided by the user
        const result = await sql`
            INSERT INTO blog_views (slug, view_count)
            VALUES (${slug}, 1)
            ON CONFLICT (slug)
            DO UPDATE SET view_count = blog_views.view_count + 1
            RETURNING view_count
        `;

        return NextResponse.json({
            success: true,
            viewCount: result.rows[0].view_count,
            slug,
        });
    } catch (error) {
        console.error('Blog view increment error:', error);
        return NextResponse.json({ error: 'Failed to increment blog view count' }, { status: 500 });
    }
}

// Get view count for a blog post or all blog posts
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (slug) {
            // Get view count for specific blog post
            const result = await sql`
                SELECT view_count FROM blog_views WHERE slug = ${slug}
            `;

            const viewCount = result.rows.length > 0 ? result.rows[0].view_count : 0;

            return NextResponse.json({
                success: true,
                slug,
                viewCount,
            });
        } else {
            // Get view counts for all blog posts
            const result = await sql`
                SELECT slug, view_count FROM blog_views
                ORDER BY view_count DESC
            `;

            return NextResponse.json({
                success: true,
                views: result.rows,
            });
        }
    } catch (error) {
        console.error('Blog views fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch blog view counts' }, { status: 500 });
    }
}
