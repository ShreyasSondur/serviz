/**
 * Main Direct Launch Screen - Log in Page.
 * Styled with safe area insets, perfect vertical balance, and premium UI/UX.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import * as Linking from 'expo-linking';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ServizLogo from '@/components/Logo';
import * as WebBrowser from 'expo-web-browser';
import Input from '@/components/Input';
import Button from '@/components/Button';
import GoogleIcon from '@/components/GoogleIcon';
import colors from '@/constants/colors';
import useAuth from '@/hooks/useAuth';
import api from '@/services/api';

import LoadingModal from '@/components/LoadingModal';

import { ActivityIndicator } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

let hasProcessedInitialUrl = false;
let hasRedirectedToLanding = false;

export function resetLandingRedirect() {
  hasRedirectedToLanding = false;
}

export default function IndexScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const { user, isAuthenticated, isBootstrapping, login, refreshUser, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Auto-redirect strictly once per session upon bootstrap
  useEffect(() => {
    if (!isAuthenticated) {
      hasRedirectedToLanding = false;
      return;
    }

    if (!isBootstrapping && isAuthenticated && user && !!api.getToken() && !hasRedirectedToLanding) {
      hasRedirectedToLanding = true;
      router.replace('/landing');
    }
  }, [isBootstrapping, isAuthenticated, user]);

  // Extract and apply authentication token from URL
  const processGoogleToken = async (rawUrl?: string | null) => {
    if (!rawUrl) return;
    const match = rawUrl.match(/[?&]token=([^&]+)/);
    if (match && match[1]) {
      const token = match[1];
      hasProcessedInitialUrl = true;
      await api.setToken(token);
      await refreshUser();
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      router.replace('/landing');
    }
  };

  // Detect token parameter in URL from Google OAuth Callback
  useEffect(() => {
    if (params.token) {
      processGoogleToken(`?token=${params.token}`);
    }

    if (!hasProcessedInitialUrl) {
      hasProcessedInitialUrl = true;
      Linking.getInitialURL().then((url) => {
        if (url) processGoogleToken(url);
      });
    }

    const subscription = Linking.addEventListener('url', (e) => processGoogleToken(e.url));
    return () => subscription.remove();
  }, [params.token]);

  const handleGoogleLogin = async () => {
    const redirectUrl = Linking.createURL('/');
    const googleUrl = `${api.getBaseUrl()}/auth/google/login?redirect_url=${encodeURIComponent(redirectUrl)}&prompt=select_account`;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.href = googleUrl;
      return;
    }

    try {
      const result = await WebBrowser.openAuthSessionAsync(
        googleUrl,
        redirectUrl,
        { preferEphemeralSession: true }
      );
      if (result.type === 'success' && result.url) {
        await processGoogleToken(result.url);
      }
    } catch (err) {
      console.log('WebBrowser Google Auth error:', err);
      Linking.openURL(googleUrl);
    }
  };

  const handleLogin = async () => {
    setError(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password.trim()) {
      setError('Please enter your email and password');
      return;
    }

    const res = await login(cleanEmail, password);
    if (res.success) {
      router.replace('/landing');
    } else {
      setError(res.error || 'Invalid email or password');
    }
  };

  if (isBootstrapping || (isAuthenticated && api.getToken())) {
    return (
      <View style={styles.bootSplashContainer}>
        <ServizLogo size="lg" />
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 28 }} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LoadingModal
        visible={isLoading}
        title="Logging In..."
        subtitle="Verifying credentials with Serviz..."
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Top Logo Header */}
          <View style={styles.headerSpacer}>
            <ServizLogo size="lg" />
          </View>

          {/* Form Content Area */}
          <View style={styles.centerContainer}>
            <Text style={styles.title}>Log in</Text>

            <View style={styles.form}>
              {error && <Text style={styles.errorAlert}>{error}</Text>}

              <Input
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <Input
                placeholder="Password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity
                style={styles.forgotPassContainer}
                onPress={() => {}}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPassText}>Forgot Password?</Text>
              </TouchableOpacity>

              <Button
                title="Log in"
                showArrow
                loading={false}
                onPress={handleLogin}
                style={styles.loginBtn}
              />

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Sign In */}
              <Button
                title="CONTINUE WITH GOOGLE"
                variant="google"
                icon={<GoogleIcon />}
                onPress={handleGoogleLogin}
                style={styles.googleBtn}
              />
            </View>
          </View>

          {/* Bottom Footer */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don’t have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')} activeOpacity={0.7}>
              <Text style={styles.signUpText}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 30 : 16,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  headerSpacer: {
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 24,
  },
  centerContainer: {
    width: '100%',
    marginVertical: 'auto',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 36,
    letterSpacing: 0.2,
  },
  form: {
    width: '100%',
  },
  errorAlert: {
    color: colors.error,
    backgroundColor: 'rgba(255, 69, 58, 0.12)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 14,
    textAlign: 'center',
    overflow: 'hidden',
  },
  forgotPassContainer: {
    alignSelf: 'flex-end',
    marginBottom: 26,
    marginTop: -2,
    paddingVertical: 4,
  },
  forgotPassText: {
    fontSize: 13,
    color: '#A0A0A8',
    fontWeight: '500',
  },
  loginBtn: {
    marginBottom: 20,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    width: '100%',
    paddingHorizontal: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#26262B',
  },
  dividerText: {
    color: '#666670',
    marginHorizontal: 16,
    fontSize: 13,
    fontWeight: '500',
  },
  googleBtn: {
    marginTop: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    color: '#C5C5CC',
    fontSize: 14,
    fontWeight: '400',
  },
  signUpText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  bootSplashContainer: {
    flex: 1,
    backgroundColor: '#0E0E12',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
