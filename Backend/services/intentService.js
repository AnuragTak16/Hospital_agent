// services/intentService.js

import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const extractJSON = (text) => {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
};

const resolveDate = (inputDate, originalText) => {
  const today = new Date();
  const text = originalText.toLowerCase();

  if (text.includes('kal')) {
    const t = new Date(today);
    t.setDate(today.getDate() + 1);
    return t.toISOString().split('T')[0];
  }

  if (text.includes('aaj')) {
    return today.toISOString().split('T')[0];
  }

  if (inputDate) {
    const parsed = new Date(inputDate);
    if (parsed < today) {
      const t = new Date(today);
      t.setDate(today.getDate() + 1);
      return t.toISOString().split('T')[0];
    }
    return inputDate;
  }

  return null;
};

const safeParseJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    let fixed = text;
    fixed = fixed.replace(/(\w+):/g, '"$1":');
    fixed = fixed.replace(/'/g, '"');
    fixed = fixed.replace(/,\s*}/g, '}');
    return JSON.parse(fixed);
  }
};

export const extractIntentLogic = async (text) => {
  const prompt = `
You are a strict JSON generator.

Return ONLY valid JSON.
All keys MUST be in double quotes.
Do NOT include comments.
Do NOT include explanations.

Format:
{
  "specialization": "",
  "date": "",
  "timePreference": ""
}

Text: "${text}"
`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = response.choices[0].message.content;

  const cleaned = extractJSON(raw);
  if (!cleaned) throw new Error('No JSON found');

  const data = safeParseJSON(cleaned);
  data.date = resolveDate(data.date, text);

  return data;
};
