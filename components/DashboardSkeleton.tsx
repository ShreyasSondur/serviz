import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export const DashboardSkeleton: React.FC = () => {
  const opacityAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacityAnim]);

  return (
    <View style={styles.container}>
      {/* 1. Title Header Skeleton */}
      <View style={styles.headerSection}>
        <Animated.View style={[styles.titleLine, { opacity: opacityAnim }]} />
        <Animated.View style={[styles.subtitleLine, { opacity: opacityAnim }]} />
      </View>

      {/* 2. Stat Cards Row Skeleton */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={styles.statTopRow}>
            <Animated.View style={[styles.iconBadge, { opacity: opacityAnim }]} />
            <View style={styles.statTextGroup}>
              <Animated.View style={[styles.countLine, { opacity: opacityAnim }]} />
              <Animated.View style={[styles.labelLine, { opacity: opacityAnim }]} />
            </View>
          </View>
          <Animated.View style={[styles.progressBar, { opacity: opacityAnim }]} />
        </View>

        <View style={styles.statCard}>
          <View style={styles.statTopRow}>
            <Animated.View style={[styles.iconBadge, { opacity: opacityAnim }]} />
            <View style={styles.statTextGroup}>
              <Animated.View style={[styles.countLine, { opacity: opacityAnim }]} />
              <Animated.View style={[styles.labelLine, { opacity: opacityAnim }]} />
            </View>
          </View>
          <Animated.View style={[styles.progressBar, { opacity: opacityAnim }]} />
        </View>
      </View>

      {/* 3. Section 1: Deals Skeleton */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Animated.View style={[styles.sectionTitleLine, { opacity: opacityAnim }]} />
          <Animated.View style={[styles.addBtnSkeleton, { opacity: opacityAnim }]} />
        </View>
        <View style={styles.cardBox}>
          <View style={styles.itemCard}>
            <Animated.View style={[styles.itemImage, { opacity: opacityAnim }]} />
            <View style={styles.itemDetails}>
              <Animated.View style={[styles.itemTitle, { opacity: opacityAnim }]} />
              <Animated.View style={[styles.itemSub, { opacity: opacityAnim }]} />
            </View>
          </View>
        </View>
      </View>

      {/* 4. Section 2: Services Skeleton */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Animated.View style={[styles.sectionTitleLine, { opacity: opacityAnim }]} />
          <Animated.View style={[styles.addBtnSkeleton, { opacity: opacityAnim }]} />
        </View>
        <View style={styles.cardBox}>
          <View style={styles.itemCard}>
            <Animated.View style={[styles.itemImage, { opacity: opacityAnim }]} />
            <View style={styles.itemDetails}>
              <Animated.View style={[styles.itemTitle, { opacity: opacityAnim }]} />
              <Animated.View style={[styles.itemSub, { opacity: opacityAnim }]} />
            </View>
          </View>
          <View style={styles.itemCard}>
            <Animated.View style={[styles.itemImage, { opacity: opacityAnim }]} />
            <View style={styles.itemDetails}>
              <Animated.View style={[styles.itemTitle, { opacity: opacityAnim }]} />
              <Animated.View style={[styles.itemSub, { opacity: opacityAnim }]} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  headerSection: {
    marginBottom: 20,
  },
  titleLine: {
    width: 180,
    height: 28,
    backgroundColor: '#26262B',
    borderRadius: 6,
    marginBottom: 8,
  },
  subtitleLine: {
    width: 260,
    height: 14,
    backgroundColor: '#202025',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#161619',
    borderColor: '#26262B',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  statTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#26262B',
  },
  statTextGroup: {
    flex: 1,
  },
  countLine: {
    width: 50,
    height: 18,
    backgroundColor: '#26262B',
    borderRadius: 4,
    marginBottom: 4,
  },
  labelLine: {
    width: 80,
    height: 10,
    backgroundColor: '#202025',
    borderRadius: 3,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#26262B',
    borderRadius: 2,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitleLine: {
    width: 160,
    height: 22,
    backgroundColor: '#26262B',
    borderRadius: 6,
  },
  addBtnSkeleton: {
    width: 110,
    height: 32,
    backgroundColor: '#26262B',
    borderRadius: 16,
  },
  cardBox: {
    backgroundColor: '#161619',
    borderColor: '#26262B',
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#26262B',
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    width: '70%',
    height: 16,
    backgroundColor: '#26262B',
    borderRadius: 4,
    marginBottom: 8,
  },
  itemSub: {
    width: '45%',
    height: 12,
    backgroundColor: '#202025',
    borderRadius: 4,
  },
});

export default DashboardSkeleton;
