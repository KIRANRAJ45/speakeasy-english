import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/dashboard', authMiddleware, UserController.getDashboard);
router.get('/leaderboard', authMiddleware, UserController.getLeaderboard);
router.put('/profile', authMiddleware, UserController.updateProfile);

export default router;
