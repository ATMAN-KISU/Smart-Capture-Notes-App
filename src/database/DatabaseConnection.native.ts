import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'smart_capture_notes.db';

export class DatabaseConnectionNative {
  private static instance: SQLite.SQLiteDatabase | null = null;
  private static isInitialized = false;

  public static async getDatabase(): Promise<SQLite.SQLiteDatabase | null> {
    if (!this.instance) {
      try {
        this.instance = await SQLite.openDatabaseAsync(DATABASE_NAME);
      } catch (error) {
        console.error('DatabaseConnectionNative: Failed to open SQLite database:', error);
        throw error;
      }
    }

    if (!this.isInitialized && this.instance) {
      await this.initSchema(this.instance);
      this.isInitialized = true;
    }

    return this.instance;
  }

  private static async initSchema(db: SQLite.SQLiteDatabase): Promise<void> {
    try {

      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS notes (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          notes TEXT NOT NULL,
          category TEXT NOT NULL,
          imageUri TEXT NOT NULL,
          imageFileName TEXT NOT NULL,
          imageSize INTEGER DEFAULT 0,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_notes_createdAt ON notes(createdAt DESC);
        CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
      `);
    } catch (error) {
      console.error('DatabaseConnectionNative: Failed to initialize schema:', error);
      throw error;
    }
  }

  public static async closeDatabase(): Promise<void> {
    if (this.instance) {
      try {
        await this.instance.closeAsync();
      } catch (e) {
        console.warn('Error closing database:', e);
      }
      this.instance = null;
      this.isInitialized = false;
    }
  }
}

export const DatabaseConnection = DatabaseConnectionNative;
