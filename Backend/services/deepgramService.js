import { DeepgramClient } from '@deepgram/sdk';
import { createWriteStream } from 'fs';
import { mkdir, unlink } from 'fs/promises';
import path from 'path';
import { pipeline } from 'stream/promises';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const AUDIO_DIR = path.join(__dirname, '..', 'temp', 'audio');

const getClient = () => {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPGRAM_API_KEY is missing');
  }
  return new DeepgramClient({ apiKey });
};

export const ensureAudioDir = async () => {
  await mkdir(AUDIO_DIR, { recursive: true });
};

const extractTranscript = (response) => {
  return (
    response?.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() ||
    ''
  );
};

/** Download Twilio recording (requires TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN). */
export const downloadTwilioRecording = async (recordingUrl) => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token) {
    throw new Error(
      'TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required to download recordings for Deepgram STT',
    );
  }

  const url = recordingUrl.endsWith('.wav')
    ? recordingUrl
    : `${recordingUrl}.wav`;

  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const response = await fetch(url, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to download recording: ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
};

/** Speech-to-text from an audio buffer. */
export const transcribeAudio = async (audioBuffer) => {
  const deepgram = getClient();

  const response = await deepgram.listen.v1.media.transcribeFile(audioBuffer, {
    model: 'nova-2',
    smart_format: 'true',
    punctuate: 'true',
    detect_language: 'true',
  });

  const transcript = extractTranscript(response);
  if (!transcript) {
    throw new Error('No speech detected');
  }

  return transcript;
};

/** Speech-to-text from a public audio URL (Deepgram fetches it). */
export const transcribeUrl = async (audioUrl) => {
  const deepgram = getClient();

  const response = await deepgram.listen.v1.media.transcribeUrl({
    url: audioUrl,
    model: 'nova-2',
    smart_format: 'true',
    punctuate: 'true',
    detect_language: 'true',
  });

  const transcript = extractTranscript(response);
  if (!transcript) {
    throw new Error('No speech detected');
  }

  return transcript;
};

/**
 * Text-to-speech → save WAV under temp/audio and return filename.
 * Twilio <Play> needs a publicly reachable URL (set PUBLIC_BASE_URL).
 */
export const synthesizeToFile = async (text) => {
  const deepgram = getClient();
  await ensureAudioDir();

  const response = await deepgram.speak.v1.audio.generate({
    text,
    model: process.env.DEEPGRAM_TTS_MODEL || 'aura-2-thalia-en',
    encoding: 'linear16',
    container: 'wav',
  });

  const filename = `${randomUUID()}.wav`;
  const filepath = path.join(AUDIO_DIR, filename);

  // Prefer arrayBuffer when available; otherwise stream to disk
  if (typeof response.arrayBuffer === 'function') {
    const buffer = Buffer.from(await response.arrayBuffer());
    const { writeFile } = await import('fs/promises');
    await writeFile(filepath, buffer);
  } else if (typeof response.stream === 'function') {
    const body = response.stream();
    const nodeStream =
      typeof body.getReader === 'function'
        ? Readable.fromWeb(body)
        : body;
    await pipeline(nodeStream, createWriteStream(filepath));
  } else {
    throw new Error('Unexpected Deepgram TTS response shape');
  }

  // Best-effort cleanup after Twilio has time to fetch
  setTimeout(() => {
    unlink(filepath).catch(() => {});
  }, 5 * 60 * 1000);

  return filename;
};

export const getPublicAudioUrl = (filename) => {
  const base = (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '');
  if (!base) {
    throw new Error(
      'PUBLIC_BASE_URL is required so Twilio can fetch Deepgram TTS audio',
    );
  }
  return `${base}/api/twilio/audio/${filename}`;
};

/** Speak text via Deepgram; returns playable public URL. */
export const textToSpeechUrl = async (text) => {
  const filename = await synthesizeToFile(text);
  return getPublicAudioUrl(filename);
};
