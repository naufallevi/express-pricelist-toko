import { Router } from 'express';
import {
  register,
  login,
  listUsers,
  deleteUser,
} from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = Router();

// Public
router.post('/login', login);

// Admin only
router.post('/register', authenticate, authorize('ADMIN'), register);
router.get('/users', authenticate, authorize('ADMIN'), listUsers);
router.delete('/users/:id', authenticate, authorize('ADMIN'), deleteUser);

export default router;