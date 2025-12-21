import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT =
    process.env.RESUME_SYSTEM_PROMPT +
    `\n-The current date is ${new Date().toLocaleDateString()}\n-(IMPORTANT!) Keep responses concise and conversational. The chat UI supports markdown formatting.`;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // Convert messages to Anthropic format
        const anthropicMessages = messages.map((msg: { content: string; isUser: boolean }) => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.content,
        }));

        // Create a streaming response
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const messageStream = await anthropic.messages.create({
                        model: 'google/gemini-3-flash-preview',
                        max_tokens: 8192,
                        system: SYSTEM_PROMPT,
                        messages: anthropicMessages,
                        stream: true,
                    });

                    for await (const event of messageStream) {
                        // Handle text delta events to stream the response
                        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                            const chunk = `data: ${JSON.stringify({
                                type: 'content',
                                content: event.delta.text,
                            })}\n\n`;
                            controller.enqueue(new TextEncoder().encode(chunk));
                        }

                        // Handle message completion
                        if (event.type === 'message_stop') {
                            const chunk = `data: ${JSON.stringify({
                                type: 'done',
                            })}\n\n`;
                            controller.enqueue(new TextEncoder().encode(chunk));
                            controller.close();
                            return;
                        }
                    }
                } catch (error) {
                    console.error('Streaming error:', error);
                    const errorChunk = `data: ${JSON.stringify({
                        type: 'error',
                        error: 'Failed to get response',
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
