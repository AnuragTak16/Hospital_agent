import express from 'express';
import { autoBookAppointment } from '../controllers/appoinment.js';

const router = express.Router();

router.post('/appointments/auto', autoBookAppointment);

export default router;
