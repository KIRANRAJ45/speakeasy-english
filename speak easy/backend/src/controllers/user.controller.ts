import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/auth.middleware';

export class UserController {
  /**
   * Fetch current user's progress statistics, streak, daily minutes, badges, and recent chats.
   */
  static async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      // 1. Fetch Profile
      const profile = await prisma.profile.findUnique({
        where: { userId },
      });

      if (!profile) return res.status(404).json({ error: 'User profile not found.' });

      // 2. Fetch Daily active learning minutes
      const todayStr = new Date().toISOString().split('T')[0];
      const dailyRecord = await prisma.dailyMinutes.findUnique({
        where: { userId_date: { userId, date: todayStr } },
      });
      const activeMinutesToday = dailyRecord ? dailyRecord.minutes : 0;

      // 3. Fetch Earned Badges
      const earnedBadges = await prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true },
      });

      // 4. Count lessons completed and words learned
      const totalLessonsCompleted = await prisma.userProgress.count({ where: { userId } });
      const totalWordsLearned = await prisma.vocabularyLearned.count({ where: { userId } });

      // 5. Fetch Recent AI Conversations (last 10 messages)
      const recentConversations = await prisma.conversationHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      res.status(200).json({
        profile,
        activeMinutesToday, // how many minutes of the 30-min goal are completed
        totalLessonsCompleted,
        totalWordsLearned,
        badges: earnedBadges.map((b) => b.badge),
        recentConversations: recentConversations.reverse(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch XP Leaderboard rankings.
   */
  static async getLeaderboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const leaders = await prisma.profile.findMany({
        orderBy: { xp: 'desc' },
        take: 20,
        select: {
          name: true,
          level: true,
          xp: true,
          streak: true,
          avatarUrl: true,
        },
      });

      res.status(200).json(leaders);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Profile data.
   */
  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { name, level, avatarUrl } = req.body;

      const updated = await prisma.profile.update({
        where: { userId },
        data: {
          name: name !== undefined ? name : undefined,
          level: level !== undefined ? level : undefined,
          avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
        },
      });

      res.status(200).json({
        message: 'Profile updated successfully!',
        profile: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
