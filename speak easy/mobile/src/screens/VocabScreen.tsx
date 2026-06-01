import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { CheckCircle2, RotateCw, BookOpen, HelpCircle, Award, Check, X } from 'lucide-react-native';
import { vocabApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

const { width } = Dimensions.get('window');
const activeTheme = theme.light;

interface Word {
  id: string;
  word: string;
  wordTamil: string;
  partOfSpeech: string;
  pronunciation: string;
  definition: string;
  definitionTamil: string;
  exampleSentence: string;
  exampleSentenceTamil: string;
  synonyms: string;
  antonyms: string;
  learned: boolean;
}

interface QuizQuestion {
  id: string;
  word: string;
  partOfSpeech: string;
  definition: string;
  options: string[];
  correctAnswer: string;
}

export const VocabScreen = () => {
  const { refreshUserData } = useAuth();
  const isFocused = useIsFocused();
  const [activeTab, setActiveTab] = useState<'learn' | 'quiz'>('learn');

  // Vocab States
  const [vocabList, setVocabList] = useState<Word[]>([]);
  const [vocabLoading, setVocabLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz States
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const fetchVocab = async () => {
    try {
      setVocabLoading(true);
      const response = await vocabApi.getDailyVocab();
      setVocabList(response.data);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to load vocabulary list.');
    } finally {
      setVocabLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused && activeTab === 'learn') {
      fetchVocab();
    }
  }, [isFocused, activeTab]);

  // Flashcard Flip
  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
  };

  // Mark word learned
  const handleMarkLearned = async (wordId: string) => {
    try {
      const response = await vocabApi.markLearned(wordId);
      Alert.alert('Word Mastered!', `You earned +5 XP! Total learned count is logged.`, [
        { text: 'Awesome', onPress: () => {
          setSelectedWord(null);
          setIsFlipped(false);
          fetchVocab();
          refreshUserData();
        }}
      ]);
    } catch (e) {
      Alert.alert('Error', 'Could not save progress.');
    }
  };

  // Start Quiz
  const startQuiz = async () => {
    try {
      setQuizLoading(true);
      const response = await vocabApi.getQuiz();
      setQuizQuestions(response.data);
      setQuizStarted(true);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setQuizScore(0);
      setQuizFinished(false);
    } catch (e) {
      Alert.alert('Quiz Error', 'Could not load quiz questions. Add more words first!');
    } finally {
      setQuizLoading(false);
    }
  };

  // Handle Quiz Option Selection
  const handleSelectOption = (option: string) => {
    if (selectedAnswer) return; // ignore multiple taps

    setSelectedAnswer(option);
    const correct = quizQuestions[currentQuestionIndex].correctAnswer;
    if (option === correct) {
      setQuizScore((prev) => prev + 1);
    }
  };

  // Next Question
  const handleNextQuestion = async () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < quizQuestions.length) {
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(null);
    } else {
      // Quiz Finished! Submit score
      setQuizFinished(true);
      try {
        await vocabApi.submitQuiz(quizScore);
        refreshUserData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const renderLearnTab = () => {
    if (vocabLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0284C7" />
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Daily 20 Vocabulary Words</Text>
        <Text style={styles.sectionSubtitle}>Tap a word to open its flashcard and learn pronunciation, definitions, and examples.</Text>

        <View style={styles.listGrid}>
          {vocabList.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.wordListItem, item.learned && styles.wordListItemLearned]}
              onPress={() => {
                setSelectedWord(item);
                setIsFlipped(false);
              }}
            >
              <View style={styles.wordHeaderRow}>
                <Text style={[styles.wordTitleText, item.learned && styles.wordTitleTextLearned]}>
                  {item.word}
                </Text>
                {item.learned && <CheckCircle2 size={16} color="#16A34A" fill="#DCFCE7" />}
              </View>
              <Text style={styles.wordPartText}>{item.partOfSpeech}</Text>
              <Text style={styles.wordTamilText}>{item.wordTamil}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Modal Flashcard Overlay */}
        {selectedWord && (
          <View style={styles.modalOverlay}>
            <View style={styles.cardContainer}>
              <TouchableOpacity style={styles.cardFlipBox} onPress={handleFlipCard} activeOpacity={0.95}>
                {!isFlipped ? (
                  // CARD FRONT
                  <View style={styles.cardSide}>
                    <View style={styles.cardHeader}>
                      <BookOpen size={24} color="#0284C7" />
                      <Text style={styles.cardBadge}>{selectedWord.partOfSpeech}</Text>
                    </View>
                    <Text style={styles.cardWord}>{selectedWord.word}</Text>
                    <Text style={styles.cardPronunciation}>Phonetics: [{selectedWord.pronunciation}]</Text>
                    <Text style={styles.cardTamilWord}>Tamil: {selectedWord.wordTamil}</Text>
                    <View style={styles.flipTip}>
                      <RotateCw size={14} color="#64748B" />
                      <Text style={styles.flipTipTxt}>Tap card to reveal details</Text>
                    </View>
                  </View>
                ) : (
                  // CARD BACK
                  <ScrollView style={styles.cardSide} contentContainerStyle={{ paddingBottom: 20 }}>
                    <Text style={styles.cardWordBack}>{selectedWord.word}</Text>
                    
                    <Text style={styles.cardLabel}>Definition</Text>
                    <Text style={styles.cardDetail}>{selectedWord.definition}</Text>
                    <Text style={styles.cardTamilDetail}>{selectedWord.definitionTamil}</Text>

                    <Text style={styles.cardLabel}>Example Sentence</Text>
                    <Text style={styles.cardExample}>"{selectedWord.exampleSentence}"</Text>
                    <Text style={styles.cardTamilDetail}>{selectedWord.exampleSentenceTamil}</Text>

                    <View style={styles.synAntRow}>
                      <View style={{ width: '48%' }}>
                        <Text style={styles.cardLabel}>Synonyms</Text>
                        <Text style={styles.synAntText}>{selectedWord.synonyms}</Text>
                      </View>
                      <View style={{ width: '48%' }}>
                        <Text style={styles.cardLabel}>Antonyms</Text>
                        <Text style={styles.synAntText}>{selectedWord.antonyms}</Text>
                      </View>
                    </View>

                    <View style={styles.flipTip}>
                      <RotateCw size={14} color="#64748B" />
                      <Text style={styles.flipTipTxt}>Tap to flip back</Text>
                    </View>
                  </ScrollView>
                )}
              </TouchableOpacity>

              {/* Action Buttons */}
              <View style={styles.cardActionRow}>
                <TouchableOpacity style={styles.cardCloseBtn} onPress={() => setSelectedWord(null)}>
                  <Text style={styles.cardCloseBtnTxt}>Close</Text>
                </TouchableOpacity>

                {!selectedWord.learned && (
                  <TouchableOpacity
                    style={styles.cardLearnBtn}
                    onPress={() => handleMarkLearned(selectedWord.id)}
                  >
                    <Text style={styles.cardLearnBtnTxt}>Mark as Learned</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderQuizTab = () => {
    if (quizLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0284C7" />
        </View>
      );
    }

    if (!quizStarted) {
      return (
        <View style={styles.quizStartPanel}>
          <HelpCircle size={64} color="#0284C7" style={{ marginBottom: 16 }} />
          <Text style={styles.quizStartTitle}>Vocabulary Quiz</Text>
          <Text style={styles.quizStartDesc}>
            Test your knowledge! We will pick 5 vocabulary words from the database and challenge you to select their correct Tamil translations.
          </Text>
          <Text style={styles.quizAwardTip}>+10 XP rewarded for every correct answer!</Text>
          <TouchableOpacity style={styles.quizStartBtn} onPress={startQuiz}>
            <Text style={styles.quizStartBtnTxt}>Start Daily Quiz</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (quizFinished) {
      const percentage = Math.round((quizScore / quizQuestions.length) * 100);
      return (
        <View style={styles.quizStartPanel}>
          <Award size={64} color="#16A34A" style={{ marginBottom: 16 }} />
          <Text style={styles.quizStartTitle}>Quiz Completed!</Text>
          <Text style={styles.quizScoreVal}>{quizScore} / {quizQuestions.length}</Text>
          <Text style={styles.quizFinishPercentage}>{percentage}% correct</Text>
          <Text style={styles.quizScoreXp}>You earned +{quizScore * 10} XP!</Text>
          
          <TouchableOpacity style={styles.quizStartBtn} onPress={startQuiz}>
            <Text style={styles.quizStartBtnTxt}>Retry Quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quizBackBtn} onPress={() => setQuizStarted(false)}>
            <Text style={styles.quizBackBtnTxt}>Back to Intro</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const currentQuestion = quizQuestions[currentQuestionIndex];
    const isAnswered = selectedAnswer !== null;

    return (
      <View style={styles.quizContainer}>
        {/* Progress header */}
        <View style={styles.quizHeader}>
          <Text style={styles.quizQuestionIndex}>Question {currentQuestionIndex + 1} of {quizQuestions.length}</Text>
          <Text style={styles.quizScoreTracker}>Score: {quizScore}</Text>
        </View>

        {/* Question details */}
        <View style={styles.questionCard}>
          <Text style={styles.questionWord}>{currentQuestion.word}</Text>
          <Text style={styles.questionPart}>[{currentQuestion.partOfSpeech}]</Text>
          <Text style={styles.questionDef}>{currentQuestion.definition}</Text>
        </View>

        {/* Choices list */}
        <View style={styles.choicesWrapper}>
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQuestion.correctAnswer;
            
            let btnStyle = styles.choiceBtn;
            let iconComponent = null;

            if (isAnswered) {
              if (isCorrect) {
                btnStyle = [styles.choiceBtn, styles.choiceBtnCorrect];
                iconComponent = <Check size={18} color="#16A34A" />;
              } else if (isSelected) {
                btnStyle = [styles.choiceBtn, styles.choiceBtnIncorrect];
                iconComponent = <X size={18} color="#EF4444" />;
              }
            }

            return (
              <TouchableOpacity
                key={idx}
                style={btnStyle}
                onPress={() => handleSelectOption(option)}
                disabled={isAnswered}
              >
                <Text style={[styles.choiceTxt, isAnswered && isCorrect && styles.choiceTxtCorrect, isAnswered && isSelected && !isCorrect && styles.choiceTxtIncorrect]}>
                  {option}
                </Text>
                {iconComponent}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Next Question Trigger */}
        {isAnswered && (
          <TouchableOpacity style={styles.quizNextBtn} onPress={handleNextQuestion}>
            <Text style={styles.quizNextBtnTxt}>
              {currentQuestionIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Sub Tabs */}
      <View style={styles.tabHeader}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'learn' && styles.tabBtnActive]}
          onPress={() => setActiveTab('learn')}
        >
          <BookOpen size={16} color={activeTab === 'learn' ? '#0284C7' : '#64748B'} />
          <Text style={[styles.tabBtnTxt, activeTab === 'learn' && styles.tabBtnTxtActive]}>
            Learn Words
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'quiz' && styles.tabBtnActive]}
          onPress={() => setActiveTab('quiz')}
        >
          <HelpCircle size={16} color={activeTab === 'quiz' ? '#0284C7' : '#64748B'} />
          <Text style={[styles.tabBtnTxt, activeTab === 'quiz' && styles.tabBtnTxtActive]}>
            Daily Quiz
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Views */}
      {activeTab === 'learn' ? renderLearnTab() : renderQuizTab()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#0284C7',
  },
  tabBtnTxt: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748B',
    marginLeft: 6,
  },
  tabBtnTxtActive: {
    color: '#0284C7',
  },
  scrollContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 20,
  },
  listGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  wordListItem: {
    width: (width - 52) / 2,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  wordListItemLearned: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  wordHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  wordTitleText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  wordTitleTextLearned: {
    color: '#16A34A',
  },
  wordPartText: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
  },
  wordTamilText: {
    fontSize: 12,
    color: '#0284C7',
    fontWeight: '600',
    marginTop: 6,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 100,
    height: 700,
  },
  cardContainer: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  cardFlipBox: {
    minHeight: 280,
    justifyContent: 'center',
  },
  cardSide: {
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardBadge: {
    backgroundColor: '#E0F2FE',
    color: '#0284C7',
    fontWeight: 'bold',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardWord: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 16,
  },
  cardWordBack: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 16,
    textAlign: 'center',
  },
  cardPronunciation: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  cardTamilWord: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16A34A',
    textAlign: 'center',
    marginTop: 8,
  },
  flipTip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 36,
  },
  flipTipTxt: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 6,
    fontWeight: '500',
  },
  cardLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginTop: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  cardDetail: {
    fontSize: 15,
    color: '#0F172A',
    lineHeight: 20,
  },
  cardTamilDetail: {
    fontSize: 13,
    color: '#16A34A',
    lineHeight: 18,
    marginTop: 3,
    fontWeight: '500',
  },
  cardExample: {
    fontSize: 14,
    color: '#334155',
    fontStyle: 'italic',
    lineHeight: 19,
  },
  synAntRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  synAntText: {
    fontSize: 13,
    color: '#475569',
  },
  cardActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 16,
    marginTop: 16,
  },
  cardCloseBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginRight: 8,
  },
  cardCloseBtnTxt: {
    fontSize: 14,
    color: '#475569',
    fontWeight: 'bold',
  },
  cardLearnBtn: {
    flex: 1.5,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLearnBtnTxt: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: 'bold',
  },
  quizStartPanel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#FFF',
    borderRadius: 24,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  quizStartTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 10,
  },
  quizStartDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  quizAwardTip: {
    fontSize: 14,
    color: '#16A34A',
    fontWeight: 'bold',
    marginBottom: 36,
  },
  quizStartBtn: {
    backgroundColor: '#0284C7',
    width: '100%',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  quizStartBtnTxt: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quizBackBtn: {
    marginTop: 16,
    padding: 8,
  },
  quizBackBtnTxt: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  quizScoreVal: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#16A34A',
    marginTop: 8,
  },
  quizFinishPercentage: {
    fontSize: 16,
    color: '#475569',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  quizScoreXp: {
    fontSize: 15,
    color: '#16A34A',
    fontWeight: 'bold',
    marginBottom: 40,
  },
  quizContainer: {
    flex: 1,
    padding: 20,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  quizQuestionIndex: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  quizScoreTracker: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0284C7',
  },
  questionCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  questionWord: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
  },
  questionPart: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  questionDef: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
    textAlign: 'center',
  },
  choicesWrapper: {
    marginBottom: 24,
  },
  choiceBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  choiceBtnCorrect: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  choiceBtnIncorrect: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEE2E2',
  },
  choiceTxt: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
  },
  choiceTxtCorrect: {
    color: '#15803D',
    fontWeight: 'bold',
  },
  choiceTxtIncorrect: {
    color: '#B91C1C',
    fontWeight: 'bold',
  },
  quizNextBtn: {
    backgroundColor: '#0F172A',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  quizNextBtnTxt: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VocabScreen;
