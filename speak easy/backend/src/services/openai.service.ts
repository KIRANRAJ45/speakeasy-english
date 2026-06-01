import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
});

// Directory to save synthesized voice responses
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export interface CoachResponse {
  botText: string;
  corrections: string | null;
  explanationTamil: string | null;
}

export class OpenAIService {
  /**
   * Transcribes audio using OpenAI Whisper.
   * @param filePath Absolute path to the recorded audio file.
   */
  static async transcribeAudio(filePath: string): Promise<string> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        console.warn('OpenAI API Key not set. Using mock transcription.');
        return "I wants to learn English"; // Mock user input with a grammar error
      }

      const response = await openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: 'whisper-1',
        language: 'en',
      });

      return response.text;
    } catch (error) {
      console.error('Error in transcribeAudio:', error);
      throw new Error('Failed to transcribe audio.');
    }
  }

  /**
   * Synthesizes text to speech using OpenAI TTS.
   * Saves the audio locally and returns the file path.
   * @param text The text dialogue to speak.
   */
  static async generateVoiceResponse(text: string): Promise<string> {
    try {
      const fileName = `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.mp3`;
      const outputPath = path.join(UPLOADS_DIR, fileName);

      if (!process.env.OPENAI_API_KEY) {
        console.warn('OpenAI API Key not set. Returning dummy audio path.');
        // Write a small dummy file so the endpoint doesn't fail
        fs.writeFileSync(outputPath, 'dummy audio data');
        return fileName;
      }

      const response = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy', // friendly, balanced voice
        input: text,
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      await fs.promises.writeFile(outputPath, buffer);

      return fileName;
    } catch (error) {
      console.error('Error in generateVoiceResponse:', error);
      throw new Error('Failed to generate speech.');
    }
  }

  /**
   * Generates a conversational response, corrects grammar mistakes, and provides explanations in Tamil.
   * @param history Prior chat history array.
   * @param userText Current input message from the user.
   * @param role Selected AI role (e.g. Teacher, Friend, Interviewer, Customer, Tourist).
   */
  static async getCoachResponse(
    history: { role: 'user' | 'assistant'; content: string }[],
    userText: string,
    role: string
  ): Promise<CoachResponse> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        // Return dummy responses if API Key is not set
        const dummyCorrections = userText.toLowerCase().includes('wants')
          ? 'Incorrect: "I wants to learn English". Correct: "I want to learn English".'
          : null;
        const dummyExplanation = userText.toLowerCase().includes('wants')
          ? '"I" என்பது பன்மை வினையைக் குறிக்கும் (First Person). எனவே, எளிய நிகழ்காலத்தில் "wants" என்று வராது, "want" என்றுதான் வர வேண்டும்.'
          : null;

        return {
          botText: `Hello! I am your AI ${role}. You said: "${userText}". Let's practice speaking English!`,
          corrections: dummyCorrections,
          explanationTamil: dummyExplanation,
        };
      }

      const personaPrompts: Record<string, string> = {
        Teacher: 'You are a patient and supportive English Teacher. Help the user speak better English. Guide them, ask follow-up questions, and encourage them to explain details.',
        Friend: 'You are a warm, casual, and friendly speaking partner. Talk to the user naturally about their day, interests, movies, hobbies, or food, just like a close friend would.',
        Interviewer: 'You are a professional HR Interviewer. Conduct a job interview. Ask typical interview questions, ask them to expand on their resume, and respond professionally.',
        Customer: 'You are a demanding or busy customer in a restaurant or hotel. The user is the receptionist or waiter. Converse realistically.',
        Tourist: 'You are a lost tourist asking for directions or ordering local food. The user is a helpful local showing you around.',
      };

      const baseInstruction = `
You are SpeakEasy English, an AI Speaking Coach. Your target user is a Tamil speaker learning English.
Current persona: ${personaPrompts[role] || personaPrompts.Teacher}

Analyze the user's latest statement: "${userText}".
Perform the following checks:
1. Identify if the user's sentence contains grammatical mistakes (e.g., tense errors, subject-verb disagreement, incorrect prepositions, awkward phrasing).
2. If there are errors, construct a correction explaining what is wrong and how to fix it in simple, encouraging Tamil. Suggest 1-2 better sentence forms.
3. Formulate your conversational response in English. Keep it simple, natural, and limited to 2-3 sentences. Ask a follow-up question.

You MUST respond strictly in the following JSON format:
{
  "botText": "Your dialogue response in English matching your persona.",
  "corrections": "Original sentence compared to corrected sentence, or null if the user's English is fully correct.",
  "explanationTamil": "Detailed explanation of the mistake, rules, and suggestions written in Tamil, or null if no corrections are needed."
}

Do not include any markdown format tags like \`\`\`json around the response. Return raw JSON.
`;

      const messages: any[] = [
        { role: 'system', content: baseInstruction },
        ...history.slice(-6), // Include last 6 messages for context
        { role: 'user', content: userText },
      ];

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
      });

      const rawContent = response.choices[0].message.content?.trim() || '{}';
      
      try {
        // Strip markdown backticks if OpenAI mistakenly wraps JSON
        const cleanContent = rawContent.replace(/^```json/, '').replace(/```$/, '').trim();
        const parsed: CoachResponse = JSON.parse(cleanContent);
        return {
          botText: parsed.botText || 'I see. Please go on!',
          corrections: parsed.corrections || null,
          explanationTamil: parsed.explanationTamil || null,
        };
      } catch (jsonErr) {
        console.error('Error parsing JSON from OpenAI content:', rawContent);
        return {
          botText: rawContent.substring(0, 200),
          corrections: null,
          explanationTamil: null,
        };
      }
    } catch (error) {
      console.error('Error in getCoachResponse:', error);
      return {
        botText: "Sorry, I'm experiencing connection issues with my brain right now. Can you try again?",
        corrections: null,
        explanationTamil: null,
      };
    }
  }
}
