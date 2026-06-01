import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Briefcase, Hotel, ShieldAlert, Coffee, Compass, ShoppingBag, ArrowRight } from 'lucide-react-native';
import { theme } from '../theme/theme';

const activeTheme = theme.light;

interface Scenario {
  id: string;
  title: string;
  tamilTitle: string;
  description: string;
  tamilDescription: string;
  icon: React.ReactNode;
  role: 'Teacher' | 'Friend' | 'Interviewer' | 'Tourist';
  color: string;
}

const scenarios: Scenario[] = [
  {
    id: '1',
    title: 'Job Interview Practice',
    tamilTitle: 'வேலை நேர்காணல் பயிற்சி',
    description: 'Practice responding to tough HR questions and introducing yourself.',
    tamilDescription: 'HR கேள்விகளுக்கு எவ்வாறு பதிலளிப்பது என்று பயிற்சி செய்யுங்கள்.',
    icon: <Briefcase size={24} color="#0284C7" />,
    role: 'Interviewer',
    color: '#E0F2FE',
  },
  {
    id: '2',
    title: 'Catching Up with a Friend',
    tamilTitle: 'நண்பருடன் சாதாரண உரையாடல்',
    description: 'Talk naturally about movies, hobbies, food, and weather.',
    tamilDescription: 'சினிமா, பொழுதுபோக்கு, உணவு பற்றி இயல்பாகப் பேசி பழகுங்கள்.',
    icon: <Coffee size={24} color="#16A34A" />,
    role: 'Friend',
    color: '#DCFCE7',
  },
  {
    id: '3',
    title: 'Lost in a New City',
    tamilTitle: 'புதிய நகரத்தில் முகவரி தேடுதல்',
    description: 'Ask for directions, order transport, and talk as a tourist.',
    tamilDescription: 'திசைகள் கேட்பது, பேருந்து/வண்டி முன்பதிவு செய்வது எப்படி?',
    icon: <Compass size={24} color="#8B5CF6" />,
    role: 'Tourist',
    color: '#F3E8FF',
  },
  {
    id: '4',
    title: 'English Classroom',
    tamilTitle: 'ஆங்கில வகுப்பறை',
    description: 'Learn step-by-step vocabulary corrections and sentence grammar.',
    tamilDescription: 'ஆங்கில இலக்கண விதிகளை எளிய முறையில் கற்றுக் கொள்ளுங்கள்.',
    icon: <ShieldAlert size={24} color="#EA580C" />, // Teacher alert icon
    role: 'Teacher',
    color: '#FFEDD5',
  },
];

export const ScenariosScreen = ({ navigation }: any) => {
  const handleSelectScenario = (role: string) => {
    // Navigate to AI Coach and set the parameters
    navigation.navigate('AI Coach', { screen: 'AI Coach', params: { role } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Real-life Speaking Practice</Text>
        <Text style={styles.subtitle}>
          Select a real-world context scenario. Speak to the AI coach who will simulate the partner and correct your phrasing.
        </Text>

        <View style={styles.grid}>
          {scenarios.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, { backgroundColor: item.color }]}
              onPress={() => handleSelectScenario(item.role)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconBg}>{item.icon}</View>
                <ArrowRight size={18} color="#475569" />
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardTamilTitle}>{item.tamilTitle}</Text>
                <Text style={styles.cardDesc}>{item.description}</Text>
                <Text style={styles.cardTamilDesc}>{item.tamilDescription}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'column',
  },
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    marginTop: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  cardTamilTitle: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
    marginTop: 2,
  },
  cardDesc: {
    fontSize: 12,
    color: '#475569',
    marginTop: 8,
    lineHeight: 16,
  },
  cardTamilDesc: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '500',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default ScenariosScreen;
