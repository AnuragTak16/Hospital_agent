import twilio from 'twilio';
import { autoBookLogic } from '../services/bookingService.js';
import { extractIntentLogic } from '../services/intentService.js';

const VoiceResponse = twilio.twiml.VoiceResponse;

export const processSpeech = async (req, res) => {
  const twiml = new VoiceResponse();

  try {
    const userSpeech = req.body.SpeechResult;

    console.log('User said:', userSpeech);

    // 🧠 Step 1: extract intent
    const intent = await extractIntentLogic(userSpeech);

    // ⚠️ For now hardcode phone (later from caller ID)
    const phone = req.body.From || '+919000000000';

    // 🏥 Step 2: book appointment
    const result = await autoBookLogic({
      phone,
      name: 'Guest User',
      specialization: intent.specialization,
      date: intent.date,
      timePreference: intent.timePreference,
    });

    // 🔊 Speak response
    twiml.say(
      `Your appointment with ${result.doctor} is confirmed on ${result.date} at ${result.time}`,
    );
  } catch (error) {
    console.error(error);

    twiml.say('Sorry, I could not process your request. Please try again.');
  }

  res.type('text/xml');
  res.send(twiml.toString());
};
