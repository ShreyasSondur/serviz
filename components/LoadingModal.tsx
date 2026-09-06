import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import colors from '@/constants/colors';
import ServizLogo from '@/components/Logo';

interface LoadingModalProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({
  visible,
  title = 'Authenticating...',
  subtitle = 'Please wait while we secure your account session.',
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.logoBadge}>
            <ServizLogo size="sm" />
          </View>

          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 14, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#141418',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#2A2A34',
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    elevation: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
  },
  logoBadge: {
    marginBottom: 20,
    alignItems: 'center',
  },
  spinnerContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(217, 142, 50, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(217, 142, 50, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 13,
    color: '#9E9EA8',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
});

export default LoadingModal;
