import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { input } = await req.json();

        if (!input) {
            return NextResponse.json({ error: 'Input text is required' }, { status: 400 });
        }

        if (!process.env.OPENROUTER_API_KEY) {
            return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
        }

        const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://jdleo.me',
                'X-Title': 'jdleo.me',
            },
            body: JSON.stringify({
                model: 'openai/text-embedding-3-large',
                input: input
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('OpenRouter embeddings error:', error);
            throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Embeddings generation error:', error);
        return NextResponse.json({ error: 'Failed to generate embeddings' }, { status: 500 });
    }
}
