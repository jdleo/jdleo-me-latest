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
                stream: true,
                reasoning: {
                    enabled: true,
                    effort: 'low',
                    exclude: true,
                },
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`OpenRouter API error for ${model}:`, errorText);

            // For streaming, we need to return a stream even for errors
            const errorStream = new ReadableStream({
                start(controller) {
                    const errorChunk = `data: ${JSON.stringify({
                        type: 'error',
                        error: `Failed to generate response for ${model}`,
                    })}\n\n`;
                    controller.enqueue(new TextEncoder().encode(errorChunk));
                    controller.close();
                },
            });

            return new Response(errorStream, {
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                    'Cache-Control': 'no-cache',
                    Connection: 'keep-alive',
                },
            });
        }

        // Create streaming response
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const reader = response.body?.getReader();
                    const decoder = new TextDecoder();

                    if (!reader) {
                        throw new Error('No response body');
                    }

                    let accumulatedContent = '';

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
                                        content: accumulatedContent,
                                    })}\n\n`;
                                    controller.enqueue(new TextEncoder().encode(doneChunk));
                                    controller.close();
                                    return;
                                }

                                try {
                                    const parsed = JSON.parse(data);
                                    const content = parsed.choices?.[0]?.delta?.content;
                                    const usage = parsed.usage;

                                    if (content) {
                                        accumulatedContent += content;
                                        const contentChunk = `data: ${JSON.stringify({
                                            type: 'content',
                                            content: content,
                                        })}\n\n`;
                                        controller.enqueue(new TextEncoder().encode(contentChunk));
                                    }

                                    // Send usage data if available (typically at the end of stream)
                                    if (usage) {
                                        const usageChunk = `data: ${JSON.stringify({
                                            type: 'usage',
                                            usage: usage,
                                        })}\n\n`;
                                        controller.enqueue(new TextEncoder().encode(usageChunk));
                                    }
                                } catch (parseError) {
                                    // Ignore parsing errors for malformed chunks
                                    continue;
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Streaming error for ${model}:`, error);
                    const errorChunk = `data: ${JSON.stringify({
                        type: 'error',
                        error: 'Failed to stream response',
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
        console.error(`Generation error for ${model}:`, error);

        // For streaming, return error as a stream
        const errorStream = new ReadableStream({
            start(controller) {
                let errorMessage = 'Internal server error';
                if (error instanceof Error && error.name === 'AbortError') {
                    errorMessage = `Model ${model} timed out (60s limit)`;
                }

                const errorChunk = `data: ${JSON.stringify({
                    type: 'error',
                    error: errorMessage,
                })}\n\n`;
                controller.enqueue(new TextEncoder().encode(errorChunk));
                controller.close();
            },
        });

        return new Response(errorStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
            },
        });
    }
}
