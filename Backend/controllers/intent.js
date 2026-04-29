import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Helper function to extract JSON safely from LLM response
const extractJSON = (text) => {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
};

// Helper function to normalize relative dates (kal, aaj)
const resolveDate = (inputDate, originalText) => {
  const today = new Date();

  const text = originalText.toLowerCase();

  // Handle Hindi / Hinglish
  if (text.includes('kal')) {
    const t = new Date(today);
    t.setDate(today.getDate() + 1);
    return t.toISOString().split('T')[0];
  }

  if (text.includes('aaj')) {
    return today.toISOString().split('T')[0];
  }

  // If AI returned a past date → fix it
  if (inputDate) {
    const parsed = new Date(inputDate);

    if (parsed < today) {
      const t = new Date(today);
      t.setDate(today.getDate() + 1);
      return t.toISOString().split('T')[0];
    }

    return inputDate;
  }

  // fallback → tomorrow
  const t = new Date(today);
  t.setDate(today.getDate() + 1);
  return t.toISOString().split('T')[0];
};

export const extractIntent = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    // Strong prompt (prevents garbage output)
    const prompt = `
You are a strict JSON generator.

Return ONLY valid JSON.
Do NOT add markdown.
Do NOT add explanation.
Do NOT add text before or after JSON.

Format:
{
  "specialization": "",
  "date": "",
  "timePreference": ""
}

Rules:
- "kal" = tomorrow
- "aaj" = today
- Convert everything to English
- Date format must be YYYY-MM-DD

Text: "${text}"
`;
    
    if (timePreference === 'morning') {
      startTime < '12:00';
    }

    if (timePreference === 'evening') {
      startTime >= '17:00';
    }

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = response.choices[0].message.content;

    //Extract clean JSON
    const cleaned = extractJSON(raw);

    if (!cleaned) {
      return res.status(500).json({
        message: 'No JSON found in AI response',
        raw,
      });
    }

    let data;

    try {
      data = JSON.parse(cleaned);
    } catch (err) {
      return res.status(500).json({
        message: 'Failed to parse cleaned JSON',
        cleaned,
        raw,
      });
    }

    // Normalize date if needed
    if (data.date) {
      data.date = resolveDate(data.date, text);
    }

    // Basic validation
    if (!data.specialization) {
      return res.status(400).json({
        message: 'Could not extract specialization',
        data,
      });
    }

    return res.json(data);
  } catch (error) {
    console.error('ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};
