import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { User, LogOut, Award, ShieldAlert, Check, Edit2 } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';
import { theme } from '../theme/theme';

const activeTheme = theme.light;

interface LeaderboardUser {
  name: string;
  level: string;
  xp: number;
  streak: number;
  avatarUrl: string | null;
}

export const ProfileScreen = () => {
  const { user, logout, updateUser } = useAuth();
  const isFocused = useIsFocused();

  // Profile Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.profile?.name || '');
  const [editLevel, setEditLevel] = useState(user?.profile?.level || 'Beginner');
  const [updating, setUpdating] = useState(false);

  // Leaderboard States
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setLeaderboardLoading(true);
      const response = await userApi.getLeaderboard();
      setLeaderboard(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchLeaderboard();
    }
  }, [isFocused]);

  const handleUpdateProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }

    setUpdating(true);
    try {
      const response = await userApi.updateProfile({
        name: editName.trim(),
        level: editLevel,
      });
      updateUser(response.data.profile);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
      fetchLeaderboard(); // refresh leaderboard names
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile settings.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarBg}>
            <User size={36} color="#0284C7" />
          </View>

          {!isEditing ? (
            // Display Mode
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.profile?.name || 'Student'}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeTxt}>{user?.profile?.level || 'Beginner'}</Text>
              </View>

              <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
                <Edit2 size={14} color="#64748B" />
                <Text style={styles.editBtnTxt}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Edit Mode
            <View style={styles.editForm}>
              <TextInput
                style={styles.textInput}
                placeholder="Full Name"
                value={editName}
                onChangeText={setEditName}
              />

              <Text style={styles.label}>Proficiency Level:</Text>
              <View style={styles.levelSelectRow}>
                {levels.map((lvl) => (
                  <TouchableOpacity
                    key={lvl}
                    style={[styles.lvlBtn, editLevel === lvl && styles.lvlBtnActive]}
                    onPress={() => setEditLevel(lvl)}
                  >
                    <Text style={[styles.lvlBtnTxt, editLevel === lvl && styles.lvlBtnTxtActive]}>
                      {lvl}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.editActionRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setIsEditing(false);
                    setEditName(user?.profile?.name || '');
                    setEditLevel(user?.profile?.level || 'Beginner');
                  }}
                  disabled={updating}
                >
                  <Text style={styles.cancelBtnTxt}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleUpdateProfile}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Check size={14} color="#FFF" style={{ marginRight: 4 }} />
                      <Text style={styles.saveBtnTxt}>Save</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Leaderboard Section */}
        <Text style={styles.sectionHeader}>XP Leaderboard</Text>
        <View style={styles.leaderboardCard}>
          {leaderboardLoading ? (
            <ActivityIndicator size="small" color="#0284C7" style={{ padding: 20 }} />
          ) : leaderboard.length === 0 ? (
            <Text style={styles.emptyLeaderboard}>No leaderboard logs yet.</Text>
          ) : (
            leaderboard.map((item, index) => {
              const isCurrentUser = item.name === user?.profile?.name;
              const isTopThree = index < 3;
              const medals = ['🥇', '🥈', '🥉'];

              return (
                <View
                  key={index}
                  style={[
                    styles.leaderboardRow,
                    isCurrentUser && styles.leaderboardRowCurrent,
                    index === leaderboard.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={styles.rowLeft}>
                    <Text style={styles.rankText}>
                      {isTopThree ? medals[index] : `${index + 1}`}
                    </Text>
                    <View>
                      <Text style={[styles.leaderName, isCurrentUser && styles.leaderNameCurrent]}>
                        {item.name}
                      </Text>
                      <Text style={styles.leaderLevel}>{item.level}</Text>
                    </View>
                  </View>

                  <View style={styles.rowRight}>
                    <Text style={styles.leaderXp}>{item.xp} XP</Text>
                    <Text style={styles.leaderStreak}>🔥 {item.streak}d</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={18} color="#EF4444" />
          <Text style={styles.logoutBtnTxt}>Log Out Account</Text>
        </TouchableOpacity>
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
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  avatarBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  profileEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  levelBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  levelBadgeTxt: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: 'bold',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginTop: 18,
  },
  editBtnTxt: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  editForm: {
    width: '100%',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 8,
  },
  levelSelectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  lvlBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
    backgroundColor: '#F8FAFC',
  },
  lvlBtnActive: {
    borderColor: '#0284C7',
    backgroundColor: '#E0F2FE',
  },
  lvlBtnTxt: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  lvlBtnTxtActive: {
    color: '#0284C7',
  },
  editActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginRight: 8,
  },
  cancelBtnTxt: {
    fontSize: 13,
    color: '#475569',
    fontWeight: 'bold',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  saveBtnTxt: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: 'bold',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 16,
  },
  leaderboardCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 28,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  emptyLeaderboard: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    padding: 20,
  },
  leaderboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  leaderboardRowCurrent: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    borderColor: '#BAE6FD',
    borderWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    width: 32,
    textAlign: 'center',
    marginRight: 10,
    fontWeight: 'bold',
    color: '#64748B',
  },
  leaderName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  leaderNameCurrent: {
    color: '#0284C7',
  },
  leaderLevel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  leaderXp: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  leaderStreak: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '600',
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 16,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  logoutBtnTxt: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ProfileScreen;
