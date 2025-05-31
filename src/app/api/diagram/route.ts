import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are a diagram generation assistant. Your task is to convert natural language descriptions into Mermaid diagram syntax.

Rules:
- Output ONLY valid Mermaid syntax without any explanations or markdown formatting
- Do not include \`\`\`mermaid or \`\`\` tags
- If the request is unclear, create a reasonable diagram based on what you understand
- Support flowcharts, sequence diagrams, class diagrams, entity relationship diagrams, state diagrams, gantt charts, and pie charts
- Use appropriate styling to make diagrams visually appealing
- Keep diagrams concise and focused on the key elements
- Ensure high contrast between text and backgrounds for readability
- Use clear, readable text labels for all nodes and connections
- Avoid using light colors for text or important elements
- For dark themes, use bright text colors (white, light blue, light green) for maximum visibility
- Output must be compileable mermaid.

Example output for "flowchart of user authentication":
graph TD
    A[User] -->|Login Request| B(Authentication Service)
    B -->|Validate Credentials| C{Valid?}
    C -->|Yes| D[Generate Token]
    C -->|No| E[Return Error]
    D --> F[Return Token]
    
    %% Styling for better visibility
    classDef default fill:transparent,stroke:#5e6ad2,color:#f7f8f8,stroke-width:2px;
    classDef decision fill:transparent,stroke:#5e6ad2,color:#f7f8f8,stroke-width:2px;
    class C decision;
`;

export async function POST(req: Request) {
    try {
        const { description } = await req.json();

        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2048,
            system: SYSTEM_PROMPT,
            messages: [
                {
                    role: 'user',
                    content: `Generate a Mermaid diagram for: ${description}.`,
                },
            ],
        });

        // @ts-expect-error anthropic types are wrong
        const diagramCode = response.content[0].text.trim();

        return NextResponse.json({ diagram: diagramCode });
    } catch (error) {
        console.error('Diagram generation error:', error);
        return NextResponse.json({ error: 'Failed to generate diagram' }, { status: 500 });
    }
}
