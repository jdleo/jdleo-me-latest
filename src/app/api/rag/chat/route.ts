import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
        }

        if (!process.env.OPENROUTER_API_KEY) {
            return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://jdleo.me',
                'X-Title': 'jdleo.me',
            },
            body: JSON.stringify({
                model: 'qwen/qwen3-235b-a22b-2507',
                messages: messages,
                temperature: 0.3, // Lower temperature for more factual responses
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('OpenRouter chat error:', error);
            throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Chat generation error:', error);
        return NextResponse.json({ error: 'Failed to generate chat response' }, { status: 500 });
    }
}
