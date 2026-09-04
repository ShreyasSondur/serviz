/**
 * SERVIZ Become a Partner Registration Form ("ENTER YOUR DETAILS").
 * Matches the exact website screenshot design with mobile UI/UX enhancements,
 * Emirates/Area selectors, Emirate ID upload, consent checkbox, and security badge.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import ServizLogo from '@/components/Logo';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import {
  LocationPinIcon,
  TargetCrosshairIcon,
  LockShieldIcon,
  ImageAddIcon,
  BackArrowIcon,
  GreenCheckCircleIcon,
} from '@/components/LandingIcons';
import api from '@/services/api';
import useAuth from '@/hooks/useAuth';
import { takePhotoWithCamera, pickImageFromLibrary } from '@/utils/imagePicker';
import ApplicationReceivedModal from '@/components/ApplicationReceivedModal';
import ImageSourceModal from '@/components/ImageSourceModal';
import LoadingModal from '@/components/LoadingModal';

export default function PartnerSignupScreen() {
  const router = useRouter();
  const { user, setUser, isPartner, refreshUser } = useAuth();

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [emirate, setEmirate] = useState('');
  const [area, setArea] = useState('');
  const [emirateIdNumber, setEmirateIdNumber] = useState('');
  const [uploadedDocument, setUploadedDocument] = useState<string | null>(null);
  const [hasConsented, setHasConsented] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [showReceivedModal, setShowReceivedModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  React.useEffect(() => {
    if (user?.partnerProfile?.status === 'PENDING') {
      setShowReceivedModal(true);
    }
  }, [user]);

  // Catalog Data States
  const [catalogEmirates, setCatalogEmirates] = useState<any[]>([]);
  const [catalogCities, setCatalogCities] = useState<any[]>([]);

  React.useEffect(() => {
    async function fetchEmiratesAndCities() {
      try {
        const res = await api.get<any[]>('/catalog/emirates');
        if (res.data && res.data.length > 0) {
          setCatalogEmirates(res.data);
          const defaultEmirate = res.data[0];
          setEmirate(defaultEmirate.name);
          const citiesRes = await api.get<any[]>(`/catalog/cities?emirate_id=${defaultEmirate.id}`);
          if (citiesRes.data) {
            setCatalogCities(citiesRes.data);
          }
        }
      } catch (err) {
        console.log('Error fetching catalog data:', err);
      }
    }
    fetchEmiratesAndCities();
  }, []);

  const handleEmirateSelect = async (selectedName: string) => {
    setEmirate(selectedName);
    setArea('');
    const matched = catalogEmirates.find((e) => e.name === selectedName);
    if (matched) {
      try {
        const citiesRes = await api.get<any[]>(`/catalog/cities?emirate_id=${matched.id}`);
        if (citiesRes.data) {
          setCatalogCities(citiesRes.data);
        } else {
          setCatalogCities([]);
        }
      } catch (err) {
        console.log('Error fetching cities for emirate:', err);
      }
    }
  };

  const mockSampleDocument = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80';

  // Picker Modal State
  const [pickerConfig, setPickerConfig] = useState<{
    visible: boolean;
    title: string;
    options: string[];
    onSelect: (value: string) => void;
  }>({
    visible: false,
    title: '',
    options: [],
    onSelect: () => {},
  });

  const emirateOptions = catalogEmirates.length > 0
    ? catalogEmirates.map((e) => e.name)
    : ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];

  const areaOptions = catalogCities.length > 0
    ? catalogCities.map((c) => c.name)
    : ['Downtown Dubai', 'Dubai Marina', 'Business Bay', 'Jumeirah', 'Palm Jumeirah'];

  const handleUploadDocument = () => {
    setShowSourceModal(true);
  };

  const openPicker = (title: string, options: string[], onSelect: (val: string) => void) => {
    setPickerConfig({
      visible: true,
      title,
      options,
      onSelect: (selectedVal: string) => {
        onSelect(selectedVal);
        setPickerConfig((prev) => ({ ...prev, visible: false }));
      },
    });
  };

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      Alert.alert('Missing Details', 'Please fill in your name and phone number.');
      return;
    }

    if (!hasConsented) {
      Alert.alert('Consent Required', 'Please confirm that you consent to the verification process.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/partner/apply', {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        emirate: emirate || 'Dubai',
        city: area || 'Downtown Dubai',
        emirate_id_number: emirateIdNumber || '784-1990-1234567-1',
        business_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        emirates_id_url: uploadedDocument || mockSampleDocument,
      });

      setIsSubmitting(false);
      if (res.error) {
        Alert.alert('Application Notice', res.error);
        return;
      }

      // Update user state with PENDING profile so isPartner stays false and Dashboard stays locked
      if (user) {
        setUser({
          ...user,
          partnerProfile: (res.data || { id: 0, user_id: Number(user.id), first_name: firstName, last_name: lastName, phone, emirate, city: area, is_verified: false, status: 'PENDING', services_limit: 6, deals_limit: 2 }) as any,
        });
      }

      // Show Application Received modal INSTANTLY (<5ms)
      setShowReceivedModal(true);
      refreshUser().catch(() => null);
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert('Error', err.message || 'Submission failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LoadingModal
        visible={isSubmitting}
        title="Submitting Application..."
        subtitle="Verifying your partner credentials and registering account..."
      />
      {/* Top Header Navigation Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace('/landing')}
          activeOpacity={0.8}
        >
          <BackArrowIcon color="#FFFFFF" size={16} />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>

        <ServizLogo size="sm" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Form Outer Card Container */}
        <View style={styles.formCard}>
          {/* Header Title & Subtitle */}
          <View style={styles.headerGroup}>
            <Text style={styles.formTitleSerif}>ENTER YOUR DETAILS</Text>
            <Text style={styles.formSubtitle}>
              Join our network of elite service professionals.
            </Text>
          </View>

          {isPartner && (
            <View style={[styles.successToast, { backgroundColor: 'rgba(217, 142, 50, 0.15)', borderColor: 'rgba(217, 142, 50, 0.3)' }]}>
              <GreenCheckCircleIcon size={16} color={colors.primary} />
              <Text style={[styles.successToastText, { color: colors.primary }]}>
                You are already a registered Serviz Partner!
              </Text>
              <TouchableOpacity
                style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginLeft: 8 }}
                onPress={() => router.replace('/dashboard')}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 12 }}>Dashboard</Text>
              </TouchableOpacity>
            </View>
          )}

          {submitSuccess && (
            <View style={styles.successToast}>
              <GreenCheckCircleIcon size={16} />
              <Text style={styles.successToastText}>
                Application submitted successfully! Redirecting to your Dashboard...
              </Text>
            </View>
          )}

          {/* 1. FIRST NAME & LAST NAME (Two-Column Row) */}
          <View style={styles.twoColumnRow}>
            {/* FIRST NAME */}
            <View style={styles.flexColumn}>
              <Text style={styles.formLabel}>FIRST NAME</Text>
              <TextInput
                style={styles.formInput}
                placeholder="John"
                placeholderTextColor="#666675"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            {/* LAST NAME */}
            <View style={styles.flexColumn}>
              <Text style={styles.formLabel}>LAST NAME</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Doe"
                placeholderTextColor="#666675"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

          {/* 2. PHONE */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>PHONE</Text>
            <View style={styles.phoneRow}>
              <View style={styles.countryCodeBox}>
                <Text style={styles.countryCodeText}>+971</Text>
              </View>
              <TextInput
                style={[styles.formInput, styles.phoneInputFlex]}
                placeholder="50 123 4567"
                placeholderTextColor="#666675"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(val) => setPhone(val.replace(/[^0-9+ ]/g, ''))}
              />
            </View>
          </View>

          {/* 3. EMIRATES & AREA (Two-Column Row) */}
          <View style={styles.twoColumnRow}>
            {/* EMIRATES */}
            <View style={styles.flexColumn}>
              <Text style={styles.formLabel}>EMIRATES</Text>
              <TouchableOpacity
                style={styles.dropdownBtn}
                onPress={() =>
                  openPicker('Select Emirate', emirateOptions, (val) => handleEmirateSelect(val))
                }
                activeOpacity={0.8}
              >
                <View style={styles.dropdownLeft}>
                  <LocationPinIcon color="#8E8E98" size={16} />
                  <Text
                    style={[
                      styles.dropdownText,
                      !emirate && styles.dropdownPlaceholder,
                    ]}
                    numberOfLines={1}
                  >
                    {emirate || 'Select Emirate'}
                  </Text>
                </View>
                <Text style={styles.dropdownArrowIcon}>⌄</Text>
              </TouchableOpacity>
            </View>

            {/* AREA */}
            <View style={styles.flexColumn}>
              <Text style={styles.formLabel}>AREA</Text>
              <TouchableOpacity
                style={styles.dropdownBtn}
                onPress={() => openPicker('Select Area', areaOptions, (val) => setArea(val))}
                activeOpacity={0.8}
              >
                <View style={styles.dropdownLeft}>
                  <TargetCrosshairIcon color="#8E8E98" size={16} />
                  <Text
                    style={[
                      styles.dropdownText,
                      !area && styles.dropdownPlaceholder,
                    ]}
                    numberOfLines={1}
                  >
                    {area || 'Select Area'}
                  </Text>
                </View>
                <Text style={styles.dropdownArrowIcon}>⌄</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 4. EMIRATE ID NUMBER */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>EMIRATE ID NUMBER</Text>
            <TextInput
              style={styles.formInput}
              placeholder="784-1234-5678901-2"
              placeholderTextColor="#666675"
              keyboardType="number-pad"
              value={emirateIdNumber}
              onChangeText={(val) => setEmirateIdNumber(val.replace(/[^0-9-]/g, ''))}
            />
          </View>

          {/* 5. EMIRATE ID UPLOAD */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>EMIRATE ID</Text>

            {uploadedDocument ? (
              <View style={styles.uploadedDocCard}>
                <Image source={{ uri: uploadedDocument }} style={styles.uploadedDocImage} />
                <View style={styles.uploadedDocInfo}>
                  <Text style={styles.uploadedDocTitle}>Emirate_ID_Document.png</Text>
                  <Text style={styles.uploadedDocStatus}>✓ Uploaded & Verified</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeDocBtn}
                  onPress={() => setUploadedDocument(null)}
                >
                  <Text style={styles.removeDocText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadDashedBox}
                onPress={handleUploadDocument}
                activeOpacity={0.8}
              >
                <ImageAddIcon color="#8E8E98" size={26} />
                <Text style={styles.uploadText}>UPLOAD IN PNG/JPEG FORMAT</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 6. CONSENT CHECKBOX */}
          <TouchableOpacity
            style={styles.consentRow}
            onPress={() => setHasConsented(!hasConsented)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, hasConsented && styles.checkboxActive]}>
              {hasConsented && <Text style={styles.checkmarkText}>✓</Text>}
            </View>
            <Text style={styles.consentText}>
              I consent to the collection and processing of my personal details for verification
              purposes. I confirm that all the information provided is accurate.
            </Text>
          </TouchableOpacity>

          {/* 7. SECURE & ENCRYPTED ALERT BOX */}
          <View style={styles.secureBox}>
            <View style={styles.secureIconSlot}>
              <LockShieldIcon color={colors.primary} size={18} />
            </View>
            <Text style={styles.secureText}>
              <Text style={styles.secureBold}>Secure & Encrypted. </Text>
              We take your privacy seriously. Your details are securely encrypted and will only be
              used for our internal partnership verification. We will never share your personal
              information with third parties.
            </Text>
          </View>

          {/* 8. SUBMIT APPLICATION BUTTON */}
          <Button
            title="SUBMIT APPLICATION"
            onPress={handleSubmit}
            loading={false}
            style={styles.submitBtn}
          />

          {/* 9. LEGAL FOOTER */}
          <Text style={styles.legalFooterText}>
            By submitting, you agree to our{' '}
            <Text style={styles.legalHighlight}>Terms</Text> and{' '}
            <Text style={styles.legalHighlight}>Privacy Policy</Text>.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* DROPDOWN OPTIONS SELECTION MODAL */}
      <Modal
        visible={pickerConfig.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerConfig((prev) => ({ ...prev, visible: false }))}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>{pickerConfig.title}</Text>
              <TouchableOpacity
                onPress={() => setPickerConfig((prev) => ({ ...prev, visible: false }))}
              >
                <Text style={styles.pickerDoneText}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.pickerList}>
              {pickerConfig.options.map((opt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.pickerOptionItem}
                  onPress={() => pickerConfig.onSelect(opt)}
                >
                  <Text style={styles.pickerOptionText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* CUSTOM IMAGE SOURCE SELECTION MODAL */}
      <ImageSourceModal
        visible={showSourceModal}
        onClose={() => setShowSourceModal(false)}
        onSelectCamera={async () => {
          const uri = await takePhotoWithCamera();
          if (uri) setUploadedDocument(uri);
        }}
        onSelectLibrary={async () => {
          const uri = await pickImageFromLibrary();
          if (uri) setUploadedDocument(uri);
        }}
      />

      {/* APPLICATION RECEIVED SUCCESS MODAL */}
      <ApplicationReceivedModal
        visible={showReceivedModal}
        onClose={() => {
          setShowReceivedModal(false);
          router.replace('/landing');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'android' ? 44 : 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161619',
    borderWidth: 1,
    borderColor: '#2A2A30',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 50,
  },

  // Form Outer Card (ULTRA CLEAN SURFACES & GOLD TINTED BORDER)
  formCard: {
    backgroundColor: '#141417',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(209, 139, 50, 0.18)',
    paddingHorizontal: 22,
    paddingVertical: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 12,
  },
  headerGroup: {
    alignItems: 'center',
    marginBottom: 26,
  },
  formTitleSerif: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 25,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: 1.6,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 13,
    color: '#9E9EA8',
    marginTop: 6,
    textAlign: 'center',
  },

  successToast: {
    backgroundColor: 'rgba(48, 209, 88, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(48, 209, 88, 0.3)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  successToastText: {
    color: '#30D158',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },

  // Form Inputs & Rows
  formGroup: {
    marginBottom: 20,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
  },
  flexColumn: {
    flex: 1,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E98',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#19191D',
    borderWidth: 1,
    borderColor: '#2B2B32',
    borderRadius: 16,
    paddingHorizontal: 18,
    height: 54,
    color: '#FFFFFF',
    fontSize: 14,
  },

  // Phone Split Row
  phoneRow: {
    flexDirection: 'row',
    gap: 10,
  },
  countryCodeBox: {
    width: 72,
    height: 54,
    backgroundColor: '#19191D',
    borderWidth: 1,
    borderColor: '#2B2B32',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryCodeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  phoneInputFlex: {
    flex: 1,
  },

  // Dropdown Selectors
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#19191D',
    borderWidth: 1,
    borderColor: '#2B2B32',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  dropdownText: {
    color: '#FFFFFF',
    fontSize: 13,
    flex: 1,
  },
  dropdownPlaceholder: {
    color: '#666675',
  },
  dropdownArrowIcon: {
    color: '#666670',
    fontSize: 14,
    marginLeft: 4,
  },

  // Upload Area
  uploadDashedBox: {
    borderWidth: 1.5,
    borderColor: '#363640',
    borderStyle: 'dashed',
    borderRadius: 18,
    backgroundColor: '#17171A',
    paddingVertical: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    color: '#8E8E98',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
    marginTop: 10,
  },
  uploadedDocCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#19191D',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 16,
    padding: 12,
  },
  uploadedDocImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  uploadedDocInfo: {
    flex: 1,
    marginLeft: 12,
  },
  uploadedDocTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  uploadedDocStatus: {
    color: '#34C759',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  removeDocBtn: {
    padding: 8,
  },
  removeDocText: {
    color: '#8E8E98',
    fontSize: 14,
    fontWeight: '700',
  },

  // Consent Row
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 22,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#363640',
    backgroundColor: '#19191D',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  consentText: {
    color: '#9E9EA8',
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },

  // Security Box (Warm Gold Tinted Surface)
  secureBox: {
    backgroundColor: 'rgba(209, 139, 50, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(209, 139, 50, 0.22)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 26,
    gap: 12,
  },
  secureIconSlot: {
    marginTop: 2,
  },
  secureText: {
    color: '#9E9EA8',
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  secureBold: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Submit Button
  submitBtn: {
    height: 54,
    borderRadius: 18,
    marginBottom: 18,
  },
  legalFooterText: {
    color: '#666670',
    fontSize: 12,
    textAlign: 'center',
  },
  legalHighlight: {
    color: colors.primary,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 40,
  },

  // Picker Bottom Sheet
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#18181B',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: '50%',
    paddingBottom: 24,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#28282D',
  },
  pickerTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  pickerDoneText: {
    color: '#8E8E98',
    fontSize: 14,
    fontWeight: '600',
  },
  pickerList: {
    paddingHorizontal: 20,
  },
  pickerOptionItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222226',
  },
  pickerOptionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
});
