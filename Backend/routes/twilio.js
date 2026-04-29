import express from 'express';
import { handleIncomingCall } from '../controllers/twilioController.js';

const router = express.Router();

router.post('/voice', handleIncomingCall);

export default router;
