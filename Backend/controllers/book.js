//Both api call in one api
import { autoBookLogic } from '../services/bookingService.js';
import { extractIntentLogic } from '../services/intentService.js';

export const bookFromText = async (req, res) => {
  try {
    const { text, phone, name } = req.body;

    if (!text || !phone) {
      return res.status(400).json({
        message: 'Text and phone are required',
      });
    }

    // 1. Extract intent
    const intent = await extractIntentLogic(text);

    if (!intent.specialization) {
      return res.json({
        message: 'Which doctor do you need? (e.g., cardiologist, dentist)',
      });
    }

    if (!intent.date) {
      return res.json({
        message: 'For which date do you want the appointment?',
      });
    }

    if (!phone) {
      return res.json({
        message: 'Please provide your phone number',
      });
    }

    // 2. Book appointment
    const result = await autoBookLogic({
      phone,
      name,
      specialization: intent.specialization,
      date: intent.date,
    });

    return res.json(result);
  } catch (error) {
    console.error('ERROR:', error);

    return res.status(400).json({
      message: error.message,
    });
  }
};
