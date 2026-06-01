# SpeakEasy English 🚀

A complete, production-ready, and scalable mobile learning application helping Tamil-speaking users learn Spoken English fluently through daily 30-minute practice sessions, vocabulary builder modules, grammar lessons, and an interactive AI Coach.

---

## Folder Structure

```text
speak-easy/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # PostgreSQL Database Schema
│   │   └── seed.ts            # Database seeds (badges, grammar lessons, vocabulary)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts          # Database client configuration
│   │   ├── controllers/
│   │   │   ├── ai.controller.ts     # Handles voice transcription, ChatGPT prompt, and TTS voice response
│   │   │   ├── auth.controller.ts   # Registration, JWT login, and Google Sign-in stubs
│   │   │   ├── lesson.controller.ts # Serves grammar content and marks completions
│   │   │   ├── user.controller.ts   # Retrieves stats, streak data, and leaderboard
│   │   │   └── vocab.controller.ts  # Daily 20 words list, learn tracking, and random quizzes
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts   # Intercepts HTTP headers to verify JWT tokens
│   │   │   └── error.middleware.ts  # Global backend error handler
│   │   ├── routes/
│   │   │   ├── ai.routes.ts         # Routes voice upload with Multer to AI controller
│   │   │   ├── auth.routes.ts
│   │   │   ├── lesson.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   └── vocab.routes.ts
│   │   ├── services/
│   │   │   └── openai.service.ts    # Integrates Whisper STT, TTS voice synthesis, and GPT-4o-mini
│   │   ├── app.ts             # Instantiates Express, middleware routing, and uploads folders
│   │   └── server.ts           # Runner script
│   ├── package.json           # Backend NPM dependencies
│   ├── tsconfig.json          # TS config
│   └── .env.example           # Example environmental file
├── mobile/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.tsx # Context provider managing active JWT session states
│   │   ├── navigation/
│   │   │   └── AppNavigator.tsx# React Navigation bottom tabs and authentication gates
│   │   ├── screens/
│   │   │   ├── AICoachScreen.tsx # Voice mic recorder, audio replay, grammar edits, Tamil popup banner
│   │   │   ├── ForgotPasswordScreen.tsx
│   │   │   ├── HomeScreen.tsx    # Daily study goal progress, streaks, badges, shortcuts
│   │   │   ├── LoginScreen.tsx   # Sign-in and Google Sign-in triggers
│   │   │   ├── ProfileScreen.tsx # Editing profile settings and competitive leaderboard
│   │   │   ├── RegisterScreen.tsx# Creates account with English level selector (Beginner to Advanced)
│   │   │   ├── ScenariosScreen.tsx# Speaking scenarios mapping (Office, Hotel, lost tourist, class)
│   │   │   └── VocabScreen.tsx   # Flip-to-reveal vocabulary flashcards and multiple-choice quizzes
│   │   ├── services/
│   │   │   └── api.ts            # Client Axios connection service with token injector
│   │   └── theme/
│   │       └── theme.ts          # Light/Dark soft peaceful color design tokens
│   ├── App.tsx                # Entry point
│   ├── app.json               # Expo configuration specifying Android/iOS mic permissions
│   ├── package.json           # Mobile NPM dependencies
│   └── tsconfig.json          # TS config
└── README.md                  # Deployment Guide (This file)
```

---

## Prerequisites
* **Node.js** (v18 or higher recommended)
* **PostgreSQL** (Active local database or hosted Instance)
* **OpenAI API Key** (Required for Speech-to-Text transcription, voice synthesis, and grammar coach explanations)

---

## Setup & Running Instructions

### Step 1: Set up the Backend Database

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install the server dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   copy .env.example .env
   ```
4. Edit the `.env` file and replace the `DATABASE_URL` with your local PostgreSQL connection string and provide your `OPENAI_API_KEY`:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/speakeasy?schema=public"
   JWT_SECRET="your-jwt-secret-key-change-this-in-production"
   OPENAI_API_KEY="sk-proj-YOUR-OPENAI-KEY-HERE"
   ```
5. Run the Prisma database migrations to create tables on your PostgreSQL database:
   ```bash
   npm run prisma:migrate
   ```
6. Seed the database with core vocabulary, grammar lessons, and achievements:
   ```bash
   npm run prisma:seed
   ```

### Step 2: Start the Backend Server

Start the development server with hot-reload:
```bash
npm run dev
```
The server will boot on `http://localhost:5000` (or whichever port is defined in `.env`).

---

### Step 3: Run the Mobile Application

1. Open a new terminal and navigate to the `mobile` folder:
   ```bash
   cd mobile
   ```
2. Install the client dependencies:
   ```bash
   npm install
   ```
3. Boot the Expo bundler:
   ```bash
   npm start
   ```
4. **Testing on a device**:
   * Download the **Expo Go** app on your Android or iOS phone.
   * Ensure your phone is connected to the *same Wi-Fi network* as your computer.
   * Scan the QR code displayed in the terminal with your phone camera (iOS) or Expo Go scan feature (Android) to launch the app!
5. **Testing on Emulators**:
   * Hit `a` in the terminal to load the Android emulator.
   * Hit `i` in the terminal to load the iOS simulator.

*Note: The mobile API service automatically handles connecting to `10.0.2.2:5000` on Android Emulators, and `localhost:5000` on iOS Emulators.*

---

## Key Features Under the Hood

1. **AI Speaking Coach**: 
   * Leverages OpenAI Whisper to transcribe the user's spoken audio directly.
   * Prompts GPT-4o-mini to return a strict JSON payload indicating whether the user's English has mistakes, providing a corrected format, and explaining the grammar rule in natural **Tamil**.
   * Employs OpenAI TTS (`tts-1`) to synthesize the teacher's reply dialogue as a playable MP3 file stored locally on the server.
2. **Grammar and Vocabulary Building**:
   * Pre-loads 20 core vocabulary words complete with Tamil meanings, phonetics, examples, and synonyms/antonyms.
   * Provides animated flashcards that flip on tap.
   * Generates dynamic quizzes by matching words against randomized choices.
3. **Daily Progress & Gamification**:
   * Active minutes counter tracking the user's daily progress toward their 30-minute target.
   * Active daily streak counter.
   * Automatically unlocks custom badges when milestones are reached.
   * Displays a global leaderboard to motivate users.
