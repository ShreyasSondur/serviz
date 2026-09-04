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

interface ApplicationReceivedModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ApplicationReceivedModal: React.FC<ApplicationReceivedModalProps> = ({
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
              {/* Circular Green Checkmark Badge */}
              <View style={styles.iconCircle}>
                <View style={styles.iconInner}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
              </View>

              {/* Serif Title */}
              <Text style={styles.titleSerif}>Application Received</Text>

              {/* Description Body */}
              <Text style={styles.description}>
                Thank you for applying to become a partner. Your profile is currently{' '}
                <Text style={styles.pendingHighlight}>PENDING</Text> verification from our
                moderators. We will review your details and Emirate ID shortly.
              </Text>

              {/* Action Button */}
              <TouchableOpacity
                style={styles.returnBtn}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.returnBtnText}>Return to Home</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  titleSerif: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 24,
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 13.5,
    color: '#A0A0AA',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  pendingHighlight: {
    color: '#D98E32',
    fontWeight: '700',
  },
  returnBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#26262C',
    borderWidth: 1,
    borderColor: '#383840',
    alignItems: 'center',
    justifyContent: 'center',
  },
  returnBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ApplicationReceivedModal;
