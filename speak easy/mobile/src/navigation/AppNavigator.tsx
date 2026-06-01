import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import { Home, Mic, BookOpen, MessageSquare, User } from 'lucide-react-native';

import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

// Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import AICoachScreen from '../screens/AICoachScreen';
import VocabScreen from '../screens/VocabScreen';
import ScenariosScreen from '../screens/ScenariosScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack Navigation
const AuthNavigator = ({ showOnboarding }: { showOnboarding: boolean }) => {
  return (
    <Stack.Navigator
      initialRouteName={showOnboarding ? 'Onboarding' : 'Login'}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

// Main Tab Navigation
const MainTabNavigator = () => {
  const activeTheme = theme.light; // light mode default

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: activeTheme.white,
          borderBottomWidth: 1,
          borderBottomColor: activeTheme.border,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: activeTheme.text,
          fontSize: 18,
        },
        tabBarActiveTintColor: activeTheme.primary,
        tabBarInactiveTintColor: activeTheme.textLight,
        tabBarStyle: {
          backgroundColor: activeTheme.white,
          borderTopWidth: 1,
          borderTopColor: activeTheme.border,
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarIcon: ({ color, size }) => {
          const iconSize = 22;
          if (route.name === 'Dashboard') {
            return <Home color={color} size={iconSize} />;
          } else if (route.name === 'AI Coach') {
            return <Mic color={color} size={iconSize} />;
          } else if (route.name === 'Learn') {
            return <BookOpen color={color} size={iconSize} />;
          } else if (route.name === 'Scenarios') {
            return <MessageSquare color={color} size={iconSize} />;
          } else if (route.name === 'Profile') {
            return <User color={color} size={iconSize} />;
          }
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={HomeScreen} options={{ title: 'SpeakEasy' }} />
      <Tab.Screen name="AI Coach" component={AICoachScreen} options={{ title: 'AI Teacher' }} />
      <Tab.Screen name="Learn" component={VocabScreen} options={{ title: 'Vocabulary' }} />
      <Tab.Screen name="Scenarios" component={ScenariosScreen} options={{ title: 'Practice' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState<boolean>(true);
  const [checkingOnboarding, setCheckingOnboarding] = useState<boolean>(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const completed = await AsyncStorage.getItem('onboarding_completed');
        if (completed === 'true') {
          setShowOnboarding(false);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setCheckingOnboarding(false);
      }
    };
    checkOnboardingStatus();
  }, []);

  if (loading || checkingOnboarding) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#0284C7" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="App" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Auth">
            {() => <AuthNavigator showOnboarding={showOnboarding} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default AppNavigator;
