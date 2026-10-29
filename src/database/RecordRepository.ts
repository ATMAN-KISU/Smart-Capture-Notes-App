import { DatabaseConnection } from './DatabaseConnection';
import {
  NoteRecord,
  CreateRecordInput,
  UpdateRecordInput,
  FilterOptions,
  Category,
  CATEGORIES,
} from '../types';
import { Platform } from 'react-native';

const WEB_STORAGE_KEY = 'smart_capture_notes_v1';

export class RecordRepository {

  private static memoryStore: Map<string, NoteRecord> = new Map();
  private static isInitialized = false;

  private static ensureWebInitialized(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem(WEB_STORAGE_KEY);
        if (saved) {
          const parsed: NoteRecord[] = JSON.parse(saved);
          parsed.forEach(r => this.memoryStore.set(r.id, r));
          return;
        }
      } catch (e) {
        console.warn('RecordRepository: Failed to load from localStorage:', e);
      }
    }

    if (this.memoryStore.size === 0) {
      const now = Date.now();
      const samples: NoteRecord[] = [
        {
          id: 'rec_sample_1',
          title: 'Weekly Grocery Receipt',
          notes: 'Trader Joes groceries - organic vegetables, almond milk, coffee beans, and snacks.',
          category: 'Receipts',
          imageUri: 'https://images.unsplash.com/photo-1554415707-9e49667ff618?w=800&auto=format&fit=crop&q=80',
          imageFileName: 'receipt_sample_1.jpg',
          imageSize: 420500,
          createdAt: now - 3600000 * 2,
          updatedAt: now - 3600000 * 2,
        },
        {
          id: 'rec_sample_2',
          title: 'Office Whiteboard Brainstorm',
          notes: 'Architecture diagram for new real-time sync service and event-driven pipeline.',
          category: 'Work',
          imageUri: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80',
          imageFileName: 'whiteboard_diagram.jpg',
          imageSize: 890000,
          createdAt: now - 3600000 * 14,
          updatedAt: now - 3600000 * 14,
        },
        {
          id: 'rec_sample_3',
          title: 'App Redesign Wireframe',
          notes: 'Quick sketch of responsive 2-column mobile and tablet grid layout with filter chips.',
          category: 'Ideas',
          imageUri: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
          imageFileName: 'wireframe_concept.jpg',
          imageSize: 654000,
          createdAt: now - 3600000 * 36,
          updatedAt: now - 3600000 * 36,
        },
      ];

      samples.forEach(s => this.memoryStore.set(s.id, s));
      this.persistWebStore();
    }
  }

  private static persistWebStore(): void {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        const arr = Array.from(this.memoryStore.values());
        window.localStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(arr));
      } catch (e) {
        console.warn('RecordRepository: Failed to save to localStorage:', e);
      }
    }
  }

  public static async getAll(options?: FilterOptions): Promise<NoteRecord[]> {
    const db = await DatabaseConnection.getDatabase();

    if (!db) {
      this.ensureWebInitialized();
      return this.filterMemoryRecords(options);
    }

    try {
      let query = 'SELECT * FROM notes WHERE 1=1';
      const params: any[] = [];

      if (options?.selectedCategory && options.selectedCategory !== 'All') {
        query += ' AND category = ?';
        params.push(options.selectedCategory);
      }

      if (options?.searchQuery && options.searchQuery.trim().length > 0) {
        const searchPattern = `%${options.searchQuery.trim()}%`;
        query += ' AND (title LIKE ? OR notes LIKE ?)';
        params.push(searchPattern, searchPattern);
      }

      query += ' ORDER BY createdAt DESC;';

      const rows = (await db.getAllAsync(query, params)) as any[];
      return rows.map(this.mapRowToRecord);
    } catch (error) {
      console.error('RecordRepository: Error fetching records:', error);
      throw new Error('Failed to retrieve records from database.');
    }
  }

  /**
   * Retrieves a single record by its unique ID.
   */
  public static async getById(id: string): Promise<NoteRecord | null> {
    const db = await DatabaseConnection.getDatabase();

    if (!db) {
      this.ensureWebInitialized();
      return this.memoryStore.get(id) || null;
    }

    try {
      const row = (await db.getFirstAsync('SELECT * FROM notes WHERE id = ? LIMIT 1;', [id])) as any;
      if (!row) return null;
      return this.mapRowToRecord(row);
    } catch (error) {
      console.error(`RecordRepository: Error fetching record ${id}:`, error);
      throw new Error(`Failed to retrieve record ${id}`);
    }
  }

  /**
   * Inserts a new note record into SQLite.
   */
  public static async insert(input: CreateRecordInput): Promise<NoteRecord> {
    const now = Date.now();
    const id = `rec_${now}_${Math.random().toString(36).substring(2, 9)}`;

    const newRecord: NoteRecord = {
      id,
      title: input.title.trim(),
      notes: input.notes.trim(),
      category: input.category,
      imageUri: input.imageUri,
      imageFileName: input.imageFileName || `img_${id}.jpg`,
      imageSize: input.imageSize || 0,
      createdAt: now,
      updatedAt: now,
    };

    const db = await DatabaseConnection.getDatabase();

    if (!db) {
      this.ensureWebInitialized();
      this.memoryStore.set(id, newRecord);
      this.persistWebStore();
      return newRecord;
    }

    try {
      await db.runAsync(
        `INSERT INTO notes (
          id, title, notes, category, imageUri, imageFileName, imageSize, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          newRecord.id,
          newRecord.title,
          newRecord.notes,
          newRecord.category,
          newRecord.imageUri,
          newRecord.imageFileName,
          newRecord.imageSize,
          newRecord.createdAt,
          newRecord.updatedAt,
        ]
      );

      return newRecord;
    } catch (error) {
      console.error('RecordRepository: Error inserting record:', error);
      throw new Error('Failed to save record to database.');
    }
  }

  /**
   * Updates an existing record's fields and refreshes the updatedAt timestamp.
   */
  public static async update(id: string, updates: UpdateRecordInput): Promise<NoteRecord> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Record with id ${id} does not exist.`);
    }

    const updated: NoteRecord = {
      ...existing,
      title: updates.title !== undefined ? updates.title.trim() : existing.title,
      notes: updates.notes !== undefined ? updates.notes.trim() : existing.notes,
      category: updates.category !== undefined ? updates.category : existing.category,
      imageUri: updates.imageUri !== undefined ? updates.imageUri : existing.imageUri,
      imageFileName: updates.imageFileName !== undefined ? updates.imageFileName : existing.imageFileName,
      imageSize: updates.imageSize !== undefined ? updates.imageSize : existing.imageSize,
      updatedAt: Date.now(),
    };

    const db = await DatabaseConnection.getDatabase();

    if (!db) {
      this.ensureWebInitialized();
      this.memoryStore.set(id, updated);
      this.persistWebStore();
      return updated;
    }

    try {
      await db.runAsync(
        `UPDATE notes SET
          title = ?,
          notes = ?,
          category = ?,
          imageUri = ?,
          imageFileName = ?,
          imageSize = ?,
          updatedAt = ?
        WHERE id = ?;`,
        [
          updated.title,
          updated.notes,
          updated.category,
          updated.imageUri,
          updated.imageFileName,
          updated.imageSize,
          updated.updatedAt,
          id,
        ]
      );

      return updated;
    } catch (error) {
      console.error(`RecordRepository: Error updating record ${id}:`, error);
      throw new Error(`Failed to update record ${id}`);
    }
  }

  /**
   * Deletes a record from the database by its ID.
   */
  public static async delete(id: string): Promise<boolean> {
    const db = await DatabaseConnection.getDatabase();

    if (!db) {
      this.ensureWebInitialized();
      const res = this.memoryStore.delete(id);
      this.persistWebStore();
      return res;
    }

    try {
      const result = await db.runAsync('DELETE FROM notes WHERE id = ?;', [id]);
      return result.changes > 0;
    } catch (error) {
      console.error(`RecordRepository: Error deleting record ${id}:`, error);
      throw new Error(`Failed to delete record ${id}`);
    }
  }

  /**
   * Aggregates note counts grouped by category for dashboard analytics.
   */
  public static async getCategoryStats(): Promise<Record<string, number>> {
    const stats: Record<string, number> = {
      All: 0,
    };
    for (const cat of CATEGORIES) {
      stats[cat] = 0;
    }

    const db = await DatabaseConnection.getDatabase();

    if (!db) {
      this.ensureWebInitialized();
      const all = Array.from(this.memoryStore.values());
      stats.All = all.length;
      for (const rec of all) {
        stats[rec.category] = (stats[rec.category] || 0) + 1;
      }
      return stats;
    }

    try {
      const rows = (await db.getAllAsync(
        'SELECT category, COUNT(*) as count FROM notes GROUP BY category;'
      )) as Array<{ category: string; count: number }>;

      let total = 0;
      for (const row of rows) {
        stats[row.category] = row.count;
        total += row.count;
      }
      stats.All = total;

      return stats;
    } catch (error) {
      console.error('RecordRepository: Error aggregating category counts:', error);
      return stats;
    }
  }

  private static mapRowToRecord(row: any): NoteRecord {
    return {
      id: String(row.id),
      title: String(row.title),
      notes: String(row.notes || ''),
      category: row.category as Category,
      imageUri: String(row.imageUri),
      imageFileName: String(row.imageFileName || ''),
      imageSize: Number(row.imageSize || 0),
      createdAt: Number(row.createdAt),
      updatedAt: Number(row.updatedAt),
    };
  }

  private static filterMemoryRecords(options?: FilterOptions): NoteRecord[] {
    let records = Array.from(this.memoryStore.values());

    if (options?.selectedCategory && options.selectedCategory !== 'All') {
      records = records.filter(r => r.category === options.selectedCategory);
    }

    if (options?.searchQuery && options.searchQuery.trim().length > 0) {
      const q = options.searchQuery.toLowerCase().trim();
      records = records.filter(
        r => r.title.toLowerCase().includes(q) || r.notes.toLowerCase().includes(q)
      );
    }

    return records.sort((a, b) => b.createdAt - a.createdAt);
  }
}
