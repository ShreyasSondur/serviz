/**
 * Custom Input UI Component with focus ring & password toggle UI/UX enhancements.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import colors from '@/constants/colors';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  leftElement,
  secureTextEntry,
  autoCapitalize,
  autoCorrect,
  spellCheck,
  style,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const isPassword = secureTextEntry;

  // For password fields, disable autoCapitalize, autoCorrect, and spellCheck by default
  const computedAutoCapitalize =
    autoCapitalize ?? (isPassword ? 'none' : 'sentences');
  const computedAutoCorrect = autoCorrect ?? (isPassword ? false : true);
  const computedSpellCheck = spellCheck ?? (isPassword ? false : true);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          isFocused ? styles.inputFocused : null,
          error ? styles.inputError : null,
        ]}
      >
        {leftElement && <View style={styles.leftElement}>{leftElement}</View>}

        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#666670"
          secureTextEntry={isPassword && !isPasswordVisible}
          autoCapitalize={computedAutoCapitalize}
          autoCorrect={computedAutoCorrect}
          spellCheck={computedSpellCheck}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />

        {isPassword && (
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            activeOpacity={0.7}
          >
            <Text style={styles.eyeText}>
              {isPasswordVisible ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161618',
    borderWidth: 1,
    borderColor: '#26262B',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: '#18181B',
  },
  leftElement: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    height: '100%',
  },
  eyeBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  eyeText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 6,
  },
});

export default Input;
