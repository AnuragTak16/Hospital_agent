import { extractIntentLogic } from '../services/intentService.js';

export const extractIntent = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const data = await extractIntentLogic(text);

    if (!data.specialization) {
      return res.status(400).json({
        message: 'Could not extract specialization',
        data,
      });
    }

    return res.json(data);
  } catch (error) {
    console.error('ERROR:', error);
    return res.status(500).json({ message: error.message });
  }
};
