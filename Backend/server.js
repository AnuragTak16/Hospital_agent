import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import db_connection from './config/db_connection.js';
import adminRoutes from './routes/admin.js';
import appointmentRoutes from './routes/appoinment.js';
import availabilityRoutes from './routes/avalibility.js';
import bookRoutes from './routes/book.js';
import doctorRoutes from './routes/doctor.js';
import intentRoutes from './routes/intentRoute.js';
import patientRoutes from './routes/patients.js';
import processSpeechRoutes from './routes/process_speech.js';
import twilioRoutes from './routes/twilio.js';
import { ensureAudioDir } from './services/deepgramService.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// Allow Twilio to fetch Deepgram TTS audio from this server
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(morgan('dev'));

db_connection();
ensureAudioDir().catch((err) =>
  console.error('Failed to create audio temp dir:', err.message),
);

app.use('/api', adminRoutes);
app.use('/api', doctorRoutes);
app.use('/api', availabilityRoutes);
app.use('/api', patientRoutes);
app.use('/api', appointmentRoutes);
app.use('/api', intentRoutes);
app.use('/api', bookRoutes);
app.use('/api', twilioRoutes);
app.use('/api/twilio', processSpeechRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
