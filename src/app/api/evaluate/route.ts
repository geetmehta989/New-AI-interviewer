import { NextRequest } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  const { response } = await req.json();
  if (!OPENAI_API_KEY) {
    return Response.json({ feedback: 'Error: OpenAI API key not configured.' }, { status: 500 });
  }

  try {
    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert interviewer. Evaluate the candidate’s answer and provide concise feedback.' },
          { role: 'user', content: response },
        ],
        max_tokens: 150,
      }),
    });
    const data = await aiRes.json();
    const feedback = data.choices?.[0]?.message?.content || 'No feedback generated.';
    return Response.json({ feedback });
  } catch {
    return Response.json({ feedback: 'Error evaluating response.' }, { status: 500 });
  }
}
