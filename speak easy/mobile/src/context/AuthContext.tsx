import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { userApi } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
  login: (token: string, userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedProfile: any) => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for stored credentials on launch
    const checkCredentials = async () => {
      try {
        const token = await SecureStore.getItemAsync('user_token');
        const storedUser = await SecureStore.getItemAsync('user_data');

        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          // Async update user data from backend dashboard to keep in sync
          refreshUserData();
        }
      } catch (error) {
        console.error('Failed to load authentication credentials', error);
      } finally {
        setLoading(false);
      }
    };

    checkCredentials();
  }, []);

  const login = async (token: string, userData: any) => {
    try {
      await SecureStore.setItemAsync('user_token', token);
      await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
    } catch (e) {
      console.error('Login cache storage failed:', e);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('user_token');
      await SecureStore.deleteItemAsync('user_data');
      setUser(null);
      setIsAuthenticated(false);
    } catch (e) {
      console.error('Logout cache cleanup failed:', e);
    }
  };

  const updateUser = (updatedProfile: any) => {
    setUser((prev: any) => {
      if (!prev) return null;
      const nextUser = { ...prev, profile: updatedProfile };
      SecureStore.setItemAsync('user_data', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const refreshUserData = async () => {
    try {
      const response = await userApi.getDashboard();
      if (response.data && response.data.profile) {
        setUser((prev: any) => {
          if (!prev) return null;
          const freshUser = { ...prev, profile: response.data.profile };
          SecureStore.setItemAsync('user_data', JSON.stringify(freshUser));
          return freshUser;
        });
      }
    } catch (e) {
      // Token is likely expired or database is offline; logout quietly if request fails with unauthorized
      if (axiosIsUnauthorizedError(e)) {
        logout();
      }
    }
  };

  function axiosIsUnauthorizedError(err: any): boolean {
    return err && err.response && err.response.status === 401;
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        updateUser,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
