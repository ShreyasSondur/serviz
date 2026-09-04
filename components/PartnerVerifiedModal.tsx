import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import colors from '@/constants/colors';
import { ShieldCheckIcon } from '@/components/LandingIcons';

interface PartnerVerifiedModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PartnerVerifiedModal: React.FC<PartnerVerifiedModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Glowing Emerald Shield Icon Badge */}
              <View style={styles.iconCircle}>
                <View style={styles.iconInner}>
                  <ShieldCheckIcon color="#FFFFFF" size={28} />
                </View>
              </View>

              {/* Status Tag */}
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>VERIFIED PARTNER</Text>
              </View>

              {/* Title */}
              <Text style={styles.titleSerif}>Partner Verification Approved</Text>

              {/* Description Body */}
              <Text style={styles.description}>
                Your partner application has been verified by{' '}
                <Text style={styles.goldHighlight}>Serviz Administration</Text>. You now have full authorization to publish service listings and exclusive deals.
              </Text>

              {/* Action Button */}
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.actionBtnText}>Access Partner Dashboard</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#161619',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#26262C',
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 14,
  },
  statusBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  titleSerif: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 13.5,
    color: '#A0A0AA',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
    paddingHorizontal: 6,
  },
  goldHighlight: {
    color: colors.primary,
    fontWeight: '700',
  },
  actionBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default PartnerVerifiedModal;
