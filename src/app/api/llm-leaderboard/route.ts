import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { rows } = await sql`
            SELECT model_id, elo_rating, total_votes, wins, losses, ties, created_at, updated_at
            FROM llm_leaderboard
            ORDER BY elo_rating DESC
        `;
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Leaderboard fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }
}
