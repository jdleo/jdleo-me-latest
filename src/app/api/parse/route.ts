import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are a resume parsing assistant. Extract structured information from resumes into a strict JSON format.

Rules:
- If a field cannot be found, mark it as null
- Do not make assumptions or guess
- Do not include any explanatory text
- Output must be valid JSON
- Keep all text exactly as found (preserve case)
- Numbers should be integers where appropriate
- Dates should be ISO format when possible

Output Format:
{
  "basics": {
    "name": string | null,
    "email": string | null,
    "phone": string | null,
    "location": string | null,
    "website": string | null,
    "summary": string | null
  },
  "work": [{
    "company": string | null,
    "position": string | null,
    "startDate": string | null,
    "endDate": string | null,
    "summary": string | null
  }],
  "education": [{
    "institution": string | null,
    "area": string | null,
    "studyType": string | null,
    "startDate": string | null,
    "endDate": string | null,
    "gpa": number | null
  }],
  "skills": {
    "technical": string[],
    "soft": string[],
    "languages": string[]
  },
  "certifications": [{
    "name": string | null,
    "issuer": string | null,
    "date": string | null
  }]
}`;

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        const response = await anthropic.messages.create({
            model: 'claude-3-5-haiku-latest',
            max_tokens: 2048,
            system: SYSTEM_PROMPT,
            messages: [
                {
                    role: 'user',
                    content: `Parse this resume text into the specified JSON format: ${text}`,
                },
            ],
        });

        // @ts-expect-error anthropic types are wrong
        const parsedData = JSON.parse(response.content[0].text);

        return NextResponse.json(parsedData);
    } catch (error) {
        console.error('Resume parsing error:', error);
        return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 });
    }
}
