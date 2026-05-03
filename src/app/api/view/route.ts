import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { rows } = await sql`
            SELECT view_count FROM views LIMIT 1
        `;

        return NextResponse.json({ views: rows[0]?.view_count ?? 0 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch views' }, { status: 500 });
    }
}

export async function POST() {
    try {
        const { rows } = await sql`
            UPDATE views SET view_count = view_count + 1 RETURNING view_count
        `;

        return NextResponse.json({ views: rows[0]?.view_count ?? 0 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to increment views' }, { status: 500 });
    }
}
