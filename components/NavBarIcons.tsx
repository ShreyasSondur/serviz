/**
 * Vector SVG / Icon definitions for Floating Bottom Navigation Bar tabs.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import colors from '@/constants/colors';

// Home Icon (Solid House)
export const HomeNavIcon = ({ active }: { active: boolean }) => (
  <View style={styles.iconBox}>
    <View style={[styles.houseRoof, { borderBottomColor: active ? colors.primary : '#FFFFFF' }]} />
    <View style={[styles.houseBase, { backgroundColor: active ? colors.primary : '#FFFFFF' }]}>
      <View style={styles.houseDoor} />
    </View>
  </View>
);

// Services Icon (4 Rounded Tiles Grid)
export const ServicesNavIcon = ({ active }: { active: boolean }) => {
  const color = active ? colors.primary : '#FFFFFF';
  return (
    <View style={styles.gridContainer}>
      <View style={styles.gridRow}>
        <View style={[styles.gridTile, { borderColor: color }]} />
        <View style={[styles.gridTile, { borderColor: color }]} />
      </View>
      <View style={styles.gridRow}>
        <View style={[styles.gridTile, { borderColor: color }]} />
        <View style={[styles.gridTile, { borderColor: color }]} />
      </View>
    </View>
  );
};

// Deals Icon (Price Tag)
export const DealsNavIcon = ({ active }: { active: boolean }) => {
  const color = active ? colors.primary : '#FFFFFF';
  return (
    <View style={styles.tagContainer}>
      <View style={[styles.tagHead, { borderColor: color }]}>
        <View style={[styles.tagHoleDot, { backgroundColor: color }]} />
      </View>
      <View style={[styles.tagBody, { borderColor: color }]} />
    </View>
  );
};

// Profile Icon (User Silhouette Outline)
export const ProfileNavIcon = ({ active }: { active: boolean }) => {
  const color = active ? colors.primary : '#FFFFFF';
  return (
    <View style={styles.userContainer}>
      <View style={[styles.userHead, { borderColor: color }]} />
      <View style={[styles.userBody, { borderColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  // Home Icon
  iconBox: {
    width: 22,
    height: 20,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  houseRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  houseBase: {
    width: 16,
    height: 10,
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  houseDoor: {
    width: 5,
    height: 6,
    backgroundColor: '#121214',
    borderTopLeftRadius: 1.5,
    borderTopRightRadius: 1.5,
  },

  // Services Grid Icon
  gridContainer: {
    width: 20,
    height: 20,
    justifyContent: 'space-between',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridTile: {
    width: 8.5,
    height: 8.5,
    borderWidth: 2,
    borderRadius: 2.5,
  },

  // Deals Tag Icon
  tagContainer: {
    width: 22,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-45deg' }],
  },
  tagHead: {
    width: 16,
    height: 10,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagHoleDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    marginTop: 2,
  },
  tagBody: {
    width: 16,
    height: 10,
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },

  // Profile User Icon
  userContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userHead: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 2,
    marginBottom: 1,
  },
  userBody: {
    width: 17,
    height: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 2,
    borderBottomWidth: 0,
  },
});
