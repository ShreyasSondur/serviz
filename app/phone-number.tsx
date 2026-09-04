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
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import ServizLogo from '@/components/Logo';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import api from '@/services/api';
import LoadingModal from '@/components/LoadingModal';

export default function PhoneNumberScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!phoneNumber.trim()) {
      setError('Please enter your mobile phone number.');
      return;
    }

    if (phoneNumber.trim().length < 7) {
      setError('Please enter a valid mobile number.');
      return;
    }

    setLoading(true);
    try {
      const fullPhone = phoneNumber.startsWith('+') ? phoneNumber : `+971 ${phoneNumber.trim()}`;
      await api.put('/auth/me/phone', { phone_number: fullPhone });
      setLoading(false);
      router.replace('/landing');
    } catch (err: any) {
      setLoading(false);
      // Navigate to landing even if network fails so user is not stuck
      router.replace('/landing');
    }
  };

  const handleSkip = () => {
    router.replace('/landing');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LoadingModal
        visible={loading}
        title="Saving Phone Number..."
        subtitle="Updating your account profile details..."
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
          {/* Header Spacer */}
          <View style={styles.headerSpacer}>
            <ServizLogo size="lg" />
          </View>

          {/* Center Card */}
          <View style={styles.centerContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.phoneEmoji}>📱</Text>
            </View>

            <Text style={styles.title}>Mobile Number</Text>
            <Text style={styles.subtitle}>
              Add your phone number to receive instant booking updates and connect with verified service professionals.
            </Text>

            {error && <Text style={styles.errorAlert}>{error}</Text>}

            {/* Input Row */}
            <View style={styles.phoneInputRow}>
              <View style={styles.countryBadge}>
                <Text style={styles.flag}>🇦🇪</Text>
                <Text style={styles.countryCode}>+971</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="50 123 4567"
                placeholderTextColor="#666672"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                autoFocus
              />
            </View>

            <Button
              title="Continue to Home"
              showArrow
              loading={false}
              onPress={handleSubmit}
              style={styles.submitBtn}
            />

            <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
              <Text style={styles.skipText}>Skip for now →</Text>
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
    backgroundColor: '#0F0F10',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  headerSpacer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  centerContainer: {
    backgroundColor: '#161619',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#26262C',
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(217, 142, 50, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(217, 142, 50, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  phoneEmoji: {
    fontSize: 26,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#8E8E98',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  errorAlert: {
    color: '#EF4444',
    fontSize: 13,
    marginBottom: 14,
    textAlign: 'center',
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    height: 52,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  countryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#2C2C2E',
    gap: 6,
  },
  flag: {
    fontSize: 18,
  },
  countryCode: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    paddingLeft: 12,
  },
  submitBtn: {
    width: '100%',
    marginBottom: 14,
  },
  skipBtn: {
    paddingVertical: 8,
  },
  skipText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
