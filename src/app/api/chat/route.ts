import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

const SYSTEM_PROMPT =
    process.env.RESUME_SYSTEM_PROMPT +
    `\n-The current date is ${new Date().toLocaleDateString()}\n-(IMPORTANT!) The chat UI displaying this does not support markdown/newlines. Keep that in mind when sending responses.`;

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            messages: [{ role: 'user', content: message }],
        });

        return NextResponse.json({
            message: response.content[0].text,
        });
    } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json({ error: 'Failed to get response' }, { status: 500 });
    }
}
