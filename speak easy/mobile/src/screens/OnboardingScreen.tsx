import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowRight, Mic, BookOpen, Sparkles } from 'lucide-react-native';
import { theme } from '../theme/theme';

const { width, height } = Dimensions.get('window');
const activeTheme = theme.light;

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  tamilSubtitle: string;
  icon: React.ReactNode;
  bg: string;
}

const slides: Slide[] = [
  {
    id: '1',
    title: 'Learn Spoken English',
    subtitle: 'Daily 30-minute practice to build fluently spoken English and confidence.',
    tamilSubtitle: 'தினமும் 30 நிமிட பயிற்சியில் சரளமாக ஆங்கிலம் பேச கற்றுக்கொள்ளுங்கள்.',
    icon: <Sparkles size={100} color={activeTheme.primary} />,
    bg: '#F0F9FF',
  },
  {
    id: '2',
    title: 'AI Speaking Coach',
    subtitle: 'Voice chat with our AI. Get instant grammar corrections explained in Tamil.',
    tamilSubtitle: 'AI ஆசிரியருடன் பேசுங்கள். உங்கள் தவறுகளை தமிழில் எளிதாகப் புரிந்து கொள்ளுங்கள்.',
    icon: <Mic size={100} color={activeTheme.secondary} />,
    bg: '#F0FDF4',
  },
  {
    id: '3',
    title: 'Vocabulary Builder',
    subtitle: 'Learn 20 new words daily with flashcards, pronunciation checks, and quizzes.',
    tamilSubtitle: 'தினமும் 20 புதிய சொற்கள், ஃபிளாஷ் கார்டுகள் மற்றும் வினாடி வினாக்கள்.',
    icon: <BookOpen size={100} color={activeTheme.primary} />,
    bg: '#F5F3FF',
  },
];

export const OnboardingScreen = ({ navigation }: any) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const updateCurrentSlideIndex = (e: any) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };

  const handleNext = async () => {
    const nextIndex = currentSlideIndex + 1;
    if (nextIndex < slides.length) {
      flatListRef.current?.scrollToIndex({ index: nextIndex });
      setCurrentSlideIndex(nextIndex);
    } else {
      // End of slides
      await AsyncStorage.setItem('onboarding_completed', 'true');
      navigation.replace('Login');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboarding_completed', 'true');
    navigation.replace('Login');
  };

  const renderSlide = ({ item }: { item: Slide }) => {
    return (
      <View style={[styles.slideContainer, { backgroundColor: item.bg }]}>
        <View style={styles.iconWrapper}>
          {item.icon}
        </View>
        <View style={styles.textWrapper}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
          <Text style={styles.tamilSubtitle}>{item.tamilSubtitle}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      {currentSlideIndex < slides.length - 1 && (
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipTxt}>Skip</Text>
        </TouchableOpacity>
      )}

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        keyExtractor={(item) => item.id}
      />

      {/* Footer (Dots + Next Button) */}
      <View style={styles.footer}>
        {/* Slide Indicator Dots */}
        <View style={styles.indicatorContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentSlideIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>

        {/* Next / Start Button */}
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnTxt}>
            {currentSlideIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <ArrowRight size={18} color="#FFF" style={styles.arrowIcon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  skipBtn: {
    position: 'absolute',
    top: 40,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  skipTxt: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  slideContainer: {
    width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconWrapper: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  textWrapper: {
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  tamilSubtitle: {
    fontSize: 15,
    color: '#16A34A',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: 'transparent',
  },
  indicatorContainer: {
    flexDirection: 'row',
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 20,
    backgroundColor: '#0284C7',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  nextBtnTxt: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  arrowIcon: {
    marginLeft: 6,
  },
});

export default OnboardingScreen;
