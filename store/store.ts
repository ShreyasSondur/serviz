/**
 * Global App State Store & Provider using React Context.
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import storage from '@/utils/storage';
import { User, authService } from '@/services/auth';
import api from '@/services/api';
import { syncPushTokenWithBackend } from '@/utils/notifications';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isPartner: boolean;
  isLoading: boolean;
  isBootstrapping: boolean;
  themeMode: 'light' | 'dark';
}

interface AppContextType extends AppState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  toggleTheme: () => void;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const APP_INSTALL_VERSION_KEY = 'serviz_app_install_v4';

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBootstrapping, setIsBootstrapping] = useState<boolean>(true);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  const refreshUser = async () => {
    try {
      // Ensure fresh install starts logged out (clears any Google Drive / OS backup auto-restored credentials)
      const installMarker = await AsyncStorage.getItem(APP_INSTALL_VERSION_KEY);
      if (!installMarker) {
        await AsyncStorage.multiRemove(['serviz_user_session', 'serviz_auth_token']);
        await storage.removeItem('serviz_auth_token');
        await storage.removeItem('serviz_user_session');
        await api.setToken(null);
        setUser(null);
        await AsyncStorage.setItem(APP_INSTALL_VERSION_KEY, 'true');
        return;
      }

      // 1. Instantly restore cached user profile from AsyncStorage if available
      const cachedUserStr = await AsyncStorage.getItem('serviz_user_session');
      if (cachedUserStr) {
        try {
          const cachedUser = JSON.parse(cachedUserStr);
          if (cachedUser && cachedUser.id) {
            setUser(cachedUser);
          }
        } catch (_) {}
      }

      // 2. Load saved token and verify profile with backend
      await api.loadSavedToken();
      const token = api.getToken();

      if (token) {
        const res = await authService.getProfile();
        if (res.data) {
          setUser(res.data);
          await AsyncStorage.setItem('serviz_user_session', JSON.stringify(res.data));

          // Sync push token with backend whenever user profile is authenticated
          syncPushTokenWithBackend().catch(() => null);
        } else if (res.status === 401) {
          // Token is invalid/expired
          setUser(null);
          await AsyncStorage.removeItem('serviz_user_session');
          await api.setToken(null);
        }
      }
    } catch (_) {
    } finally {
      setIsBootstrapping(false);
    }
  };

  React.useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string, silent: boolean = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res.data) {
        setUser(res.data.user);
        await AsyncStorage.setItem('serviz_user_session', JSON.stringify(res.data.user));
        await refreshUser();
        return { success: true };
      }
      return { success: false, error: res.error || 'Login failed' };
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      await api.setToken(null);
      await storage.removeItem('serviz_auth_token');
      await storage.removeItem('serviz_user_session');
      await AsyncStorage.removeItem('serviz_user_session');
      await AsyncStorage.removeItem('serviz_auth_token');
      await AsyncStorage.removeItem('serviz_synced_push_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const isPartner = !!user && (
    user.role === 'ADMIN' ||
    (user.partnerProfile?.is_verified === true && user.partnerProfile?.status === 'VERIFIED')
  );

  const value: AppContextType = {
    user,
    isAuthenticated: !!user,
    isPartner,
    isLoading,
    isBootstrapping,
    themeMode,
    login,
    logout,
    toggleTheme,
    setUser,
    refreshUser,
  };

  return React.createElement(AppContext.Provider, { value }, children);
}

export function useStore(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useStore must be used within an AppProvider');
  }
  return context;
}
