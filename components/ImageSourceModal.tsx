import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import colors from '@/constants/colors';

interface ImageSourceModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCamera: () => void;
  onSelectLibrary: () => void;
}

export const ImageSourceModal: React.FC<ImageSourceModalProps> = ({
  visible,
  onClose,
  onSelectCamera,
  onSelectLibrary,
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
            <View style={styles.modalCard}>
              <View style={styles.handleBar} />
              
              <Text style={styles.modalTitle}>Upload Image</Text>
              <Text style={styles.modalSub}>
                Choose how you would like to select your photo
              </Text>

              {/* Option 1: Camera */}
              <TouchableOpacity
                style={styles.optionBtn}
                onPress={() => {
                  onClose();
                  onSelectCamera();
                }}
                activeOpacity={0.8}
              >
                <View style={styles.iconBadge}>
                  <Text style={styles.iconEmoji}>📷</Text>
                </View>
                <View style={styles.optionTextGroup}>
                  <Text style={styles.optionTitle}>Take Photo</Text>
                  <Text style={styles.optionSub}>Use your device camera</Text>
                </View>
                <Text style={styles.arrowIcon}>→</Text>
              </TouchableOpacity>

              {/* Option 2: Library */}
              <TouchableOpacity
                style={styles.optionBtn}
                onPress={() => {
                  onClose();
                  onSelectLibrary();
                }}
                activeOpacity={0.8}
              >
                <View style={styles.iconBadge}>
                  <Text style={styles.iconEmoji}>🖼️</Text>
                </View>
                <View style={styles.optionTextGroup}>
                  <Text style={styles.optionTitle}>Choose from Library</Text>
                  <Text style={styles.optionSub}>Select photos from your device</Text>
                </View>
                <Text style={styles.arrowIcon}>→</Text>
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#161619',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: '#26262C',
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 36,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#33333A',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 13,
    color: '#8E8E98',
    marginBottom: 20,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C20',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A32',
    padding: 14,
    marginBottom: 12,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(217, 142, 50, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(217, 142, 50, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconEmoji: {
    fontSize: 20,
  },
  optionTextGroup: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  optionSub: {
    fontSize: 12,
    color: '#8E8E98',
  },
  arrowIcon: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  cancelBtn: {
    backgroundColor: '#222226',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelBtnText: {
    color: '#A0A0A8',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ImageSourceModal;
