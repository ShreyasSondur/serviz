import React, { useState } from 'react';
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
} from 'react-native';

interface CarouselProps {
  images: string[];
  height?: number;
  width?: number;
  fallbackImage?: string;
}

const DEFAULT_FALLBACK =
  'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600';

export const SwipableImageCarousel: React.FC<CarouselProps> = ({
  images,
  height = 132,
  width = 130,
  fallbackImage = DEFAULT_FALLBACK,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const imageList =
    images && images.length > 0
      ? images
      : [fallbackImage];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    if (slideSize > 0) {
      const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
      setActiveIndex(index);
    }
  };

  return (
    <View style={[styles.container, { height, width: typeof width === 'number' ? width : '100%' }]}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        nestedScrollEnabled
        style={{ flex: 1 }}
      >
        {imageList.map((imgUri, index) => (
          <Image
            key={index}
            source={{ uri: imgUri }}
            style={[
              styles.image,
              {
                width: typeof width === 'number' ? width : Dimensions.get('window').width - 32,
                height,
              },
            ]}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      {/* Dark Carousel Pill Badge at Bottom Center */}
      {imageList.length > 1 && (
        <View style={styles.carouselPillBadge}>
          {imageList.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                activeIndex === idx ? styles.activeDotPill : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#26262B',
  },
  image: {
    height: '100%',
  },
  carouselPillBadge: {
    position: 'absolute',
    bottom: 6,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  activeDotPill: {
    width: 10,
    backgroundColor: '#D98E32',
  },
  inactiveDot: {
    width: 4,
    backgroundColor: '#666670',
  },
});

export default SwipableImageCarousel;
