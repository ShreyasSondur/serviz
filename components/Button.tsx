/**
 * Custom Button UI Component styled to match exact button specs in screenshot.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import colors from '@/constants/colors';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'google' | 'outline' | 'ghost';
  showArrow?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  showArrow = false,
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  ...rest
}) => {
  const getButtonStyle = (): ViewStyle => {
    switch (variant) {
      case 'google':
        return styles.googleButton;
      case 'outline':
        return styles.outlineButton;
      case 'ghost':
        return styles.ghostButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'google':
        return '#1A1A1D';
      case 'outline':
      case 'ghost':
        return colors.primary;
      default:
        return '#FFFFFF';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.baseButton,
        getButtonStyle(),
        (disabled || loading) && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.85}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.text,
              variant === 'google' ? styles.googleText : null,
              { color: getTextColor() },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {showArrow && (
            <Text style={[styles.arrowText, { color: getTextColor() }]}> →</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
  googleText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  arrowText: {
    fontSize: 18,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.65,
  },
});

export default Button;
