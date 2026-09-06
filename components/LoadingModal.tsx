import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
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

          <View style={styles.spinnerWrapper}>
            <ActivityIndicator size="small" color="#D4933A" />
          </View>

          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 290,
    backgroundColor: '#161619',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#26262D',
    paddingVertical: 24,
    paddingHorizontal: 22,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.45)',
      } as any,
    }),
  },
  logoBadge: {
    marginBottom: 16,
    alignItems: 'center',
    opacity: 0.95,
  },
  spinnerWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E1E24',
    borderWidth: 1,
    borderColor: '#2D2D36',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F4F4F6',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  subtitle: {
    fontSize: 12,
    color: '#8A8A96',
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 6,
  },
});

export default LoadingModal;
