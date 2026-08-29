import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a resume parsing assistant. Extract structured information from resumes into a strict JSON format.

Rules:
- If a field cannot be found, mark it as null (or empty array for lists)
- Do not make assumptions or guess
- Do not include any explanatory text
- Output must be valid JSON
- Keep all text exactly as found (preserve case)
- Numbers should be integers where appropriate
- Dates should be ISO format when possible ("YYYY-MM" or "YYYY-MM-DD")
- If a role is the candidate's current position, set "endDate" to null and "isCurrentRole" to true
- COMPLETENESS IS MANDATORY: include EVERY work entry, EVERY education entry, EVERY certification, and the complete skills and projects sections. Never summarize, skip, merge, or abbreviate entries to save space
- Copy highlights verbatim from the resume - do not shorten them
- "highlights" are concrete achievements/outcomes from each work experience (keep the original wording, one entry per claim)
- "links" should include LinkedIn, GitHub, personal websites, and any other profiles found in the header or footer
- "technologies" for projects: extract only tools/languages actually mentioned
- "honors" for education: latin honors, dean's list, awards, scholarships

Output Format:
{
  "basics": {
    "name": "string",
    "label": "string",
    "email": "string",
    "phone": "string",
    "summary": "string",
    "location": {
      "city": "string",
      "region": "string",
      "countryCode": "string"
    },
    "links": [
      {
        "platform": "string",
        "url": "string"
      }
    ]
  },
  "work": [
    {
      "company": {
        "name": "string",
        "url": "string | null",
        "location": "string | null"
      },
      "title": "string",
      "startDate": "string",
      "endDate": "string | null",
      "isCurrentRole": "boolean",
      "highlights": ["string"]
    }
  ],
  "education": [
    {
      "institution": {
        "name": "string",
        "url": "string | null",
        "location": "string | null"
      },
      "area": "string",
      "studyType": "string",
      "startDate": "string",
      "endDate": "string | null",
      "gpa": "string | null",
      "honors": ["string"]
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "issueDate": "string",
      "expiryDate": "string | null",
      "url": "string | null"
    }
  ],
  "skills": {
    "hard": ["string"],
    "soft": ["string"]
  },
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "url": "string | null"
    }
  ]
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
        model: 'google/gemini-3.7-flash',
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
        max_tokens: 8192,
        temperature: 0.1, // Near-zero for structured output
        response_format: { type: 'json_object' },
        provider: { require_parameters: true }, // enforce json mode at the provider level
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenRouter parse error:', error);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();

    // never display a silently truncated parse
    if (data.choices[0].finish_reason === 'length') {
      throw new Error('Parse output exceeded the token limit');
    }

    const parsedData = JSON.parse(data.choices[0].message.content);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Resume parsing error:', error);
    return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 });
  }
}
