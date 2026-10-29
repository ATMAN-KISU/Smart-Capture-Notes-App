import { Platform } from 'react-native';

const STORAGE_FOLDER = 'smart_capture_images/';

export interface SaveImageResult {
  permanentUri: string;
  fileName: string;
  fileSize: number;
}

export class FileStorageService {
  private static getFileSystem(): any {
    if (Platform.OS === 'web') return null;
    try {
      return require('expo-file-system');
    } catch {
      return null;
    }
  }

  private static getBaseDirectory(): string {
    const FileSystem = this.getFileSystem();
    if (!FileSystem || !FileSystem.documentDirectory) {
      return '';
    }
    return `${FileSystem.documentDirectory}${STORAGE_FOLDER}`;
  }

  /**
   * Ensures that the dedicated images directory exists on the device filesystem.
   */
  public static async ensureDirectoryExists(): Promise<string> {
    if (Platform.OS === 'web') return '';
    const FileSystem = this.getFileSystem();
    if (!FileSystem) return '';

    const dir = this.getBaseDirectory();
    if (!dir) return '';

    try {
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }
    } catch (error) {
      console.warn('FileStorageService: Unable to create directory:', error);
    }
    return dir;
  }

  /**
   * Persists a captured or picked image into the permanent app documents directory.
   */
  public static async saveImage(sourceUri: string): Promise<SaveImageResult> {
    if (!sourceUri) {
      throw new Error('Invalid image source URI provided.');
    }

    if (Platform.OS === 'web') {
      return {
        permanentUri: sourceUri,
        fileName: `web_img_${Date.now()}.jpg`,
        fileSize: 245000,
      };
    }

    const FileSystem = this.getFileSystem();
    if (!FileSystem || !FileSystem.documentDirectory) {
      return {
        permanentUri: sourceUri,
        fileName: `cached_img_${Date.now()}.jpg`,
        fileSize: 0,
      };
    }

    try {
      const baseDir = await this.ensureDirectoryExists();
      const extension = this.getFileExtension(sourceUri) || 'jpg';
      const fileName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
      const destinationUri = `${baseDir}${fileName}`;

      await FileSystem.copyAsync({
        from: sourceUri,
        to: destinationUri,
      });

      const fileInfo = await FileSystem.getInfoAsync(destinationUri);
      const fileSize = fileInfo.exists && typeof fileInfo.size === 'number' ? fileInfo.size : 0;

      return {
        permanentUri: destinationUri,
        fileName,
        fileSize,
      };
    } catch (error: any) {
      console.error('FileStorageService: Failed to copy image to permanent storage:', error);
      throw new Error(`Failed to save image file: ${error.message || 'Unknown filesystem error'}`);
    }
  }

  /**
   * Deletes an image from the local filesystem to prevent orphaned files.
   */
  public static async deleteImage(uri: string): Promise<boolean> {
    if (!uri) return false;
    if (Platform.OS === 'web') return true;

    const FileSystem = this.getFileSystem();
    if (!FileSystem) return true;

    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
        return true;
      }
      return false;
    } catch (error) {
      console.warn(`FileStorageService: Error unlinking file at ${uri}:`, error);
      return false;
    }
  }

  /**
   * Checks if an image file exists at the given URI.
   */
  public static async fileExists(uri: string): Promise<boolean> {
    if (!uri) return false;
    if (Platform.OS === 'web') return true;

    const FileSystem = this.getFileSystem();
    if (!FileSystem) return true;

    try {
      const info = await FileSystem.getInfoAsync(uri);
      return info.exists;
    } catch {
      return false;
    }
  }

  /**
   * Helper to format raw bytes into human-readable strings (e.g., 2.4 MB).
   */
  public static formatBytes(bytes: number, decimals = 1): string {
    if (!bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formatted = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
    return `${formatted} ${sizes[i] || 'MB'}`;
  }

  private static getFileExtension(uri: string): string {
    const cleanUri = uri.split('?')[0];
    const parts = cleanUri.split('.');
    if (parts.length > 1) {
      const ext = parts.pop()?.toLowerCase();
      if (ext && ['jpg', 'jpeg', 'png', 'heic', 'webp'].includes(ext)) {
        return ext === 'jpeg' ? 'jpg' : ext;
      }
    }
    return 'jpg';
  }
}
