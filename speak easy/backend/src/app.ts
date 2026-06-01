import express from 'express';
import cors from 'cors';
import * as path from 'path';
import authRoutes from './routes/auth.routes';
import aiRoutes from './routes/ai.routes';
import vocabRoutes from './routes/vocab.routes';
import lessonRoutes from './routes/lesson.routes';
import userRoutes from './routes/user.routes';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve OpenAI TTS voice files statically so the mobile app can play them back
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/vocab', vocabRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'API Endpoint not found.' });
});

// Global error boundary middleware
app.use(errorMiddleware);

export default app;
