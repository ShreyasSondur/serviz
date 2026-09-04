/**
 * Account Settings Screen Component.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Card from '@/components/Card';
import useAuth from '@/hooks/useAuth';
import colors from '@/constants/colors';
import { COMPANY_DETAILS } from '@/constants/company';

export default function AccountScreen() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [gstin, setGstin] = useState(COMPANY_DETAILS.gstin);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (user) {
      setUser({
        ...user,
        name,
        email,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Account" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.title}>Account & Tax Information</Text>

          {saved && (
            <Text style={styles.successMsg}>Changes saved successfully!</Text>
          )}

          <Input
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Your name"
          />

          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="Your email"
          />

          <View style={styles.gstinSection}>
            <View style={styles.gstinHeaderRow}>
              <Text style={styles.inputLabel}>GSTIN (Tax Identification Number)</Text>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedBadgeText}>✓ Verified</Text>
              </View>
            </View>
            <Input
              value={gstin}
              onChangeText={setGstin}
              placeholder="e.g. 29DOHPB1768C1Z2"
              autoCapitalize="characters"
            />
          </View>

          <Button
            title="Save Changes"
            variant="primary"
            onPress={handleSave}
            style={styles.saveBtn}
          />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  card: {
    padding: 20,
    backgroundColor: '#141416',
    borderColor: '#242428',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  successMsg: {
    color: colors.success,
    backgroundColor: 'rgba(48, 209, 88, 0.15)',
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
    fontSize: 14,
  },
  gstinSection: {
    marginTop: 4,
  },
  gstinHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(48, 209, 88, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(48, 209, 88, 0.3)',
  },
  verifiedBadgeText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  saveBtn: {
    marginTop: 16,
  },
});

