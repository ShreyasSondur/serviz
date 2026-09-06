import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import api from '@/services/api';

let Notifications: typeof import('expo-notifications') | null = null;

// Dynamically import expo-notifications safely to prevent top-level module load crashes on Web / Expo Go
try {
  if (Platform.OS !== 'web') {
    Notifications = require('expo-notifications');
    if (Notifications && typeof Notifications.setNotificationHandler === 'function') {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    }
  }
} catch (e) {
  console.log('Notifications module unavailable in this environment:', e);
}

const EAS_PROJECT_ID =
  Constants?.expoConfig?.extra?.eas?.projectId ??
  Constants?.easConfig?.projectId ??
  'a94f1c66-c309-4243-8bca-5c74b5da25b4';

/**
 * Request notification permissions safely and configure high-importance channels
 */
export async function registerForPushNotificationsAsync(): Promise<boolean> {
  if (Platform.OS === 'web' || !Notifications) return false;
  try {
    const permissions = await Notifications.getPermissionsAsync();
    let finalStatus = permissions?.status;
    if (finalStatus !== 'granted') {
      const requestRes = await Notifications.requestPermissionsAsync();
      finalStatus = requestRes?.status;
    }
    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android' && Notifications.setNotificationChannelAsync) {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D4933A',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('partner-alerts', {
        name: 'Partner Verification Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D4933A',
        sound: 'default',
      });
    }

    return true;
  } catch (error) {
    console.log('Safe error checking notification permissions:', error);
    return false;
  }
}

/**
 * Retrieve the device's Expo Push Token for remote push delivery
 */
export async function getExpoPushTokenAsync(): Promise<string | null> {
  if (Platform.OS === 'web' || !Notifications) return null;
  try {
    const hasPermission = await registerForPushNotificationsAsync();
    if (!hasPermission) return null;

    const tokenRes = await Notifications.getExpoPushTokenAsync({
      projectId: EAS_PROJECT_ID,
    });
    return tokenRes?.data || null;
  } catch (err) {
    console.log('Error obtaining Expo push token:', err);
    return null;
  }
}

/**
 * Obtain and register the push token with the backend server
 */
export async function syncPushTokenWithBackend(): Promise<string | null> {
  if (Platform.OS === 'web' || !Notifications) return null;
  try {
    const token = await getExpoPushTokenAsync();
    if (!token) return null;

    if (api.getToken()) {
      const lastSynced = await AsyncStorage.getItem('serviz_synced_push_token');
      if (lastSynced !== token) {
        await api.post('/auth/push-token', { push_token: token });
        await AsyncStorage.setItem('serviz_synced_push_token', token);
        console.log('Push token synced with backend successfully:', token);
      }
    }
    return token;
  } catch (err) {
    console.log('Error syncing push token with backend:', err);
    return null;
  }
}

/**
 * Safely trigger partner verified local notification fallback
 */
export async function triggerPartnerVerifiedNotification() {
  if (Platform.OS === 'web' || !Notifications) return;
  try {
    const hasPermission = await registerForPushNotificationsAsync();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Partner Verification Approved',
        body: 'Your partner application has been verified by Serviz Administration. You now have full access to publish service listings and exclusive deals.',
        data: { type: 'partner_verified' },
        sound: 'default',
        color: '#D4933A',
      },
      trigger: null,
    });
    console.log('Partner verified notification triggered successfully.');
  } catch (error) {
    console.log('Safe error triggering notification:', error);
  }
}

