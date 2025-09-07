import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: linkId } = await params;

        // Validate link ID format (should be our nanoid format)
        if (!linkId || !/^[A-Za-z0-9]{5}$/.test(linkId)) {
            return new Response('Link not found', { status: 404 });
        }

        // Get the original URL
        const { rows } = await sql`
            SELECT url FROM links WHERE id = ${linkId}
        `;

        if (rows.length === 0) {
            return new Response('Link not found', { status: 404 });
        }

        const originalUrl = rows[0].url;

        // Track the visit (upsert daily count)
        try {
            await sql`
                INSERT INTO link_visits (link_id, visit_date, visit_count)
                VALUES (${linkId}, CURRENT_DATE, 1)
                ON CONFLICT (link_id, visit_date)
                DO UPDATE SET visit_count = link_visits.visit_count + 1
            `;
        } catch (visitError) {
            // Log visit error but don't fail the redirect
            console.error('Failed to track visit:', visitError);
        }

        // Redirect to original URL
        return NextResponse.redirect(originalUrl, {
            status: 302, // Use 302 for temporary redirects
        });
    } catch (error) {
        console.error('Link redirect error:', error);
        return new Response('Internal server error', { status: 500 });
    }
}
