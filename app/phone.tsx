/**
 * Phone Number Entry Screen (Step after Sign Up).
 * Matches the screenshot specs with country code picker & Continue action.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import ServizLogo from '@/components/Logo';
import Button from '@/components/Button';
import Card from '@/components/Card';
import colors from '@/constants/colors';
import useAuth from '@/hooks/useAuth';

import api from '@/services/api';

const COUNTRY_CODES = [
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+1', flag: '🇺🇸', name: 'USA' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+966', flag: '🇸🇦', name: 'KSA' },
];

export default function PhoneScreen() {
  const router = useRouter();
  const { user, setUser, refreshUser } = useAuth();

  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setError(null);
    if (!phoneNumber.trim() || phoneNumber.replace(/\s+/g, '').length < 7) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      const fullPhone = `${selectedCountry.code} ${phoneNumber.trim()}`;
      await api.put('/auth/me/phone', { phone_number: fullPhone });
      await refreshUser();
      setLoading(false);
      router.replace('/landing');
    } catch (err: any) {
      setLoading(false);
      router.replace('/landing');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Top Logo */}
          <View style={styles.headerSpacer}>
            <ServizLogo size="lg" />
          </View>

          {/* Center Content */}
          <View style={styles.centerContainer}>
            <Text style={styles.title}>Enter your phone number</Text>

            {/* Card Container */}
            <Card style={styles.card}>
              <Text style={styles.label}>Phone Number</Text>

              {error && <Text style={styles.errorAlert}>{error}</Text>}

              {/* Input Row with Pill Style */}
              <View style={styles.phoneInputRow}>
                <TouchableOpacity
                  style={styles.countryPickerBtn}
                  onPress={() => setShowCountryPicker(!showCountryPicker)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.flagText}>{selectedCountry.flag}</Text>
                  <Text style={styles.countryCodeText}>{selectedCountry.code}</Text>
                </TouchableOpacity>

                <View style={styles.verticalDivider} />

                <TextInput
                  style={styles.phoneTextInput}
                  placeholder="99 999 9999"
                  placeholderTextColor="#44444D"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>

              {/* Country Picker Dropdown */}
              {showCountryPicker && (
                <View style={styles.dropdownContainer}>
                  {COUNTRY_CODES.map((item) => (
                    <TouchableOpacity
                      key={item.code}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedCountry(item);
                        setShowCountryPicker(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dropdownFlag}>{item.flag}</Text>
                      <Text style={styles.dropdownText}>
                        {item.name} ({item.code})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.subtext}>Your number is safe with us.</Text>

              <Button
                title="Continue"
                showArrow
                loading={loading}
                onPress={handleContinue}
                style={styles.continueBtn}
              />

              <TouchableOpacity
                style={styles.skipBtn}
                onPress={() => router.replace('/landing')}
                activeOpacity={0.7}
              >
                <Text style={styles.skipText}>Skip for now →</Text>
              </TouchableOpacity>
            </Card>
          </View>

          {/* Bottom Balance Spacer */}
          <View style={styles.bottomSpacer} />
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
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 28,
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: '#161618',
    borderColor: '#242428',
    borderRadius: 20,
    padding: 22,
  },
  label: {
    fontSize: 13,
    color: '#9E9EA5',
    fontWeight: '500',
    marginBottom: 10,
  },
  errorAlert: {
    color: colors.error,
    backgroundColor: 'rgba(255, 69, 58, 0.12)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 13,
    textAlign: 'center',
    overflow: 'hidden',
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111113',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#2D2D34',
    height: 52,
    paddingHorizontal: 16,
  },
  countryPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 6,
  },
  flagText: {
    fontSize: 18,
    marginRight: 6,
  },
  countryCodeText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#2D2D34',
    marginHorizontal: 12,
  },
  phoneTextInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    letterSpacing: 0.5,
    height: '100%',
  },
  dropdownContainer: {
    backgroundColor: '#1C1C1F',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#303036',
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#26262C',
  },
  dropdownFlag: {
    fontSize: 16,
    marginRight: 10,
  },
  dropdownText: {
    color: colors.text,
    fontSize: 14,
  },
  subtext: {
    fontSize: 13,
    color: '#666670',
    marginTop: 12,
    marginBottom: 22,
  },
  continueBtn: {
    marginTop: 4,
  },
  skipBtn: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipText: {
    color: '#8E8E98',
    fontSize: 13,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 20,
  },
});
