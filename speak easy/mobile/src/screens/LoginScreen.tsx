import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Lock, Mail, ChevronRight, LogIn } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { theme } from '../theme/theme';

const activeTheme = theme.light;

export const LoginScreen = ({ navigation }: any) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      const { token, user } = response.data;
      await login(token, user);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Login failed. Please check your credentials.';
      Alert.alert('Login Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      // Mocking Google Sign In - passes a verified mock token to the backend
      const response = await authApi.googleSignIn({
        email: 'google_user@speakeasy.com',
        name: 'Google Learner',
        idToken: 'mock-google-id-token',
      });
      const { token, user } = response.data;
      await login(token, user);
      Alert.alert('Google Sign-in', 'Logged in successfully via Google (Mocked).');
    } catch (error: any) {
      Alert.alert('Google Sign-in Error', 'Failed to sign in with Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Logo and Intro */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoTxt}>SE</Text>
            </View>
            <Text style={styles.appName}>SpeakEasy English</Text>
            <Text style={styles.appTagline}>Master Spoken English through Tamil</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Welcome Back</Text>

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

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotTxt}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.submitBtnTxt}>Log In</Text>
                  <ChevronRight size={18} color="#FFF" style={{ marginLeft: 6 }} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Google Sign In Option */}
          <View style={styles.socialContainer}>
            <Text style={styles.socialDivider}>OR SIGN IN WITH</Text>
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleSignIn}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <ActivityIndicator color="#0F172A" />
              ) : (
                <Text style={styles.googleBtnTxt}>G  Sign in with Google</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Navigation to Register */}
          <View style={styles.footer}>
            <Text style={styles.footerTxt}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signUpLink}>Sign Up</Text>
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
    paddingTop: 40,
    paddingBottom: 20,
    justifyContent: 'center',
    minHeight: height - 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  logoTxt: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0284C7',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  appTagline: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
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
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 20,
    textAlign: 'center',
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotTxt: {
    color: '#0284C7',
    fontSize: 14,
    fontWeight: '600',
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
  socialContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  socialDivider: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  googleBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  googleBtnTxt: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  footerTxt: {
    color: '#64748B',
    fontSize: 15,
  },
  signUpLink: {
    color: '#0284C7',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
