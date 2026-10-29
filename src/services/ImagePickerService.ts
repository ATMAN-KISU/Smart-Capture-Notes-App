import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking, Platform } from 'react-native';

export interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
}

export class ImagePickerService {

  public static async requestCameraPermission(): Promise<PermissionStatus> {
    try {
      const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
      return {
        granted: status === ImagePicker.PermissionStatus.GRANTED,
        canAskAgain,
      };
    } catch (error) {
      console.warn('ImagePickerService: Error requesting camera permission:', error);
      return { granted: false, canAskAgain: true };
    }
  }

  public static async requestMediaLibraryPermission(): Promise<PermissionStatus> {
    try {
      const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return {
        granted: status === ImagePicker.PermissionStatus.GRANTED,
        canAskAgain,
      };
    } catch (error) {
      console.warn('ImagePickerService: Error requesting media library permission:', error);
      return { granted: false, canAskAgain: true };
    }
  }

  public static async capturePhoto(): Promise<string | null> {
    const permission = await this.requestCameraPermission();

    if (!permission.granted) {
      this.notifyPermissionDenied('Camera');
      return null;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.9,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      return result.assets[0].uri;
    } catch (error: any) {
      console.error('ImagePickerService: Camera capture failed:', error);
      Alert.alert('Camera Error', error.message || 'Unable to open camera.');
      return null;
    }
  }

  public static async pickFromGallery(): Promise<string | null> {
    const permission = await this.requestMediaLibraryPermission();

    if (!permission.granted) {
      this.notifyPermissionDenied('Photo Library');
      return null;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.9,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      return result.assets[0].uri;
    } catch (error: any) {
      console.error('ImagePickerService: Gallery pick failed:', error);
      Alert.alert('Gallery Error', error.message || 'Unable to access photo gallery.');
      return null;
    }
  }

  private static notifyPermissionDenied(feature: 'Camera' | 'Photo Library') {
    Alert.alert(
      `${feature} Permission Required`,
      `Smart Capture requires access to your ${feature.toLowerCase()} to attach photos to your notes. Please enable it in device settings.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          },
        },
      ]
    );
  }
}
