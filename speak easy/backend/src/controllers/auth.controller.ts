import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const signToken = (user: { id: string; email: string; role: string }) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production',
    { expiresIn: '30d' }
  );
};

export class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name, level } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Please provide email, password, and name.' });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'A user with this email already exists.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      // Create user and profile in a transaction
      const newUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            passwordHash,
            role: 'USER',
            profile: {
              create: {
                name,
                level: level || 'Beginner',
                xp: 10, // give 10 starting XP
                streak: 1,
                lastActive: new Date(),
              },
            },
          },
          include: {
            profile: true,
          },
        });

        // Award 'Welcome aboard' badge if it exists
        const welcomeBadge = await tx.badge.findUnique({ where: { title: 'Welcome aboard' } });
        if (welcomeBadge) {
          await tx.userBadge.create({
            data: {
              userId: user.id,
              badgeId: welcomeBadge.id,
            },
          });
        }

        return user;
      });

      const token = signToken(newUser);

      res.status(201).json({
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          profile: newUser.profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password.' });
      }

      const user = await prisma.user.findUnique({
        where: { email },
        include: { profile: true },
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // Update last active and update streak if it's a new day
      if (user.profile) {
        const today = new Date().toDateString();
        const lastActiveDate = user.profile.lastActive
          ? new Date(user.profile.lastActive).toDateString()
          : null;

        let newStreak = user.profile.streak;
        if (lastActiveDate !== today) {
          if (lastActiveDate) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastActiveDate === yesterday.toDateString()) {
              newStreak += 1;
            } else {
              newStreak = 1; // reset streak if they missed a day
            }
          } else {
            newStreak = 1;
          }

          // Trigger badge achievements
          if (newStreak === 3) {
            const streakBadge = await prisma.badge.findUnique({ where: { title: 'Starter Streak' } });
            if (streakBadge) {
              await prisma.userBadge.upsert({
                where: { userId_badgeId: { userId: user.id, badgeId: streakBadge.id } },
                update: {},
                create: { userId: user.id, badgeId: streakBadge.id },
              });
            }
          }
        }

        await prisma.profile.update({
          where: { userId: user.id },
          data: {
            lastActive: new Date(),
            streak: newStreak,
          },
        });

        user.profile.streak = newStreak;
      }

      const token = signToken(user);

      res.status(200).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user.profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async googleSignIn(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, name, idToken } = req.body;

      if (!email || !name) {
        return res.status(400).json({ error: 'Invalid Google login payload.' });
      }

      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email },
        include: { profile: true },
      });

      if (!user) {
        // Create user with dummy password (since they login via Google)
        const passwordHash = await bcrypt.hash(Math.random().toString(36), 10);
        user = await prisma.$transaction(async (tx) => {
          const u = await tx.user.create({
            data: {
              email,
              passwordHash,
              role: 'USER',
              profile: {
                create: {
                  name,
                  level: 'Beginner',
                  xp: 10,
                  streak: 1,
                  lastActive: new Date(),
                },
              },
            },
            include: { profile: true },
          });

          const welcomeBadge = await tx.badge.findUnique({ where: { title: 'Welcome aboard' } });
          if (welcomeBadge) {
            await tx.userBadge.create({
              data: { userId: u.id, badgeId: welcomeBadge.id },
            });
          }

          return u;
        });
      }

      const token = signToken(user);

      res.status(200).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user.profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Please enter your email address.' });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: 'No user registered with this email address.' });
      }

      // Mock sending password reset email
      res.status(200).json({
        message: 'Password reset link sent to your email (Mocked). Please check your inbox.',
      });
    } catch (error) {
      next(error);
    }
  }
}
