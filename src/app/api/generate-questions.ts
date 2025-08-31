
import { NextApiRequest, NextApiResponse } from 'next';
import openai from 'openai';

const client = new openai.OpenAI({
  apiKey: process.env.AZURE_GPT_API_KEY,
  baseURL: process.env.AZURE_GPT_BASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { jd, resume, previousAnswers } = req.body;
  if (!jd && !resume) {
    return res.status(400).json({ questions: [] });
  }
  try {
    let prompt = `Generate 5 interview questions for a candidate based on the following job description and resume.\nJob Description: ${jd}\nResume: ${resume}`;
    if (previousAnswers && Array.isArray(previousAnswers) && previousAnswers.length > 0) {
      prompt += `\nPrevious Answers: ${previousAnswers.map((a, i) => `Q${i+1}: ${a}`).join('\n')}`;
      prompt += '\nUpdate the remaining interview questions to adapt to the candidate\'s previous answers.';
    }
    const completion = await client.chat.completions.create({
      model: 'azure/gpt-5-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    });
    const text = completion.choices[0].message?.content || '';
    // Split into questions
    const questions = text.split(/\n|\d+\. /).filter((q: string) => q.trim().length > 10);
    res.status(200).json({ questions });
  } catch {
    res.status(500).json({ questions: [] });
  }
}
