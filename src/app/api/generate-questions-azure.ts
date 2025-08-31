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
  const { jd, resume } = req.body;
  if (!jd && !resume) {
    return res.status(400).json({ questions: [] });
  }
  try {
    // Extract skills, experience, keywords from JD/Resume
    const signals = `Extract skills, years of experience, and keywords from the following JD and resume.\nJD: ${jd}\nResume: ${resume}`;
    const signalResp = await client.chat.completions.create({
      model: 'azure/gpt-5-mini',
      messages: [{ role: 'user', content: signals }],
      max_tokens: 200,
      temperature: 0.3,
    });
    const extracted = signalResp.choices[0].message?.content || '';
    // Generate questions based on extracted signals
    const prompt = `Generate 5 interview questions for a candidate. Focus on these signals: ${extracted}`;
    const completion = await client.chat.completions.create({
      model: 'azure/gpt-5-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    });
    const text = completion.choices[0].message?.content || '';
    const questions = text.split(/\n|\d+\. /).filter(q => q.trim().length > 10);
    res.status(200).json({ questions });
  } catch {
    res.status(500).json({ questions: [] });
  }
}
