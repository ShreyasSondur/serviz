/**
 * Settings Overview Screen Component.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';
import Card from '@/components/Card';
import colors from '@/constants/colors';

export default function SettingsScreen() {
  const router = useRouter();

  const settingsOptions = [
    {
      title: 'Account Settings',
      description: 'Manage personal details and credentials',
      route: '/settings/account' as const,
    },
    {
      title: 'Notifications',
      description: 'Configure push alerts and email preferences',
      route: null,
    },
    {
      title: 'Privacy & Security',
      description: 'Password, biometrics, and active sessions',
      route: null,
    },
  ];

  return (
    <View style={styles.container}>
      <Header title="Settings" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>General Preferences</Text>
        {settingsOptions.map((item, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={item.route ? 0.7 : 1}
            onPress={() => item.route && router.push(item.route)}
          >
            <Card style={styles.optionCard}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>{item.title}</Text>
                <Text style={styles.optionDesc}>{item.description}</Text>
              </View>
              {item.route && <Text style={styles.arrow}>›</Text>}
            </Card>
          </TouchableOpacity>
        ))}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 8,
    marginTop: 8,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  optionDesc: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  arrow: {
    fontSize: 22,
    color: colors.textMuted,
    marginLeft: 12,
  },
});
