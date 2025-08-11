import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// ELO rating calculation function
function calculateNewElos(
    winnerElo: number,
    loserElo: number,
    kFactor: number = 32
): { winnerNew: number; loserNew: number } {
    const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    const expectedLoser = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

    const winnerNew = Math.round(winnerElo + kFactor * (1 - expectedWinner));
    const loserNew = Math.round(loserElo + kFactor * (0 - expectedLoser));

    return { winnerNew, loserNew };
}

function calculateTieElos(eloA: number, eloB: number, kFactor: number = 32): { newEloA: number; newEloB: number } {
    const expectedA = 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
    const expectedB = 1 / (1 + Math.pow(10, (eloA - eloB) / 400));

    const newEloA = Math.round(eloA + kFactor * (0.5 - expectedA));
    const newEloB = Math.round(eloB + kFactor * (0.5 - expectedB));

    return { newEloA, newEloB };
}

export async function POST(req: Request) {
    try {
        const { modelA, modelB, winner } = await req.json();

        if (!modelA || !modelB || !['A', 'B', 'tie'].includes(winner)) {
            return NextResponse.json({ error: 'Invalid vote data' }, { status: 400 });
        }

        // Get current ELO ratings
        const { rows } = await sql`
            SELECT model_id, elo_rating, total_votes, wins, losses, ties
            FROM llm_leaderboard
            WHERE model_id IN (${modelA}, ${modelB})
        `;

        if (rows.length !== 2) {
            return NextResponse.json({ error: 'Models not found' }, { status: 404 });
        }

        const modelAData = rows.find(row => row.model_id === modelA);
        const modelBData = rows.find(row => row.model_id === modelB);

        if (!modelAData || !modelBData) {
            return NextResponse.json({ error: 'Model data not found' }, { status: 404 });
        }

        let newEloA: number, newEloB: number;
        let aWins = modelAData.wins,
            aLosses = modelAData.losses,
            aTies = modelAData.ties;
        let bWins = modelBData.wins,
            bLosses = modelBData.losses,
            bTies = modelBData.ties;

        if (winner === 'tie') {
            const tieResult = calculateTieElos(modelAData.elo_rating, modelBData.elo_rating);
            newEloA = tieResult.newEloA;
            newEloB = tieResult.newEloB;
            aTies += 1;
            bTies += 1;
        } else if (winner === 'A') {
            const winResult = calculateNewElos(modelAData.elo_rating, modelBData.elo_rating);
            newEloA = winResult.winnerNew;
            newEloB = winResult.loserNew;
            aWins += 1;
            bLosses += 1;
        } else {
            // winner === 'B'
            const winResult = calculateNewElos(modelBData.elo_rating, modelAData.elo_rating);
            newEloA = winResult.loserNew;
            newEloB = winResult.winnerNew;
            aLosses += 1;
            bWins += 1;
        }

        // Update both models in a transaction
        await sql`BEGIN`;

        try {
            await sql`
                UPDATE llm_leaderboard
                SET 
                    elo_rating = ${newEloA},
                    total_votes = total_votes + 1,
                    wins = ${aWins},
                    losses = ${aLosses},
                    ties = ${aTies}
                WHERE model_id = ${modelA}
            `;

            await sql`
                UPDATE llm_leaderboard
                SET 
                    elo_rating = ${newEloB},
                    total_votes = total_votes + 1,
                    wins = ${bWins},
                    losses = ${bLosses},
                    ties = ${bTies}
                WHERE model_id = ${modelB}
            `;

            await sql`COMMIT`;

            return NextResponse.json({
                success: true,
                newRatings: {
                    [modelA]: newEloA,
                    [modelB]: newEloB,
                },
            });
        } catch (error) {
            await sql`ROLLBACK`;
            throw error;
        }
    } catch (error) {
        console.error('Vote processing error:', error);
        return NextResponse.json({ error: 'Failed to process vote' }, { status: 500 });
    }
}
