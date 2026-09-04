import { Alert, ActionSheetIOS, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

/**
 * Open device photo gallery.
 */
export async function pickImageFromLibrary(): Promise<string | null> {
  const libraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!libraryStatus.granted) {
    Alert.alert('Permission Required', 'Permission to access photo library is required.');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.7,
    base64: true,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    const asset = result.assets[0];
    if (asset.base64) {
      return `data:image/jpeg;base64,${asset.base64}`;
    }
    return asset.uri;
  }
  return null;
}

/**
 * Open native camera to take a photo.
 */
export async function takePhotoWithCamera(): Promise<string | null> {
  const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
  if (!cameraStatus.granted) {
    Alert.alert('Permission Required', 'Permission to access camera is required.');
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.7,
    base64: true,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    const asset = result.assets[0];
    if (asset.base64) {
      return `data:image/jpeg;base64,${asset.base64}`;
    }
    return asset.uri;
  }
  return null;
}

/**
 * Show source selection prompt (Camera vs Photo Library).
 */
export function promptImageSelection(onImagePicked: (uri: string) => void) {
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'Take Photo with Camera', 'Choose from Photo Library'],
        cancelButtonIndex: 0,
      },
      async (buttonIndex) => {
        if (buttonIndex === 1) {
          const uri = await takePhotoWithCamera();
          if (uri) onImagePicked(uri);
        } else if (buttonIndex === 2) {
          const uri = await pickImageFromLibrary();
          if (uri) onImagePicked(uri);
        }
      }
    );
  } else {
    Alert.alert(
      'Select Image Source',
      'Choose whether to take a new photo with your camera or select an image from your library.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: '📷 Take Photo',
          onPress: async () => {
            const uri = await takePhotoWithCamera();
            if (uri) onImagePicked(uri);
          },
        },
        {
          text: '🖼️ Choose from Library',
          onPress: async () => {
            const uri = await pickImageFromLibrary();
            if (uri) onImagePicked(uri);
          },
        },
      ]
    );
  }
}

// Backwards compatibility alias
export const pickImage = pickImageFromLibrary;
