import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a Mermaid diagram generation expert. Generate ONLY valid, error-free Mermaid diagram syntax.

CRITICAL SYNTAX RULES (MUST FOLLOW):
- Output ONLY valid Mermaid syntax - no explanations, no markdown, no extra text
- Never include \`\`\`mermaid or \`\`\` tags
- Use only alphanumeric characters and underscores for node IDs (A, B1, User_Auth, etc.)
- Avoid special characters in node IDs: no spaces, hyphens, or symbols
- Keep all text labels short and simple
- Always end lines properly - no trailing characters

NODE SYNTAX (use exactly):
- Rectangles: A[Label Text]
- Rounded: B(Label Text)  
- Diamond: C{Question?}
- Circle: D((Label))
- Use ONLY these formats

CONNECTION SYNTAX:
- Simple: A --> B
- With label: A -->|Label Text| B
- Never use complex arrow types or special symbols

VALID DIAGRAM TYPES:
- graph TD (top-down flowchart)
- graph LR (left-right flowchart)
- sequenceDiagram
- classDiagram
- erDiagram

FORBIDDEN:
- Special characters in node IDs: @, #, $, %, spaces, hyphens
- Complex styling within node definitions
- Nested quotes or apostrophes
- Unicode characters or emojis in syntax
- Multiline labels

EXAMPLE (COPY THIS PATTERN):
graph TD
    A[User Login] --> B{Valid Credentials?}
    B -->|Yes| C[Generate Token]
    B -->|No| D[Show Error]
    C --> E[Redirect to Dashboard]
    
    classDef default fill:transparent,stroke:#5e6ad2,color:#f7f8f8,stroke-width:2px
    classDef decision fill:transparent,stroke:#818cf8,color:#f7f8f8,stroke-width:2px
    class B decision

ALWAYS TEST: Before responding, mentally check each line for:
1. Valid node ID (alphanumeric/underscore only)
2. Proper bracket/parentheses matching
3. Valid connection syntax
4. No trailing spaces or invalid characters`;

export async function POST(req: Request) {
    try {
        const { description } = await req.json();

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
                model: 'anthropic/claude-sonnet-4.5',
                messages: [
                    {
                        role: 'system',
                        content: SYSTEM_PROMPT,
                    },
                    {
                        role: 'user',
                        content: `Generate a Mermaid diagram for: ${description}.`,
                    },
                ],
                max_tokens: 2048,
                temperature: 0.2, // Lower temperature for more consistent syntax
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('OpenRouter error:', error);
            throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        const diagramCode = data.choices[0].message.content.trim();

        // Safety check: remove any markdown code block wrap if the model ignored instructions
        const cleanedCode = diagramCode.replace(/```mermaid\n?|```/g, '').trim();

        return NextResponse.json({ diagram: cleanedCode });
    } catch (error) {
        console.error('Diagram generation error:', error);
        return NextResponse.json({ error: 'Failed to generate diagram' }, { status: 500 });
    }
}
