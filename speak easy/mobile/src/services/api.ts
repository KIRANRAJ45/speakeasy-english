import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Auto-detect environments: 10.0.2.2 for Android Emulator, localhost for iOS simulator
export const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
export const STATIC_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000, // extend timeout to allow for Whisper & TTS audio generation
});

// Automatically inject JWT token into requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('user_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('SecureStore error:', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authApi = {
  signup: (data: { email: string; password; name: string; level?: string }) =>
    api.post('/auth/signup', data),
  login: (data: { email: string; password }) =>
    api.post('/auth/login', data),
  googleSignIn: (data: { email: string; name: string; idToken?: string }) =>
    api.post('/auth/google-signin', data),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
};

export const userApi = {
  getDashboard: () => api.get('/users/dashboard'),
  getLeaderboard: () => api.get('/users/leaderboard'),
  updateProfile: (data: { name?: string; level?: string; avatarUrl?: string }) =>
    api.put('/users/profile', data),
};

export const vocabApi = {
  getDailyVocab: () => api.get('/vocab/daily'),
  markLearned: (vocabularyId: string) =>
    api.post('/vocab/learn', { vocabularyId }),
  getQuiz: () => api.get('/vocab/quiz'),
  submitQuiz: (score: number) =>
    api.post('/vocab/quiz-submit', { score }),
};

export const lessonApi = {
  getLessons: () => api.get('/lessons'),
  completeLesson: (lessonId: string) =>
    api.post('/lessons/complete', { lessonId }),
};

export const aiApi = {
  chat: (role: string, userText: string, history: any[]) =>
    api.post('/ai/chat', { role, userText, history }),

  voiceChat: async (role: string, audioUri: string, history: any[]) => {
    const formData = new FormData();
    formData.append('role', role);
    formData.append('history', JSON.stringify(history));

    const filename = audioUri.split('/').pop() || 'voice_recording.m4a';
    
    // Create the file attachment object matching React Native's FormData rules
    formData.append('audio', {
      uri: Platform.OS === 'ios' ? audioUri.replace('file://', '') : audioUri,
      name: filename,
      type: 'audio/m4a', // matches typical recording types
    } as any);

    return api.post('/ai/voice-chat', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;
