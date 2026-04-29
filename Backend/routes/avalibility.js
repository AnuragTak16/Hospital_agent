import express from 'express';
import {
  createAvailability,
  createBulkAvailability,
  getAvailability,
} from '../controllers/avalebility.js';
import { allowRoles, authMiddleware } from '../middleware/auth_middleware.js';

const router = express.Router();

router.post(
  '/availability',
  authMiddleware,
  allowRoles('admin'),
  createAvailability,
);
router.get('/', authMiddleware, allowRoles('admin', 'agent'), getAvailability);

router.post(
  '/availability/bulk',
  authMiddleware,
  allowRoles('admin'),
  createBulkAvailability,
);

export default router;
