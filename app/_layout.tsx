/**
 * Main navigation layout setup using Expo Router.
 */

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AppProvider } from '@/store/store';
import colors from '@/constants/colors';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <AppProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Home',
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            title: 'Log in',
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            title: 'Sign up',
          }}
        />
        <Stack.Screen
          name="phone"
          options={{
            title: 'Phone Number',
          }}
        />
        <Stack.Screen
          name="landing"
          options={{
            title: 'Serviz Landing',
          }}
        />
        <Stack.Screen
          name="services"
          options={{
            title: 'Services',
          }}
        />
        <Stack.Screen
          name="deals"
          options={{
            title: 'Deals & Offers',
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            title: 'Profile',
          }}
        />
        <Stack.Screen
          name="dashboard"
          options={{
            title: 'Partner Dashboard',
          }}
        />
        <Stack.Screen
          name="partner-signup"
          options={{
            title: 'Become a Partner',
          }}
        />
        <Stack.Screen
          name="settings/index"
          options={{
            title: 'Settings',
          }}
        />
        <Stack.Screen
          name="settings/account"
          options={{
            title: 'Account Settings',
          }}
        />
      </Stack>
    </AppProvider>
  );
}
