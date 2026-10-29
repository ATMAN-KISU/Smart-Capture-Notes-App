export type Category = 'Work' | 'Personal' | 'Ideas' | 'Receipts' | 'Other';

export const CATEGORIES: readonly Category[] = [
  'Work',
  'Personal',
  'Ideas',
  'Receipts',
  'Other',
] as const;

export interface NoteRecord {
  id: string;
  title: string;
  notes: string;
  category: Category;
  imageUri: string;
  imageFileName: string;
  imageSize: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateRecordInput {
  title: string;
  notes: string;
  category: Category;
  imageUri: string;
  imageFileName?: string;
  imageSize?: number;
}

export interface UpdateRecordInput {
  title?: string;
  notes?: string;
  category?: Category;
  imageUri?: string;
  imageFileName?: string;
  imageSize?: number;
}

export type CategoryFilter = Category | 'All';

export interface FilterOptions {
  searchQuery?: string;
  selectedCategory?: CategoryFilter;
}

export interface CategoryStats {
  [category: string]: number;
}

export type ViewMode = 'list' | 'grid';
