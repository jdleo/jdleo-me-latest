import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { messages, model } = await req.json();

        if (!process.env.OPENROUTER_API_KEY) {
            return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
        }

        // Convert messages to OpenAI format (OpenRouter uses OpenAI-compatible API)
        // Also enforce 10 message limit on API side for extra protection
        const limitedMessages = messages.slice(-10);
        const openRouterMessages = limitedMessages.map((msg: { content: string; isUser: boolean }) => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.content,
        }));

        // Create a streaming response
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                            'Content-Type': 'application/json',
                            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://jdleo.me',
                            'X-Title': 'jdleo.me',
                        },
                        body: JSON.stringify({
                            model: model,
                            messages: openRouterMessages,
                            stream: true,
                            max_tokens: 4096,
                            temperature: 0.7,
                        }),
                    });

                    if (!response.ok) {
                        throw new Error(`OpenRouter API error: ${response.status}`);
                    }

                    const reader = response.body?.getReader();
                    const decoder = new TextDecoder();

                    if (!reader) {
                        throw new Error('No response body');
                    }

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value, { stream: true });
                        const lines = chunk.split('\n');

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const data = line.slice(6);

                                if (data === '[DONE]') {
                                    const doneChunk = `data: ${JSON.stringify({
                                        type: 'done',
                                    })}\n\n`;
                                    controller.enqueue(new TextEncoder().encode(doneChunk));
                                    controller.close();
                                    return;
                                }

                                try {
                                    const parsed = JSON.parse(data);
                                    const content = parsed.choices?.[0]?.delta?.content;

                                    if (content) {
                                        const contentChunk = `data: ${JSON.stringify({
                                            type: 'content',
                                            content: content,
                                        })}\n\n`;
                                        controller.enqueue(new TextEncoder().encode(contentChunk));
                                    }
                                } catch (parseError) {
                                    // Ignore parsing errors for malformed chunks
                                    continue;
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('OpenRouter streaming error:', error);
                    const errorChunk = `data: ${JSON.stringify({
                        type: 'error',
                        error: 'Failed to get response from AI model',
                    })}\n\n`;
                    controller.enqueue(new TextEncoder().encode(errorChunk));
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
            },
        });
    } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json({ error: 'Failed to get response' }, { status: 500 });
    }
}
