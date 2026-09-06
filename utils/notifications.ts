import { Platform } from 'react-native';

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

/**
 * Request notification permissions safely
 */
export async function registerForPushNotificationsAsync() {
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
 * Safely trigger partner verified local notification without crashing Expo Go
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
