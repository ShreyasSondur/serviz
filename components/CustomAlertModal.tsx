import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import colors from '@/constants/colors';
import { GreenCheckCircleIcon, CloseCrossIcon } from '@/components/LandingIcons';

interface CustomAlertModalProps {
  visible: boolean;
  type?: 'success' | 'error' | 'info';
  icon?: string;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
}

export const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
  visible,
  type = 'success',
  icon,
  title,
  message,
  buttonText = 'OK',
  onClose,
}) => {
  if (!visible) return null;

  const isSuccess = type === 'success';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.alertCard}>
          {/* Top Icon Badge */}
          <View style={[styles.iconBadge, isSuccess ? styles.successBadge : styles.errorBadge]}>
            {icon ? (
              <Text style={{ fontSize: 26 }}>{icon}</Text>
            ) : isSuccess ? (
              <GreenCheckCircleIcon size={32} />
            ) : (
              <CloseCrossIcon size={24} color="#FF453A" />
            )}
          </View>

          {/* Title & Message */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Action Button */}
          <TouchableOpacity style={styles.actionBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.actionBtnText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  alertCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#161619',
    borderColor: '#26262B',
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    borderColor: 'rgba(52, 199, 89, 0.3)',
    borderWidth: 1,
  },
  errorBadge: {
    backgroundColor: 'rgba(255, 69, 58, 0.12)',
    borderColor: 'rgba(255, 69, 58, 0.3)',
    borderWidth: 1,
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#A0A0A8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  actionBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default CustomAlertModal;
