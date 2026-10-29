import { Platform } from 'react-native';

export interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export class ImageOptimizerService {
  private static DEFAULT_MAX_WIDTH = 1400;
  private static DEFAULT_QUALITY = 0.8;

  public static async optimizeImage(
    sourceUri: string,
    options: OptimizeOptions = {}
  ): Promise<{ optimizedUri: string; width: number; height: number }> {
    if (!sourceUri) {
      throw new Error('No source URI provided for image optimization.');
    }

    if (Platform.OS === 'web') {
      return {
        optimizedUri: sourceUri,
        width: 1200,
        height: 800,
      };
    }

    try {
      const ImageManipulator = require('expo-image-manipulator');
      const maxWidth = options.maxWidth || this.DEFAULT_MAX_WIDTH;
      const quality = options.quality ?? this.DEFAULT_QUALITY;

      const actions: any[] = [
        {
          resize: {
            width: maxWidth,
          },
        },
      ];

      const saveFormat = ImageManipulator.SaveFormat.JPEG;
      const result = await ImageManipulator.manipulateAsync(sourceUri, actions, {
        compress: quality,
        format: saveFormat,
      });

      return {
        optimizedUri: result.uri,
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      console.warn('ImageOptimizerService: Optimization skipped or failed, using original URI:', error);
      return {
        optimizedUri: sourceUri,
        width: 0,
        height: 0,
      };
    }
  }
}
