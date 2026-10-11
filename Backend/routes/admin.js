import express from 'express';
import { allowRoles, authMiddleware } from '../middleware/auth_middleware.js';

const router = express.Router();

router.get('/admin', authMiddleware, allowRoles('admin'), (req, res) => {
  res.json({ message: 'Admin route', role: req.user.role });
});

export default router;
