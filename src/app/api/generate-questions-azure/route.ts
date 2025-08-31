

import openai from 'openai';

// Use the provided API key and base URL directly for debugging
const client = new openai.OpenAI({
  apiKey: 'sk-1ZD9lcxMClJfD9AZC6_Kxg',
  baseURL: 'https://proxyllm.ximplify.id',
});

export async function POST(req: Request) {
  const body = await req.json();
  const { jd, resume } = body;
  if (!jd && !resume) {
    return new Response(JSON.stringify({ questions: [] }), { status: 400 });
  }
  try {
  const prompt = `Given the following job description and resume, list 5 interview questions for this candidate. Format each as a numbered list.\n\nJob Description: ${jd}\n\nResume: ${resume}`;
    const completion = await client.chat.completions.create({
      model: 'azure/gpt-5-mini',
      messages: [{ role: 'user', content: prompt }],
  max_completion_tokens: 1000,
    });
  // Log the full raw response for debugging
  console.log('Raw Azure GPT response object:', completion);
  const messageObj = completion.choices?.[0]?.message;
  console.log('Azure GPT message object:', messageObj);
  const text = messageObj && typeof messageObj.content === 'string' ? messageObj.content : '';
  console.log('Raw Azure GPT response text:', text);
  const questions = text.split(/\n|\d+\. /).filter(q => q.trim().length > 10);
  return new Response(JSON.stringify({ questions }), { status: 200 });
  } catch (err) {
    // Log the error and request payload for debugging
    console.error('Azure GPT API error:', err);
    return new Response(JSON.stringify({ questions: [] }), { status: 500 });
  }
}
