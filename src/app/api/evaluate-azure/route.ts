
import openai from 'openai';

const client = new openai.OpenAI({
  apiKey: 'sk-1ZD9lcxMClJfD9AZC6_Kxg',
  baseURL: 'https://proxyllm.ximplify.id',
});

export async function POST(req: Request) {
  const body = await req.json();
  const { jd, resume, questions, answers } = body;
  if (!jd || !resume || !questions || !Array.isArray(questions) || !answers || !Array.isArray(answers)) {
    return new Response(JSON.stringify({ scorecard: null }), { status: 400 });
  }
  try {
  const prompt = `Given the job description, resume, interview questions, and answers below, provide:\n1. A crisp evaluation feedback (max 2 sentences).\n2. A score out of 10 for the candidate.\nReturn your response as JSON: { feedback: string, score: number }\nJob Description: ${jd}\nResume: ${resume}\nQuestions: ${questions.join('\n')}\nAnswers: ${answers.join('\n')}`;
    const completion = await client.chat.completions.create({
      model: 'azure/gpt-5-mini',
      messages: [{ role: 'user', content: prompt }],
      max_completion_tokens: 1000,
    });
    console.log('Raw Azure GPT evaluation response object:', completion);
    const raw = completion.choices?.[0]?.message?.content || '';
    console.log('Raw Azure GPT evaluation response text:', raw);
    let scorecard = { feedback: '', score: null };
    try {
      scorecard = JSON.parse(raw);
    } catch {
      scorecard = { feedback: raw, score: null };
    }
    return new Response(JSON.stringify({ scorecard }), { status: 200 });
  } catch (err) {
    console.error('Azure GPT evaluation API error:', err);
    return new Response(JSON.stringify({ scorecard: null }), { status: 500 });
  }
}
