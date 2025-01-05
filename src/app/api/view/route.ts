import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { rows } = await sql`
      UPDATE views SET view_count = view_count + 1 RETURNING view_count
    `;
        return NextResponse.json({ views: rows[0].view_count });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch views' }, { status: 500 });
    }
}
