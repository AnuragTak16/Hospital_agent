import express from 'express';
import {
  createOrGetPatient,
  getPatientByPhone,
} from '../controllers/patient.js';
import { allowRoles, authMiddleware } from '../middleware/auth_middleware.js';

const router = express.Router();

router.post(
  '/patients',
  authMiddleware,
  allowRoles('agent', 'admin'),
  createOrGetPatient,
);

router.get(
  '/patients/:phone',
  authMiddleware,
  allowRoles('agent', 'admin'),
  getPatientByPhone,
);

export default router;
