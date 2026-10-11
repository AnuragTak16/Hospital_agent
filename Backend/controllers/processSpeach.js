import path from 'path';
import twilio from 'twilio';
import { autoBookLogic } from '../services/bookingService.js';
import {
  AUDIO_DIR,
  downloadTwilioRecording,
  textToSpeechUrl,
  transcribeAudio,
} from '../services/deepgramService.js';
import { extractIntentLogic } from '../services/intentService.js';

const VoiceResponse = twilio.twiml.VoiceResponse;

const speak = async (twiml, text) => {
  try {
    const audioUrl = await textToSpeechUrl(text);
    twiml.play(audioUrl);
  } catch (error) {
    console.error('Deepgram TTS fallback to Say:', error.message);
    twiml.say(text);
  }
};

const getUserSpeech = async (req) => {
  // Preferred: Twilio Record → Deepgram STT
  if (req.body.RecordingUrl) {
    const audio = await downloadTwilioRecording(req.body.RecordingUrl);
    return transcribeAudio(audio);
  }

  // Fallback: Twilio Gather SpeechResult (no Deepgram STT)
  if (req.body.SpeechResult) {
    return req.body.SpeechResult;
  }

  throw new Error('No recording or speech result received');
};

export const processSpeech = async (req, res) => {
  const twiml = new VoiceResponse();

  try {
    const userSpeech = await getUserSpeech(req);
    console.log('User said:', userSpeech);

    const intent = await extractIntentLogic(userSpeech);
    const phone = req.body.From || '+919000000000';

    if (!intent.specialization) {
      await speak(
        twiml,
        'Which doctor do you need? For example, cardiologist or dentist.',
      );
      twiml.record({
        action: '/api/twilio/process_speech',
        method: 'POST',
        maxLength: 25,
        timeout: 3,
        playBeep: true,
        trim: 'trim-silence',
      });
      res.type('text/xml');
      return res.send(twiml.toString());
    }

    const result = await autoBookLogic({
      phone,
      name: 'Guest User',
      specialization: intent.specialization,
      date: intent.date,
      timePreference: intent.timePreference,
    });

    await speak(
      twiml,
      `Your appointment with ${result.doctor} is confirmed on ${result.date} at ${result.time}`,
    );
  } catch (error) {
    console.error(error);
    await speak(
      twiml,
      'Sorry, I could not process your request. Please try again.',
    );
  }

  res.type('text/xml');
  res.send(twiml.toString());
};

/** Serve Deepgram-generated WAV files for Twilio <Play>. */
export const serveAudio = (req, res) => {
  const { filename } = req.params;

  if (!filename || filename.includes('..') || !filename.endsWith('.wav')) {
    return res.status(400).json({ message: 'Invalid audio file' });
  }

  const filepath = path.join(AUDIO_DIR, filename);

  res.setHeader('Content-Type', 'audio/wav');
  res.setHeader('Cache-Control', 'no-store');
  return res.sendFile(filepath, (err) => {
    if (err && !res.headersSent) {
      res.status(404).json({ message: 'Audio not found' });
    }
  });
};
