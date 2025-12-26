import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a Non-Technical Recruiter. Your goal is to screen a candidate to verify their resume claims are real and check their communication skills. You DO NOT have the technical knowledge to evaluate code or architecture.

Input:
- Resume Text
- Job Description (Optional)

Task:
1. Analyze the resume for major projects and claims.
2. IF A JOB DESCRIPTION IS PROVIDED: specific focus on the *intersection* of the Resume and the Job Requirements.
3. Generate 7 screening questions.
4. For each question, provide 2 "Green Flags" (simple signs they are legit) and 1 "Red Flag" (warning sign).

Rules for Questions:
- ROLE: You are a Talent Acquisition specialist, NOT an engineer.
- GOAL: Verify the candidate's specific contribution and their ability to explain complex topics simply.
- TONE: Conversational, simple, and curious.
- LEVEL: High-level overview. Ask about "Challenges", "Impact", "Mistakes", and "Role".
- JD PRIORITY: If a Job Description is present, questions MUST relate to skills required in the JD that the candidate also claims. (e.g., "The role needs Kubernetes. You used K8s at Company X. Tell me about a time...")
- FORBIDDEN: Do not use technical jargon (e.g., "latency", "throughput", "sharding") in the question unless quoting the resume.
- FORBIDDEN: Do not ask "How did you implement X?". Instead ask "What was the hardest part about X?"
- BAD QUESTION: "How did the multi-agent architecture address the bottleneck?" (Too technical)
- GOOD QUESTION: "You improved speed by 70%. What was the main thing you changed to achieve that, and what was your specific role?"

Rules for Flags:
- Green Flags: Should be about communication style, clarity, and mentioning specific outcomes (e.g., "Explains it simply", "Gives a concrete example", "Admits a mistake").
- Red Flags: Should be about behavior (e.g., "Uses too much jargon", "Can't explain why it mattered", "Takes credit for team work").

Output Format (JSON):
{
  "questions": [
    {
      "id": 1,
      "topic": "Project X",
      "question": "You mentioned working on Project X. Can you explain it to me like I'm 5? What did it actually do?",
      "context": "To see if they can communicate technical concepts to non-technical stakeholders.",
      "greenFlags": ["Uses a simple analogy", "Focuses on the user problem, not the code"],
      "redFlags": "Gets lost in technical details immediately."
    }
  ]
}`;

export async function POST(req: Request) {
    try {
        const { resumeText, jobDescription } = await req.json();

        if (!resumeText) {
            return NextResponse.json({ error: 'Resume text is required' }, { status: 400 });
        }

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
                        content: `Resume:
${resumeText.slice(0, 20000)}

${jobDescription ? `Job Description:\n${jobDescription.slice(0, 5000)}` : 'No specific Job Description provided. Focus purely on validating the resume claims.'}`,
                    },
                ],
                temperature: 0.4,
                response_format: { type: 'json_object' }
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('OpenRouter screen error:', error);
            throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        let parsedContent = JSON.parse(data.choices[0].message.content);

        // Handle case where LLM returns just the array instead of { questions: [...] }
        if (Array.isArray(parsedContent)) {
            parsedContent = { questions: parsedContent };
        }

        return NextResponse.json(parsedContent);
    } catch (error) {
        console.error('Screening generation error:', error);
        return NextResponse.json({ error: 'Failed to generate screening questions' }, { status: 500 });
    }
}
