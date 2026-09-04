/**
 * Global App State Store & Provider using React Context.
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, authService } from '@/services/auth';
import api from '@/services/api';
import { triggerPartnerVerifiedNotification } from '@/utils/notifications';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isPartner: boolean;
  isLoading: boolean;
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  const refreshUser = async () => {
    try {
      await api.loadSavedToken();
      const res = await authService.getProfile();
      if (res.data) {
        setUser(res.data);

        // Check if partner profile was approved by Admin and trigger push notification once
        const p = res.data.partnerProfile;
        if (p && (p.is_verified === true || p.status === 'VERIFIED')) {
          const notifiedKey = `partner_approved_notified_${res.data.id}_${p.id || 'default'}`;
          const alreadyNotified = await AsyncStorage.getItem(notifiedKey);
          if (!alreadyNotified) {
            await triggerPartnerVerifiedNotification();
            await AsyncStorage.setItem(notifiedKey, 'true');
          }
        }
      }
    } catch (_) {}
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
