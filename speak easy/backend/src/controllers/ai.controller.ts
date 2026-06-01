import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { OpenAIService } from '../services/openai.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as fs from 'fs';

export class AIController {
  /**
   * Text Chat with AI Coach.
   */
  static async chat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { role, userText, history } = req.body;
      if (!userText || !role) {
        return res.status(400).json({ error: 'Please provide userText and role (Teacher, Friend, etc.)' });
      }

      // 1. Get response and correction from AI
      const aiResponse = await OpenAIService.getCoachResponse(history || [], userText, role);

      // 2. Save conversation to history
      await prisma.conversationHistory.create({
        data: {
          userId,
          role,
          channel: 'Text',
          userText,
          botText: aiResponse.botText,
          corrections: aiResponse.corrections,
          explanationTamil: aiResponse.explanationTamil,
        },
      });

      // 3. Award XP (5 XP per text interaction)
      const updatedProfile = await prisma.profile.update({
        where: { userId },
        data: {
          xp: { increment: 5 },
        },
      });

      // 4. Log active minutes (0.5 minute per chat message)
      const today = new Date().toISOString().split('T')[0];
      await prisma.dailyMinutes.upsert({
        where: { userId_date: { userId, date: today } },
        update: { minutes: { increment: 1 } }, // round up to 1 minute
        create: { userId, date: today, minutes: 1 },
      });

      // Check for Elite Speaker Badge
      if (updatedProfile.xp >= 1000) {
        const eliteBadge = await prisma.badge.findUnique({ where: { title: 'Elite Speaker' } });
        if (eliteBadge) {
          await prisma.userBadge.upsert({
            where: { userId_badgeId: { userId, badgeId: eliteBadge.id } },
            update: {},
            create: { userId, badgeId: eliteBadge.id },
          });
        }
      }

      res.status(200).json({
        userText,
        botText: aiResponse.botText,
        corrections: aiResponse.corrections,
        explanationTamil: aiResponse.explanationTamil,
        xpEarned: 5,
        totalXp: updatedProfile.xp,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Voice Chat with AI Coach.
   * Expects multipart/form-data with `audio` file and `role` string.
   */
  static async voiceChat(req: AuthRequest, res: Response, next: NextFunction) {
    let audioPath = '';
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const file = req.file;
      const { role } = req.body;
      const historyJson = req.body.history; // stringified array

      if (!file) {
        return res.status(400).json({ error: 'No audio recording file uploaded.' });
      }
      if (!role) {
        return res.status(400).json({ error: 'Please specify the role persona.' });
      }

      audioPath = file.path;

      let history: { role: 'user' | 'assistant'; content: string }[] = [];
      if (historyJson) {
        try {
          history = JSON.parse(historyJson);
        } catch (e) {
          history = [];
        }
      }

      // 1. Transcribe the uploaded voice file using Whisper
      const userText = await OpenAIService.transcribeAudio(audioPath);

      // 2. Get conversational response + grammatical corrections
      const aiResponse = await OpenAIService.getCoachResponse(history, userText, role);

      // 3. Generate synthesized audio response (TTS)
      const botAudioFileName = await OpenAIService.generateVoiceResponse(aiResponse.botText);

      // 4. Save conversation to history
      await prisma.conversationHistory.create({
        data: {
          userId,
          role,
          channel: 'Voice',
          userText,
          botText: aiResponse.botText,
          botAudioUrl: botAudioFileName,
          corrections: aiResponse.corrections,
          explanationTamil: aiResponse.explanationTamil,
        },
      });

      // 5. Award XP (10 XP per voice interaction) and check Elite Speaker
      const updatedProfile = await prisma.profile.update({
        where: { userId },
        data: {
          xp: { increment: 10 },
        },
      });

      // 6. Log active minutes (adds 2 minutes per voice exchange)
      const today = new Date().toISOString().split('T')[0];
      await prisma.dailyMinutes.upsert({
        where: { userId_date: { userId, date: today } },
        update: { minutes: { increment: 2 } },
        create: { userId, date: today, minutes: 2 },
      });

      // Check badges
      if (updatedProfile.xp >= 1000) {
        const eliteBadge = await prisma.badge.findUnique({ where: { title: 'Elite Speaker' } });
        if (eliteBadge) {
          await prisma.userBadge.upsert({
            where: { userId_badgeId: { userId, badgeId: eliteBadge.id } },
            update: {},
            create: { userId, badgeId: eliteBadge.id },
          });
        }
      }

      // Trigger Mic Badge achievement
      const totalVoiceHours = await prisma.conversationHistory.count({
        where: { userId, channel: 'Voice' },
      });
      if (totalVoiceHours >= 15) { // e.g. 15 entries
        const micBadge = await prisma.badge.findUnique({ where: { title: 'Speech Champion' } });
        if (micBadge) {
          await prisma.userBadge.upsert({
            where: { userId_badgeId: { userId, badgeId: micBadge.id } },
            update: {},
            create: { userId, badgeId: micBadge.id },
          });
        }
      }

      res.status(200).json({
        userText,
        botText: aiResponse.botText,
        botAudioUrl: `/uploads/${botAudioFileName}`, // Web URL for playing the audio response
        corrections: aiResponse.corrections,
        explanationTamil: aiResponse.explanationTamil,
        xpEarned: 10,
        totalXp: updatedProfile.xp,
      });
    } catch (error) {
      next(error);
    } finally {
      // Safely delete user uploaded temp audio file
      if (audioPath && fs.existsSync(audioPath)) {
        fs.unlink(audioPath, (err) => {
          if (err) console.error('Error removing temporary file:', err);
        });
      }
    }
  }
}
