import { Platform } from 'react-native';

export class DatabaseConnection {
  public static async getDatabase(): Promise<any> {
    if (Platform.OS === 'web') {
      return null;
    }
    const { DatabaseConnectionNative } = require('./DatabaseConnection.native');
    return DatabaseConnectionNative.getDatabase();
  }

  public static async closeDatabase(): Promise<void> {
    if (Platform.OS === 'web') return;
    const { DatabaseConnectionNative } = require('./DatabaseConnection.native');
    return DatabaseConnectionNative.closeDatabase();
  }
}
