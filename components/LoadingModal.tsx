import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import colors from '@/constants/colors';

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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#161619',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#26262C',
    padding: 24,
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  spinnerContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(217, 142, 50, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(217, 142, 50, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#8E8E98',
    textAlign: 'center',
    lineHeight: 17,
  },
});

export default LoadingModal;
