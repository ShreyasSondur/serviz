/**
 * SERVIZ Logo Component matching the exact header styling in screenshot.
 * Aligned to left edge without unwanted left padding.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import colors from '@/constants/colors';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const ServizLogo: React.FC<LogoProps> = ({ size = 'lg', style }) => {
  let fontSize = 32;

  if (size === 'sm') fontSize = 22;
  if (size === 'md') fontSize = 26;
  if (size === 'lg') fontSize = 32;

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.logoText, { fontSize }]}>
        <Text style={styles.serv}>SERV</Text>
        <Text style={styles.iz}>IZ </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  logoText: {
    fontStyle: 'italic',
    fontWeight: '900',
    letterSpacing: 1,
    paddingRight: 10,
    paddingVertical: 2,
    overflow: 'visible',
  },
  serv: {
    color: '#FFFFFF',
  },
  iz: {
    color: colors.primary,
  },
});

export default ServizLogo;
