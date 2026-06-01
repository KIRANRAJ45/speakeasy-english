import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/auth.middleware';

export class VocabController {
  /**
   * Get 20 daily vocabulary words.
   */
  static async getDailyVocab(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      // Fetch all vocabulary words
      const vocabulary = await prisma.vocabulary.findMany({
        take: 20,
        orderBy: { word: 'asc' },
      });

      // Find which words the user has already learned
      const learnedRecords = await prisma.vocabularyLearned.findMany({
        where: { userId },
        select: { vocabularyId: true },
      });

      const learnedIds = new Set(learnedRecords.map((r) => r.vocabularyId));

      const mapped = vocabulary.map((v) => ({
        ...v,
        learned: learnedIds.has(v.id),
      }));

      res.status(200).json(mapped);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark a vocabulary word as learned.
   */
  static async markLearned(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { vocabularyId } = req.body;
      if (!vocabularyId) return res.status(400).json({ error: 'Please provide vocabularyId' });

      // Create learn record
      await prisma.vocabularyLearned.upsert({
        where: { userId_vocabularyId: { userId, vocabularyId } },
        update: {},
        create: { userId, vocabularyId },
      });

      // Award 5 XP for learning a new word
      const updatedProfile = await prisma.profile.update({
        where: { userId },
        data: { xp: { increment: 5 } },
      });

      // Check for Word Wizard Badge (earned when user learns 20 words)
      const countLearned = await prisma.vocabularyLearned.count({ where: { userId } });
      if (countLearned >= 20) {
        const wizardBadge = await prisma.badge.findUnique({ where: { title: 'Word Wizard' } });
        if (wizardBadge) {
          await prisma.userBadge.upsert({
            where: { userId_badgeId: { userId, badgeId: wizardBadge.id } },
            update: {},
            create: { userId, badgeId: wizardBadge.id },
          });
        }
      }

      res.status(200).json({
        message: 'Word marked as learned.',
        xpEarned: 5,
        totalXp: updatedProfile.xp,
        countLearned,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generates a 5-question multiple choice quiz.
   */
  static async getQuiz(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const words = await prisma.vocabulary.findMany();
      if (words.length < 4) {
        return res.status(400).json({ error: 'Not enough vocabulary words to generate a quiz.' });
      }

      // Shuffle and pick 5 words for questions
      const shuffled = [...words].sort(() => 0.5 - Math.random());
      const quizQuestions = shuffled.slice(0, Math.min(5, shuffled.length));

      const quiz = quizQuestions.map((q) => {
        // Collect incorrect answers from other words in the list
        const correctMeaning = q.wordTamil;
        const distractors = words
          .filter((w) => w.id !== q.id)
          .map((w) => w.wordTamil)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);

        const options = [correctMeaning, ...distractors].sort(() => 0.5 - Math.random());

        return {
          id: q.id,
          word: q.word,
          partOfSpeech: q.partOfSpeech,
          definition: q.definition,
          options,
          correctAnswer: correctMeaning,
        };
      });

      res.status(200).json(quiz);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit quiz answers and award XP.
   */
  static async submitQuiz(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { score } = req.body; // expected: integer between 0 and 5
      if (score === undefined || score < 0 || score > 5) {
        return res.status(400).json({ error: 'Please provide a valid score between 0 and 5.' });
      }

      // Reward 10 XP per correct answer (max 50 XP)
      const xpEarned = score * 10;

      const updatedProfile = await prisma.profile.update({
        where: { userId },
        data: { xp: { increment: xpEarned } },
      });

      res.status(200).json({
        message: `Quiz completed successfully. You scored ${score}/5.`,
        xpEarned,
        totalXp: updatedProfile.xp,
      });
    } catch (error) {
      next(error);
    }
  }
}
