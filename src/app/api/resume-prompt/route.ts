import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const currentDate = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        const baseInstructions = `
-The current date is ${currentDate}
-(IMPORTANT!) Keep responses concise and conversational. The chat UI supports markdown formatting.`;

        const systemPrompt = process.env.RESUME_SYSTEM_PROMPT
            ? `${process.env.RESUME_SYSTEM_PROMPT}${baseInstructions}`
            : `You are John's personal AI assistant. You have detailed knowledge of his professional background, skills, and experience. Answer questions about John in a helpful, conversational way.${baseInstructions}

Please provide accurate information about John's background when asked.`;

        return NextResponse.json({ systemPrompt });
    } catch (error) {
        console.error('Resume prompt error:', error);
        return NextResponse.json({ error: 'Failed to get resume prompt' }, { status: 500 });
    }
}
