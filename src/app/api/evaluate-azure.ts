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
  const { jd, resume, answers } = req.body;
  if (!jd || !resume || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ scorecard: null });
  }
  try {
    const prompt = `Evaluate the following candidate interview answers based on the job description and resume. Provide a scorecard with section-wise ratings (Technical, Problem-Solving, Communication, Cultural Fit) and brief comments for each section.\nJob Description: ${jd}\nResume: ${resume}\nAnswers: ${answers.join('\n')}`;
    const completion = await client.chat.completions.create({
      model: 'azure/gpt-5-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.5,
    });
    const scorecard = completion.choices[0].message?.content || '';
    res.status(200).json({ scorecard });
  } catch {
    res.status(500).json({ scorecard: null });
  }
}
