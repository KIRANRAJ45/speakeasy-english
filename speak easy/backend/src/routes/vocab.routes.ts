import { Router } from 'express';
import { VocabController } from '../controllers/vocab.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/daily', authMiddleware, VocabController.getDailyVocab);
router.post('/learn', authMiddleware, VocabController.markLearned);
router.get('/quiz', authMiddleware, VocabController.getQuiz);
router.post('/quiz-submit', authMiddleware, VocabController.submitQuiz);

export default router;
