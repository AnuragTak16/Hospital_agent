import express from 'express';
import { processSpeech } from '../controllers/processSpeach.js';

const router = express.Router();

router.post('/process_speech', processSpeech);

export default router;
