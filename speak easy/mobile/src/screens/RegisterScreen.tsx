import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Lock, Mail, User, ChevronRight, GraduationCap } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { theme } from '../theme/theme';

const activeTheme = theme.light;

export const RegisterScreen = ({ navigation }: any) => {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [level, setLevel] = useState('Beginner'); // Beginner, Intermediate, Advanced
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.signup({
        name,
        email,
        password,
        level,
      });
      const { token, user } = response.data;
      await login(token, user);
      Alert.alert('Welcome!', 'Registration successful. Let\'s learn English!');
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Registration failed. Please check your details.';
      Alert.alert('Registration Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const levelOptions = ['Beginner', 'Intermediate', 'Advanced'];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.appName}>Create Account</Text>
            <Text style={styles.appTagline}>Join us and begin your 30-min daily English journey</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Name Input */}
            <View style={styles.inputWrapper}>
              <User size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
                autoCorrect={false}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Mail size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <Lock size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Proficiency Level Selector */}
            <Text style={styles.label}>Your English Level:</Text>
            <View style={styles.levelContainer}>
              {levelOptions.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.levelBadge,
                    level === opt && styles.levelBadgeActive,
                  ]}
                  onPress={() => setLevel(opt)}
                >
                  <Text
                    style={[
                      styles.levelBadgeTxt,
                      level === opt && styles.levelBadgeTxtActive,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSignup} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.submitBtnTxt}>Sign Up</Text>
                  <ChevronRight size={18} color="#FFF" style={{ marginLeft: 6 }} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Navigation to Login */}
          <View style={styles.footer}>
            <Text style={styles.footerTxt}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 30,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  appTagline: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 52,
    backgroundColor: '#F8FAFC',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#0F172A',
    fontSize: 15,
  },
  label: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  levelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  levelBadge: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  levelBadgeActive: {
    borderColor: '#0284C7',
    backgroundColor: '#E0F2FE',
  },
  levelBadgeTxt: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  levelBadgeTxtActive: {
    color: '#0284C7',
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: '#0284C7',
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
  submitBtnTxt: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerTxt: {
    color: '#64748B',
    fontSize: 15,
  },
  loginLink: {
    color: '#0284C7',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
