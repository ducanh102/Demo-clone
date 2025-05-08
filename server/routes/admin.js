import express from 'express';
import { loginAdmin, getDashboardStats } from '../controllers/adminController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', loginAdmin);

// Protected admin routes
router.get('/dashboard', authMiddleware, adminMiddleware, getDashboardStats);

export default router;