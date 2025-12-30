import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        if (!process.env.OPENROUTER_API_KEY) {
            return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
        }

        if (!text || typeof text !== 'string') {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // Split text into chunks of 5000 words with 10% overlap
        const words = text.split(/\s+/);
        const chunkSize = 5000;
        const overlapSize = Math.floor(chunkSize * 0.1); // 10% overlap = 100 words
        const stride = chunkSize - overlapSize;

        const chunks: string[] = [];
        for (let i = 0; i < words.length; i += stride) {
            const end = Math.min(i + chunkSize, words.length);
            const chunkText = words.slice(i, end).join(' ');
            chunks.push(chunkText);
            if (end === words.length) break;
        }

        // Create a streaming response
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const systemPrompt = `You are an API which constructs knowledge graph relationships.

You will be given a body of text, and you will extract the subjects, predicates, and objects. Only output the JSON, no other text, no backticks.

IMPORTANT: Normalize all entities to lowercase for consistency.

Example Input: "The Eiffel Tower is a famous iron lattice tower located in Paris, the capital city of France. Construction of the Eiffel Tower was completed in 1889, and it has since become one of the most recognizable landmarks in the world. Paris, which is home to the Eiffel Tower, serves as the political and cultural capital of France."

Example Output:
[
  {"subject": "eiffel tower", "predicate": "located_in", "object": "paris"},
  {"subject": "paris", "predicate": "capital_of", "object": "france"},
  {"subject": "eiffel tower", "predicate": "built_in", "object": "1889"}
]

Query:`;

                    // Send total chunks count
                    const metaChunk = `data: ${JSON.stringify({
                        type: 'meta',
                        totalChunks: chunks.length,
                    })}\n\n`;
                    controller.enqueue(new TextEncoder().encode(metaChunk));

                    // Process each chunk
                    for (let i = 0; i < chunks.length; i++) {
                        const chunk = chunks[i];

                        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                            method: 'POST',
                            headers: {
                                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                                'Content-Type': 'application/json',
                                'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://jdleo.me',
                                'X-Title': 'jdleo.me',
                            },
                            body: JSON.stringify({
                                model: 'openai/gpt-oss-120b',
                                messages: [
                                    { role: 'system', content: systemPrompt },
                                    { role: 'user', content: chunk }
                                ],
                                stream: false,
                                temperature: 0.3,
                                max_tokens: 2048,
                                provider: {
                                    order: ['cerebras', 'groq'],
                                },
                                reasoning: {
                                    effort: 'low',
                                },
                            }),
                        });

                        if (!response.ok) {
                            throw new Error(`OpenRouter API error: ${response.status}`);
                        }

                        const data = await response.json();
                        const content = data.choices?.[0]?.message?.content;

                        if (content) {
                            try {
                                // Try to parse the JSON response
                                let relationships = JSON.parse(content);

                                // Normalize all entities to lowercase
                                relationships = relationships.map((rel: any) => ({
                                    subject: rel.subject.toLowerCase().trim(),
                                    predicate: rel.predicate.toLowerCase().trim(),
                                    object: rel.object.toLowerCase().trim(),
                                }));

                                // Send the relationships for this chunk
                                const relationshipChunk = `data: ${JSON.stringify({
                                    type: 'relationships',
                                    chunkIndex: i,
                                    relationships: relationships,
                                })}\n\n`;
                                controller.enqueue(new TextEncoder().encode(relationshipChunk));
                            } catch (parseError) {
                                console.error('Failed to parse relationships:', content);
                                // Send error but continue processing
                                const errorChunk = `data: ${JSON.stringify({
                                    type: 'error',
                                    chunkIndex: i,
                                    error: 'Failed to parse relationships',
                                })}\n\n`;
                                controller.enqueue(new TextEncoder().encode(errorChunk));
                            }
                        }
                    }

                    // Send done signal
                    const doneChunk = `data: ${JSON.stringify({
                        type: 'done',
                    })}\n\n`;
                    controller.enqueue(new TextEncoder().encode(doneChunk));
                    controller.close();
                } catch (error) {
                    console.error('Knowledge graph generation error:', error);
                    const errorChunk = `data: ${JSON.stringify({
                        type: 'error',
                        error: 'Failed to generate knowledge graph',
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
        console.error('Knowledge graph error:', error);
        return NextResponse.json({ error: 'Failed to generate knowledge graph' }, { status: 500 });
    }
}
