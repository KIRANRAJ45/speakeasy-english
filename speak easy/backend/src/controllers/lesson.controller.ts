import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/auth.middleware';

export class LessonController {
  /**
   * Get all lessons with completion status.
   */
  static async getLessons(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const lessons = await prisma.lesson.findMany({
        orderBy: { createdAt: 'asc' },
      });

      const completedRecords = await prisma.userProgress.findMany({
        where: { userId },
        select: { lessonId: true },
      });

      const completedIds = new Set(completedRecords.map((r) => r.lessonId));

      const mapped = lessons.map((l) => ({
        ...l,
        completed: completedIds.has(l.id),
      }));

      res.status(200).json(mapped);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark a lesson as completed.
   */
  static async completeLesson(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { lessonId } = req.body;
      if (!lessonId) return res.status(400).json({ error: 'Please provide lessonId.' });

      const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
      if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });

      // Save progress (ignore if already completed)
      await prisma.userProgress.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        update: {},
        create: { userId, lessonId },
      });

      // Award XP
      const updatedProfile = await prisma.profile.update({
        where: { userId },
        data: { xp: { increment: lesson.xpReward } },
      });

      // Check for Grammar Master Badge (earned when user completes 3 grammar lessons)
      const countCompletedGrammar = await prisma.userProgress.count({
        where: {
          userId,
          lesson: { category: 'Grammar' },
        },
      });

      if (countCompletedGrammar >= 3) {
        const grammarBadge = await prisma.badge.findUnique({ where: { title: 'Grammar Master' } });
        if (grammarBadge) {
          await prisma.userBadge.upsert({
            where: { userId_badgeId: { userId, badgeId: grammarBadge.id } },
            update: {},
            create: { userId, badgeId: grammarBadge.id },
          });
        }
      }

      res.status(200).json({
        message: 'Lesson completed successfully!',
        xpEarned: lesson.xpReward,
        totalXp: updatedProfile.xp,
        countCompletedGrammar,
      });
    } catch (error) {
      next(error);
    }
  }
}
