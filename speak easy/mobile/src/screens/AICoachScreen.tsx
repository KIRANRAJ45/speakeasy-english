import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Switch, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { Audio } from 'expo-av';
import { Mic, Send, Volume2, HelpCircle, ChevronDown, ChevronUp, User, Sparkles } from 'lucide-react-native';
import { aiApi, STATIC_BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

const activeTheme = theme.light;

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  audioUrl?: string;
  corrections?: string | null;
  explanationTamil?: string | null;
  showExplanation?: boolean;
}

export const AICoachScreen = () => {
  const { refreshUserData } = useAuth();
  const [role, setRole] = useState<'Teacher' | 'Friend' | 'Interviewer' | 'Tourist'>('Teacher');
  const [isVoiceMode, setIsVoiceMode] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hello! I am your AI English teacher. Speak to me or type a message, and I will correct your grammar and explain corrections in Tamil!',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Audio state variables
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Animation values for pulsing mic
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Request microphone permissions on load
    const requestPermissions = async () => {
      try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      } catch (err) {
        console.error('Failed to get mic permissions', err);
      }
    };
    requestPermissions();

    return () => {
      // Unload sound if component unmounts
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Start Mic Animation
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  // Play Bot Audio Speech File
  const playAudio = async (audioUrl: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      
      const fullUrl = audioUrl.startsWith('http') ? audioUrl : `${STATIC_BASE_URL}${audioUrl}`;
      console.log('Playing audio from:', fullUrl);

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: fullUrl },
        { shouldPlay: true }
      );
      setSound(newSound);
    } catch (error) {
      console.error('Failed to play audio response', error);
      Alert.alert('Playback Error', 'Could not play voice response.');
    }
  };

  // Text message send handler
  const handleSendText = async () => {
    if (!inputText.trim()) return;

    const userMsgText = inputText.trim();
    setInputText('');

    const newUserMsg: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: userMsgText,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    scrollToBottom();
    setLoading(true);

    try {
      // Format chat history array for OpenAI prompt context
      const chatHistory = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: m.text,
        }));

      const response = await aiApi.chat(role, userMsgText, chatHistory);
      const { botText, corrections, explanationTamil } = response.data;

      const newBotMsg: Message = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: botText,
        corrections,
        explanationTamil,
        showExplanation: false,
      };

      setMessages((prev) => [...prev, newBotMsg]);
      refreshUserData(); // update XP on dashboard
    } catch (error) {
      console.error(error);
      Alert.alert('AI Error', 'Could not connect to the AI Coach.');
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  // Start audio recording
  const startRecording = async () => {
    try {
      // Ensure audio session permissions
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Microphone Error', 'Failed to initialize recording.');
    }
  };

  // Stop recording and send audio file
  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    setLoading(true);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (!uri) throw new Error('No audio file URI found.');

      // Format chat history
      const chatHistory = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: m.text,
        }));

      const response = await aiApi.voiceChat(role, uri, chatHistory);
      const { userText, botText, botAudioUrl, corrections, explanationTamil } = response.data;

      const newUserMsg: Message = {
        id: `user_${Date.now()}`,
        sender: 'user',
        text: userText,
      };

      const newBotMsg: Message = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: botText,
        audioUrl: botAudioUrl,
        corrections,
        explanationTamil,
        showExplanation: false,
      };

      setMessages((prev) => [...prev, newUserMsg, newBotMsg]);
      refreshUserData(); // update XP

      // Auto-play the synthesized bot voice
      if (botAudioUrl) {
        playAudio(botAudioUrl);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Voice Chat Error', 'Transcription or audio process failed.');
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const toggleExplanation = (id: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, showExplanation: !msg.showExplanation } : msg
      )
    );
  };

  const personaOptions: ('Teacher' | 'Friend' | 'Interviewer' | 'Tourist')[] = [
    'Teacher',
    'Friend',
    'Interviewer',
    'Tourist',
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar / Persona Row */}
      <View style={styles.personaRow}>
        {personaOptions.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.personaTab, role === opt && styles.personaTabActive]}
            onPress={() => setRole(opt)}
          >
            <Text style={[styles.personaTxt, role === opt && styles.personaTxtActive]}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View key={msg.id} style={msg.sender === 'user' ? styles.userRow : styles.botRow}>
            {msg.sender === 'bot' && (
              <View style={styles.botAvatar}>
                <Sparkles size={16} color="#0284C7" />
              </View>
            )}

            <View style={{ maxWidth: '80%' }}>
              {/* Text Bubble */}
              <View style={[styles.bubble, msg.sender === 'user' ? styles.userBubble : styles.botBubble]}>
                <Text style={[styles.bubbleTxt, msg.sender === 'user' ? styles.userTxt : styles.botTxt]}>
                  {msg.text}
                </Text>

                {/* Play Audio Button (AI messages only) */}
                {msg.sender === 'bot' && msg.audioUrl && (
                  <TouchableOpacity style={styles.audioPlayBtn} onPress={() => playAudio(msg.audioUrl!)}>
                    <Volume2 size={16} color="#0284C7" />
                    <Text style={styles.audioPlayTxt}>Play Voice</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Grammar correction feedback for bot replies explaining the previous user message */}
              {msg.sender === 'bot' && msg.corrections && (
                <View style={styles.correctionCard}>
                  <View style={styles.correctionHeader}>
                    <HelpCircle size={14} color="#EF4444" />
                    <Text style={styles.correctionTitle}>Grammar Suggestion</Text>
                  </View>
                  <Text style={styles.correctionDetails}>{msg.corrections}</Text>

                  {/* Expandable Tamil explanation */}
                  {msg.explanationTamil && (
                    <View style={styles.tamilExplanationArea}>
                      <TouchableOpacity
                        style={styles.tamilToggle}
                        onPress={() => toggleExplanation(msg.id)}
                      >
                        <Text style={styles.tamilToggleTxt}>
                          {msg.showExplanation ? 'Hide Tamil Explanation' : 'Show Tamil Explanation'}
                        </Text>
                        {msg.showExplanation ? (
                          <ChevronUp size={14} color="#16A34A" />
                        ) : (
                          <ChevronDown size={14} color="#16A34A" />
                        )}
                      </TouchableOpacity>

                      {msg.showExplanation && (
                        <View style={styles.tamilExplanationContent}>
                          <Text style={styles.tamilExplanationTxt}>{msg.explanationTamil}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        ))}

        {loading && (
          <View style={styles.botRow}>
            <View style={styles.botAvatar}>
              <ActivityIndicator size="small" color="#0284C7" />
            </View>
            <View style={[styles.bubble, styles.botBubble]}>
              <Text style={styles.typingTxt}>AI Coach is analyzing...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Tray */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputTray}>
          {/* Mode Switcher */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Keyboard Mode</Text>
            <Switch
              value={!isVoiceMode}
              onValueChange={(val) => setIsVoiceMode(!val)}
              trackColor={{ false: '#0284C7', true: '#CBD5E1' }}
              thumbColor="#FFF"
            />
          </View>

          {/* Mode-specific input area */}
          {!isVoiceMode ? (
            // Text Keyboard Input
            <View style={styles.keyboardContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Say something to your teacher..."
                placeholderTextColor="#94A3B8"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSendText}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={handleSendText}>
                <Send size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : (
            // Voice Mic Button
            <View style={styles.voiceContainer}>
              <Text style={styles.voicePrompt}>
                {isRecording ? 'Listening... Tap to stop and send' : 'Tap to speak English'}
              </Text>
              
              <TouchableOpacity
                onPress={isRecording ? stopRecording : startRecording}
                activeOpacity={0.8}
                style={styles.micOutsideRing}
              >
                <Animated.View style={[styles.micInsideRing, isRecording && styles.micInsideRingRecording, { transform: [{ scale: pulseAnim }] }]}>
                  <Mic size={28} color={isRecording ? '#EF4444' : '#0284C7'} />
                </Animated.View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  personaRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    justifyContent: 'space-around',
  },
  personaTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  personaTabActive: {
    borderColor: '#0284C7',
    backgroundColor: '#E0F2FE',
  },
  personaTxt: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  personaTxtActive: {
    color: '#0284C7',
  },
  chatScroll: {
    flex: 1,
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  botRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '100%',
  },
  userBubble: {
    backgroundColor: '#0284C7',
    borderTopRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bubbleTxt: {
    fontSize: 15,
    lineHeight: 21,
  },
  userTxt: {
    color: '#FFF',
  },
  botTxt: {
    color: '#0F172A',
  },
  typingTxt: {
    color: '#64748B',
    fontSize: 13,
    fontStyle: 'italic',
  },
  audioPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  audioPlayTxt: {
    fontSize: 12,
    color: '#0284C7',
    fontWeight: '600',
    marginLeft: 4,
  },
  correctionCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 16,
    padding: 12,
    marginTop: 6,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  correctionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  correctionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#EF4444',
    marginLeft: 6,
  },
  correctionDetails: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  tamilExplanationArea: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 8,
    paddingTop: 8,
  },
  tamilToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tamilToggleTxt: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: 'bold',
  },
  tamilExplanationContent: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  tamilExplanationTxt: {
    fontSize: 13,
    color: '#15803D',
    lineHeight: 19,
    fontWeight: '500',
  },
  inputTray: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    padding: 16,
    alignItems: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  keyboardContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  textInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  voicePrompt: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    fontWeight: '600',
  },
  micOutsideRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micInsideRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  micInsideRingRecording: {
    backgroundColor: '#FEE2E2',
    shadowColor: '#EF4444',
  },
});

export default AICoachScreen;
