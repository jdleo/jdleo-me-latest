import { NextResponse } from 'next/server';

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
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: `Parse this resume text into the specified JSON format: ${text}`,
          },
        ],
        max_tokens: 2048,
        temperature: 0.1, // Near-zero for structured output
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenRouter parse error:', error);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const parsedData = JSON.parse(data.choices[0].message.content);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Resume parsing error:', error);
    return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 });
  }
}
