/**
 * Custom Card UI Component for containing screen sections in SERVIZ dark theme.
 */

import React from 'react';
import { View, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import colors from '@/constants/colors';

export interface CardProps extends ViewProps {
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, style, ...rest }) => {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 10,
    width: '100%',
  },
});

export default Card;
