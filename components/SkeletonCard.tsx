import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SkeletonCardProps {
  count?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ count = 3 }) => {
  const opacityAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacityAnim]);

  const cards = Array.from({ length: count });

  return (
    <View style={styles.listContainer}>
      {cards.map((_, index) => (
        <View key={index} style={styles.cardContainer}>
          {/* Left Image Skeleton */}
          <Animated.View style={[styles.imageSkeleton, { opacity: opacityAnim }]} />

          {/* Right Content Details Skeleton */}
          <View style={styles.detailsContainer}>
            {/* Top Verified Pill Skeleton */}
            <Animated.View style={[styles.pillSkeleton, { opacity: opacityAnim }]} />

            {/* Title Line 1 Skeleton */}
            <Animated.View style={[styles.titleLine1, { opacity: opacityAnim }]} />

            {/* Title Line 2 Skeleton */}
            <Animated.View style={[styles.titleLine2, { opacity: opacityAnim }]} />

            {/* Location & Meta Row Skeleton */}
            <Animated.View style={[styles.metaRowSkeleton, { opacity: opacityAnim }]} />

            {/* Action Buttons Row Skeleton */}
            <View style={styles.actionsRowSkeleton}>
              <Animated.View style={[styles.btnSkeleton, { opacity: opacityAnim }]} />
              <Animated.View style={[styles.btnSkeleton, { opacity: opacityAnim }]} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 4,
  },
  cardContainer: {
    backgroundColor: '#161619',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#24242A',
    flexDirection: 'row',
    marginBottom: 16,
    padding: 10,
    alignItems: 'center',
    height: 152,
  },
  imageSkeleton: {
    width: 120,
    height: 132,
    borderRadius: 14,
    backgroundColor: '#2A2A32',
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
    height: 130,
  },
  pillSkeleton: {
    width: 80,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2A2A32',
  },
  titleLine1: {
    width: '92%',
    height: 14,
    borderRadius: 4,
    backgroundColor: '#2C2C36',
    marginTop: 4,
  },
  titleLine2: {
    width: '65%',
    height: 14,
    borderRadius: 4,
    backgroundColor: '#2C2C36',
  },
  metaRowSkeleton: {
    width: '80%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#2A2A32',
  },
  actionsRowSkeleton: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  btnSkeleton: {
    flex: 1,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#2A2A32',
  },
});

export default SkeletonCard;
