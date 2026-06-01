import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Image, Dimensions, RefreshControl } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Zap, BookOpen, Mic, Trophy, ArrowRight, Play, Star } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';
import { theme } from '../theme/theme';

const { width } = Dimensions.get('window');
const activeTheme = theme.light;

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const response = await userApi.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to load dashboard', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchDashboard();
    }
  }, [isFocused]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading && !dashboardData) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0284C7" />
      </View>
    );
  }

  const profile = dashboardData?.profile || user?.profile || {};
  const activeMinutes = dashboardData?.activeMinutesToday || 0;
  const targetMinutes = 30;
  const progressPercent = Math.min(100, Math.round((activeMinutes / targetMinutes) * 100));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0284C7']} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeRow}>
          <View>
            <Text style={styles.welcomeGreeting}>Vanakkam, 👋</Text>
            <Text style={styles.welcomeName}>{profile.name || 'Student'}</Text>
          </View>
          <View style={styles.streakBadge}>
            <Zap size={18} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.streakTxt}>{profile.streak || 0} Days</Text>
          </View>
        </View>

        {/* Daily 30 Minute Plan Tracker */}
        <View style={styles.targetCard}>
          <View style={styles.targetHeader}>
            <Text style={styles.targetTitle}>Daily Practice Target</Text>
            <Text style={styles.targetStat}>{activeMinutes} / {targetMinutes} Mins</Text>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>

          <View style={styles.targetFooter}>
            <Text style={styles.progressPercentText}>{progressPercent}% completed</Text>
            <Text style={styles.targetTip}>Practice voice chat to achieve your target!</Text>
          </View>
        </View>

        {/* Quick Launch Actions */}
        <Text style={styles.sectionHeader}>Practice Modules</Text>
        <View style={styles.row}>
          {/* Coach Quick Button */}
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#E0F2FE' }]}
            onPress={() => navigation.navigate('AI Coach')}
          >
            <View style={[styles.actionIconWrapper, { backgroundColor: '#0284C7' }]}>
              <Mic size={24} color="#FFF" />
            </View>
            <Text style={styles.actionTitle}>AI Speaking Coach</Text>
            <Text style={styles.actionDesc}>Voice & text chat with grammar suggestions</Text>
            <View style={styles.startBadge}>
              <Play size={12} color="#FFF" fill="#FFF" />
              <Text style={styles.startBadgeTxt}>Speak</Text>
            </View>
          </TouchableOpacity>

          {/* Vocab Quick Button */}
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#DCFCE7' }]}
            onPress={() => navigation.navigate('Learn')}
          >
            <View style={[styles.actionIconWrapper, { backgroundColor: '#16A34A' }]}>
              <BookOpen size={24} color="#FFF" />
            </View>
            <Text style={styles.actionTitle}>Vocabulary Builder</Text>
            <Text style={styles.actionDesc}>Master 20 daily words with flip flashcards</Text>
            <View style={[styles.startBadge, { backgroundColor: '#16A34A' }]}>
              <ArrowRight size={12} color="#FFF" />
              <Text style={styles.startBadgeTxt}>Learn</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stat counters */}
        <View style={styles.statsPanel}>
          <View style={styles.statBox}>
            <Trophy size={20} color="#0284C7" />
            <Text style={styles.statValue}>{profile.xp || 0}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statBox}>
            <BookOpen size={20} color="#16A34A" />
            <Text style={styles.statValue}>{dashboardData?.totalWordsLearned || 0}</Text>
            <Text style={styles.statLabel}>Words Learned</Text>
          </View>
          <View style={styles.statBox}>
            <Star size={20} color="#8B5CF6" />
            <Text style={styles.statValue}>{dashboardData?.totalLessonsCompleted || 0}</Text>
            <Text style={styles.statLabel}>Lessons Done</Text>
          </View>
        </View>

        {/* Earned Badges Row */}
        {dashboardData?.badges && dashboardData.badges.length > 0 && (
          <View style={styles.badgesSection}>
            <Text style={styles.sectionHeader}>Your Achievements</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesList}>
              {dashboardData.badges.map((badge: any, index: number) => (
                <View key={index} style={styles.badgeItem}>
                  <View style={styles.badgeIconBg}>
                    <Trophy size={24} color="#F59E0B" />
                  </View>
                  <Text style={styles.badgeTitle} numberOfLines={1}>
                    {badge.title}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeGreeting: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  welcomeName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  streakTxt: {
    color: '#D97706',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 4,
  },
  targetCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 28,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  targetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  targetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  targetStat: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0284C7',
  },
  progressBarBg: {
    height: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0284C7',
    borderRadius: 6,
  },
  targetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPercentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  targetTip: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionCard: {
    width: (width - 56) / 2,
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
    minHeight: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  actionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  actionDesc: {
    fontSize: 11,
    color: '#475569',
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 15,
  },
  startBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#0284C7',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  startBadgeTxt: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 3,
  },
  statsPanel: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingVertical: 16,
    justifyContent: 'space-around',
    marginBottom: 28,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  statBox: {
    alignItems: 'center',
    width: '30%',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  badgesSection: {
    marginBottom: 20,
  },
  badgesList: {
    flexDirection: 'row',
  },
  badgeItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  badgeIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  badgeTitle: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default HomeScreen;
