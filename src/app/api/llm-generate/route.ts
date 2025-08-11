import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    let model = 'unknown'; // Initialize for error logging

    try {
        const requestData = await req.json();
        model = requestData.model;
        const prompt = requestData.prompt;

        if (!model || !prompt) {
            return NextResponse.json({ error: 'Model and prompt are required' }, { status: 400 });
        }

        if (prompt.length > 2000) {
            return NextResponse.json({ error: 'Prompt must be 2000 characters or less' }, { status: 400 });
        }

        console.log(`Generating response for model: ${model}`);

        // Add timeout for reasoning models that might take longer
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
                'X-Title': 'LLM Leaderboard',
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.2,
                max_tokens: 10000,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`OpenRouter API error for ${model}:`, errorText);
            return NextResponse.json({ error: `Failed to generate response for ${model}` }, { status: 500 });
        }

        const data = await response.json();
        console.log(`Response data for ${model}:`, JSON.stringify(data, null, 2));

        // Handle reasoning models that put response in 'reasoning' field
        const message = data.choices?.[0]?.message;
        let content = message?.content || '';

        // If content is empty but reasoning exists, use reasoning instead
        if (!content && message?.reasoning) {
            content = message.reasoning;
            console.log(`Using reasoning field for ${model}`);
        }

        // Fallback if still no content
        if (!content) {
            content = 'No response generated';
        }

        console.log(`Final content for ${model}:`, content.substring(0, 200) + '...');

        return NextResponse.json({ content });
    } catch (error) {
        console.error(`Generation error for ${model}:`, error);
        if (error instanceof Error && error.name === 'AbortError') {
            return NextResponse.json({ error: `Model ${model} timed out (60s limit)` }, { status: 408 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
