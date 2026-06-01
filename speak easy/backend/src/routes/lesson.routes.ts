import { Router } from 'express';
import { LessonController } from '../controllers/lesson.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, LessonController.getLessons);
router.post('/complete', authMiddleware, LessonController.completeLesson);

export default router;
