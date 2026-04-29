import express from 'express';
import { bookFromText } from '../controllers/book.js';

const router = express.Router();

router.post('/book', bookFromText);

export default router;
