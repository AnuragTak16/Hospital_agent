// routes/doctorRoutes.js
import express from 'express';
import { createDoctor, getDoctors } from '../controllers/createDocter.js';
import { allowRoles, authMiddleware } from '../middleware/auth_middleware.js';

const router = express.Router();

router.post('/doctors', authMiddleware, allowRoles('admin'), createDoctor);

router.get(
  '/doctors',
  authMiddleware,
  allowRoles('agent', 'admin', 'doctor'),
  getDoctors,
);

export default router;
