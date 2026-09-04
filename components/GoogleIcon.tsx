/**
 * Google Logo Icon Component.
 * Uses high-resolution embedded Base64 PNG string for 100% reliable offline rendering.
 */

import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { GOOGLE_LOGO_BASE64 } from '@/constants/googleLogo';

export const GoogleIcon = () => {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: GOOGLE_LOGO_BASE64 }}
        style={styles.icon}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 22,
    height: 22,
  },
});

export default GoogleIcon;
