/**
 * Sign Up Page Component matching screenshot specs.
 * Prepared for clean integration with FastAPI backend.
 */

import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import ServizLogo from '@/components/Logo';
import * as WebBrowser from 'expo-web-browser';
import Input from '@/components/Input';
import Button from '@/components/Button';
import GoogleIcon from '@/components/GoogleIcon';
import colors from '@/constants/colors';
import useAuth from '@/hooks/useAuth';
import authService from '@/services/auth';
import api from '@/services/api';

import LoadingModal from '@/components/LoadingModal';

export default function SignUpScreen() {
  const router = useRouter();
  const { setUser, login, refreshUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setError(null);

    // Validation
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await authService.signup(cleanEmail.split('@')[0], cleanEmail, password);
      if (res.error) {
        setLoading(false);
        setError(res.error);
        return;
      }

      // Silent login to update React store user state without opening popup modal
      const loginRes = await login(cleanEmail, password);
      if (loginRes.success) {
        await refreshUser();
      }

      setLoading(false);

      if (loginRes.success) {
        router.replace('/phone');
      } else {
        router.replace('/login');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LoadingModal
        visible={loading}
        title="Creating Account..."
        subtitle="Setting up your Serviz account..."
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
          {/* Header Logo */}
          <View style={styles.headerSpacer}>
            <ServizLogo size="lg" />
          </View>

          {/* Form Content Area */}
          <View style={styles.centerContainer}>
            <Text style={styles.title}>Sign up</Text>

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

              <Input
                placeholder="Confirm password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />

              <Button
                title="Sign up"
                showArrow
                loading={false}
                onPress={handleSignUp}
                style={styles.signUpBtn}
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
                onPress={async () => {
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
                      const match = result.url.match(/[?&]token=([^&]+)/);
                      if (match && match[1]) {
                        await api.setToken(match[1]);
                        await refreshUser();
                        router.replace('/landing');
                        return;
                      }
                    }
                  } catch (err) {
                    Linking.openURL(googleUrl);
                  }
                }}
                style={styles.googleBtn}
              />

              {/* Terms of Service & Privacy Policy */}
              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By continuing you agree to our{'\n'}
                  <Text
                    style={styles.termsLink}
                    onPress={() => {}}
                  >
                    Terms of Service
                  </Text>{' '}
                  and{' '}
                  <Text
                    style={styles.termsLink}
                    onPress={() => {}}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </View>
            </View>
          </View>

          {/* Footer Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push('/login')}
              activeOpacity={0.7}
            >
              <Text style={styles.logInText}>Log in</Text>
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
    paddingBottom: 20,
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
    marginBottom: 32,
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
  signUpBtn: {
    marginTop: 8,
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
  termsContainer: {
    marginTop: 28,
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    color: '#8E8E96',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '600',
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
  logInText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});
