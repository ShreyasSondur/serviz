/**
 * Profile Screen Component with premium UI & pure vector SVG-style icons.
 * Features Gold Serif typography, User role pill badge, Account Information card,
 * and interactive Phone Number editing with Save/Cancel controls.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { useRouter } from 'expo-router';
import ServizLogo from '@/components/Logo';
import useAuth from '@/hooks/useAuth';
import authService from '@/services/auth';
import colors from '@/constants/colors';
import FloatingNavBar, { TabType } from '@/components/FloatingNavBar';
import { ProfileNavIcon } from '@/components/NavBarIcons';
import {
  MailEnvelopeVectorIcon,
  PhoneReceiverVectorIcon,
  ClockStatusVectorIcon,
  PencilEditVectorIcon,
  ShieldInfoVectorIcon,
  GreenCheckCircleIcon,
} from '@/components/LandingIcons';

export function ProfileContent() {
  const router = useRouter();
  const { user, setUser, isAuthenticated, logout, refreshUser } = useAuth();

  const [phone, setPhone] = useState(user?.phone || user?.phone_number || '');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState(phone);
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user?.phone || user?.phone_number) {
      const currentPhone = user.phone || user.phone_number || '';
      setPhone(currentPhone);
      if (!isEditingPhone) {
        setTempPhone(currentPhone);
      }
    }
  }, [user, isEditingPhone]);

  const handleSavePhone = async () => {
    const trimmed = tempPhone.trim();
    if (!trimmed) {
      setPhoneError('Please enter a valid phone number');
      return;
    }

    setIsSavingPhone(true);
    setPhoneError(null);

    try {
      const res = await authService.updatePhone(trimmed);
      setIsSavingPhone(false);

      if (res.error) {
        setPhoneError(typeof res.error === 'string' ? res.error : 'Failed to update phone number');
        return;
      }

      setPhone(trimmed);
      if (user) {
        setUser({
          ...user,
          phone: trimmed,
          phone_number: trimmed,
        });
      }
      setIsEditingPhone(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setIsSavingPhone(false);
      setPhoneError(err.message || 'Failed to update phone number');
    }
  };

  const handleCancelEdit = () => {
    setTempPhone(phone);
    setPhoneError(null);
    setIsEditingPhone(false);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const username = user?.name || user?.full_name || user?.email?.split('@')[0] || 'User';
  const email = user?.email || 'user@example.com';
  const role = user?.role || 'USER';

  return (
    <View style={styles.contentWrapper}>
      {/* Top Header Logo */}
      <View style={styles.topHeader}>
        <ServizLogo size="md" />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {savedSuccess && (
          <View style={styles.successToast}>
            <GreenCheckCircleIcon size={16} />
            <Text style={styles.successToastText}>Phone number updated successfully!</Text>
          </View>
        )}

        {/* User Avatar & Role Card (Clean vector icon matching app aesthetic) */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarIconPlaceholder}>
                <ProfileNavIcon active={true} />
              </View>
            )}
          </View>

          <Text style={styles.avatarUserName}>{username}</Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{role}</Text>
          </View>
        </View>

        {/* Account Information Card */}
        <View style={styles.infoCard}>
          {/* Card Section Header */}
          <View style={styles.infoCardHeader}>
            <ShieldInfoVectorIcon color={colors.primary} size={18} />
            <Text style={styles.infoCardTitle}>Account Information</Text>
          </View>

          {/* 1. Email Field */}
          <View style={styles.fieldBox}>
            <View style={styles.fieldIconBadge}>
              <MailEnvelopeVectorIcon color={colors.primary} size={18} />
            </View>
            <View style={styles.fieldInfoGroup}>
              <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
              <Text style={styles.fieldValueText}>{email}</Text>
            </View>
          </View>

          {/* 2. Phone Number Field (With Edit Option & Loading UX) */}
          <View style={styles.fieldBox}>
            <View style={styles.fieldIconBadge}>
              <PhoneReceiverVectorIcon color={colors.primary} size={18} />
            </View>

            {isEditingPhone ? (
              <View style={styles.editPhoneContainer}>
                <Text style={styles.fieldLabel}>EDIT PHONE NUMBER</Text>

                {phoneError && (
                  <Text style={styles.phoneErrorText}>{phoneError}</Text>
                )}

                <TextInput
                  style={styles.phoneInput}
                  value={tempPhone}
                  onChangeText={(val) => {
                    setTempPhone(val);
                    if (phoneError) setPhoneError(null);
                  }}
                  keyboardType="phone-pad"
                  placeholder="+971 50 123 4567"
                  placeholderTextColor="#666670"
                  editable={!isSavingPhone}
                  autoFocus
                />

                <View style={styles.editActionRow}>
                  <TouchableOpacity
                    style={[styles.savePhoneBtn, isSavingPhone && styles.disabledBtn]}
                    onPress={handleSavePhone}
                    disabled={isSavingPhone}
                    activeOpacity={0.8}
                  >
                    {isSavingPhone ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.savePhoneText}>Save</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelPhoneBtn}
                    onPress={handleCancelEdit}
                    disabled={isSavingPhone}
                  >
                    <Text style={styles.cancelPhoneText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.phoneDisplayRow}>
                <View style={styles.fieldInfoGroup}>
                  <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
                  <Text style={styles.fieldValueText}>{phone || 'Not provided'}</Text>
                </View>

                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => {
                    setTempPhone(phone);
                    setPhoneError(null);
                    setIsEditingPhone(true);
                  }}
                  activeOpacity={0.8}
                >
                  <PencilEditVectorIcon color={colors.primary} size={12} />
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* 3. Status Field */}
          <View style={styles.fieldBox}>
            <View style={styles.fieldIconBadge}>
              <ClockStatusVectorIcon color={colors.primary} size={18} />
            </View>
            <View style={styles.fieldInfoGroup}>
              <Text style={styles.fieldLabel}>STATUS</Text>
              <View style={styles.activeStatusRow}>
                <GreenCheckCircleIcon size={14} />
                <Text style={styles.activeStatusText}>Active</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Button */}
        {isAuthenticated ? (
          <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => router.push('/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.signInText}>Sign In to Account</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

export default function ProfileScreen({ onTabChange }: { onTabChange?: (tab: TabType) => void }) {
  const router = useRouter();

  useEffect(() => {
    const onBackPress = () => {
      router.replace('/landing');
      return true;
    };
    const backSub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backSub.remove();
  }, [router]);

  const handleTabSelect = (tab: TabType) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      switch (tab) {
        case 'home':
          router.replace('/landing');
          break;
        case 'services':
          router.replace('/services');
          break;
        case 'deals':
          router.replace('/deals');
          break;
        case 'profile':
          break;
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProfileContent />
      <FloatingNavBar currentTab="profile" onSelectTab={handleTabSelect} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentWrapper: {
    flex: 1,
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 36 : 10,
    paddingBottom: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 110,
  },
  headerTitleSection: {
    marginBottom: 20,
  },
  pageTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 32,
    fontWeight: '600',
    color: colors.primary,
    lineHeight: 38,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#A0A0A8',
  },
  successToast: {
    backgroundColor: 'rgba(48, 209, 88, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(48, 209, 88, 0.3)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successToastText: {
    color: '#30D158',
    fontSize: 13,
    fontWeight: '700',
  },

  // Avatar Card Styling
  avatarCard: {
    backgroundColor: '#141416',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#242428',
    paddingVertical: 26,
    alignItems: 'center',
    marginBottom: 18,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarIconPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ scale: 1.6 }],
  },
  avatarUserName: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 14,
    marginBottom: 6,
  },
  roleBadge: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: 'rgba(217, 142, 50, 0.08)',
  },
  roleBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  // Account Information Card Styling
  infoCard: {
    backgroundColor: '#141416',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#242428',
    padding: 20,
    marginBottom: 18,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoCardTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },

  // Fields Styling
  fieldBox: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fieldIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(217, 142, 50, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(217, 142, 50, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fieldInfoGroup: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E8E98',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  fieldValueText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Phone Edit Row
  phoneDisplayRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: 'rgba(217, 142, 50, 0.08)',
  },
  editBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  editPhoneContainer: {
    flex: 1,
  },
  phoneErrorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 2,
    marginBottom: 4,
  },
  phoneInput: {
    backgroundColor: '#141416',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 14,
    marginVertical: 6,
  },
  editActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  savePhoneBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  savePhoneText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cancelPhoneBtn: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  cancelPhoneText: {
    color: '#A0A0A8',
    fontSize: 12,
    fontWeight: '600',
  },

  // Active Status Styling
  activeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeStatusText: {
    color: '#34C759',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 4,
  },

  // Sign Out & Sign In Buttons
  signOutBtn: {
    borderWidth: 1,
    borderColor: '#3A3A40',
    backgroundColor: '#141416',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutText: {
    color: '#FF453A',
    fontSize: 15,
    fontWeight: '700',
  },
  signInBtn: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 60,
  },
});
