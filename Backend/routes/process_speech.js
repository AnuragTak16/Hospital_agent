import express from 'express';
import { processSpeech, serveAudio } from '../controllers/processSpeach.js';

const router = express.Router();

router.post('/process_speech', processSpeech);
router.get('/audio/:filename', serveAudio);

export default router;
