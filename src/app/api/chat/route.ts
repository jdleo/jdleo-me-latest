import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT =
    process.env.RESUME_SYSTEM_PROMPT +
    `\n-The current date is ${new Date().toLocaleDateString()}\n-(IMPORTANT!) The chat UI displaying this does not support markdown/newlines. Keep that in mind when sending responses.`;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // Convert messages to Anthropic format
        const anthropicMessages = messages.map((msg: { content: string; isUser: boolean }) => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.content,
        }));

        const response = await anthropic.messages.create({
            model: 'google/gemini-2.5-pro-preview',
            max_tokens: 8192,
            system: SYSTEM_PROMPT,
            messages: anthropicMessages,
        });

        return NextResponse.json({
            // @ts-expect-error anthropic types are wrong
            message: response.content[0].text,
        });
    } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json({ error: 'Failed to get response' }, { status: 500 });
    }
}
