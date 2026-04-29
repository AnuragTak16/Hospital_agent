import express from 'express';
import { extractIntent } from '../controllers/intent.js';

const router = express.Router();

router.post('/intent', extractIntent);

export default router;
