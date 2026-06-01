import { Router } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { AIController } from '../controllers/ai.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

// Ensure temp directory exists
const tempDir = path.join(__dirname, '../../uploads/temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Multer configuration for temporary voice recording uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.m4a';
    cb(null, `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`);
  },
});

const upload = multer({ storage });
const router = Router();

router.post('/chat', authMiddleware, AIController.chat);
router.post('/voice-chat', authMiddleware, upload.single('audio'), AIController.voiceChat);

export default router;
