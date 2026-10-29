import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  NoteRecord,
  Category,
  CategoryFilter,
  ViewMode,
  CreateRecordInput,
  UpdateRecordInput,
} from '../types';
import { RecordRepository } from '../database/RecordRepository';
import { FileStorageService } from '../services/FileStorageService';
import { ImageOptimizerService } from '../services/ImageOptimizerService';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface RecordsContextValue {
  records: NoteRecord[];
  categoryStats: Record<string, number>;
  isLoading: boolean;
  isActionLoading: boolean;
  searchQuery: string;
  selectedCategory: CategoryFilter;
  viewMode: ViewMode;
  toast: ToastMessage | null;
  error: string | null;

  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: CategoryFilter) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  refreshRecords: () => Promise<void>;
  createRecord: (
    title: string,
    notes: string,
    category: Category,
    rawImageUri: string
  ) => Promise<NoteRecord | null>;
  updateRecord: (id: string, updates: UpdateRecordInput) => Promise<NoteRecord | null>;
  deleteRecord: (id: string) => Promise<boolean>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  clearError: () => void;
}

const RecordsContext = createContext<RecordsContextValue | undefined>(undefined);

export const RecordsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<NoteRecord[]>([]);
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({
      id: String(Date.now()),
      type,
      message,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => (prev === 'list' ? 'grid' : 'list'));
  }, []);

  const refreshRecords = useCallback(async () => {
    try {
      setError(null);
      const [fetchedRecords, stats] = await Promise.all([
        RecordRepository.getAll({
          searchQuery,
          selectedCategory,
        }),
        RecordRepository.getCategoryStats(),
      ]);

      setRecords(fetchedRecords);
      setCategoryStats(stats);
    } catch (err: any) {
      console.error('RecordsContext: Failed to load records:', err);
      setError(err.message || 'Failed to load records.');
      showToast('Error loading records', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, showToast]);

  useEffect(() => {
    refreshRecords();
  }, [refreshRecords]);

  const createRecord = useCallback(
    async (
      title: string,
      notes: string,
      category: Category,
      rawImageUri: string
    ): Promise<NoteRecord | null> => {
      if (!title.trim()) {
        showToast('Please enter a note title', 'error');
        return null;
      }

      if (!rawImageUri) {
        showToast('Please provide an image for the note', 'error');
        return null;
      }

      setIsActionLoading(true);
      setError(null);

      try {

        const optimized = await ImageOptimizerService.optimizeImage(rawImageUri);

        const savedImage = await FileStorageService.saveImage(optimized.optimizedUri);

        const newRecord = await RecordRepository.insert({
          title,
          notes,
          category,
          imageUri: savedImage.permanentUri,
          imageFileName: savedImage.fileName,
          imageSize: savedImage.fileSize,
        });

        showToast('Note captured successfully!', 'success');
        await refreshRecords();
        return newRecord;
      } catch (err: any) {
        console.error('RecordsContext: Create failed:', err);
        const errMsg = err.message || 'Failed to save note';
        setError(errMsg);
        showToast(errMsg, 'error');
        return null;
      } finally {
        setIsActionLoading(false);
      }
    },
    [refreshRecords, showToast]
  );

  const updateRecord = useCallback(
    async (id: string, updates: UpdateRecordInput): Promise<NoteRecord | null> => {
      setIsActionLoading(true);
      setError(null);

      try {
        const updated = await RecordRepository.update(id, updates);
        showToast('Note updated successfully!', 'success');
        await refreshRecords();
        return updated;
      } catch (err: any) {
        console.error('RecordsContext: Update failed:', err);
        const errMsg = err.message || 'Failed to update note';
        setError(errMsg);
        showToast(errMsg, 'error');
        return null;
      } finally {
        setIsActionLoading(false);
      }
    },
    [refreshRecords, showToast]
  );

  const deleteRecord = useCallback(
    async (id: string): Promise<boolean> => {
      setIsActionLoading(true);
      setError(null);

      try {
        const record = await RecordRepository.getById(id);
        if (!record) {
          showToast('Record not found', 'error');
          return false;
        }

        await RecordRepository.delete(id);

        if (record.imageUri) {
          await FileStorageService.deleteImage(record.imageUri);
        }

        showToast('Note and image deleted successfully', 'success');
        await refreshRecords();
        return true;
      } catch (err: any) {
        console.error('RecordsContext: Delete failed:', err);
        const errMsg = err.message || 'Failed to delete note';
        setError(errMsg);
        showToast(errMsg, 'error');
        return false;
      } finally {
        setIsActionLoading(false);
      }
    },
    [refreshRecords, showToast]
  );

  return (
    <RecordsContext.Provider
      value={{
        records,
        categoryStats,
        isLoading,
        isActionLoading,
        searchQuery,
        selectedCategory,
        viewMode,
        toast,
        error,
        setSearchQuery,
        setSelectedCategory,
        setViewMode,
        toggleViewMode,
        refreshRecords,
        createRecord,
        updateRecord,
        deleteRecord,
        showToast,
        hideToast,
        clearError,
      }}
    >
      {children}
    </RecordsContext.Provider>
  );
};

export const useRecords = (): RecordsContextValue => {
  const context = useContext(RecordsContext);
  if (!context) {
    throw new Error('useRecords must be used within a RecordsProvider');
  }
  return context;
};
