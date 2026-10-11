import twilio from 'twilio';
import { textToSpeechUrl } from '../services/deepgramService.js';

const VoiceResponse = twilio.twiml.VoiceResponse;

const GREETING =
  'Namaste, welcome to hospital assistant. Please tell me your requirement after the beep.';

const speak = async (twiml, text) => {
  try {
    const audioUrl = await textToSpeechUrl(text);
    twiml.play(audioUrl);
  } catch (error) {
    console.error('Deepgram TTS fallback to Say:', error.message);
    twiml.say(text);
  }
};

export const handleIncomingCall = async (req, res) => {
  const twiml = new VoiceResponse();

  try {
    await speak(twiml, GREETING);

    // Record caller audio → Deepgram STT in process_speech
    twiml.record({
      action: '/api/twilio/process_speech',
      method: 'POST',
      maxLength: 25,
      timeout: 3,
      playBeep: true,
      trim: 'trim-silence',
    });
  } catch (error) {
    console.error(error);
    twiml.say('Sorry, the assistant is unavailable right now. Please try again later.');
  }

  res.type('text/xml');
  res.send(twiml.toString());
};
