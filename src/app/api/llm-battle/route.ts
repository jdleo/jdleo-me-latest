import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Get two random models for battle
export async function GET() {
    try {
        const { rows } = await sql`
            SELECT model_id FROM llm_leaderboard
            ORDER BY RANDOM()
            LIMIT 2
        `;

        if (rows.length < 2) {
            return NextResponse.json({ error: 'Not enough models available' }, { status: 500 });
        }

        return NextResponse.json({
            modelA: rows[0].model_id,
            modelB: rows[1].model_id,
        });
    } catch (error) {
        console.error('Battle setup error:', error);
        return NextResponse.json({ error: 'Failed to setup battle' }, { status: 500 });
    }
}
