import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Text,
  Modal,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRecords } from '../state/RecordsContext';
import { Header } from '../components/common/Header';
import { SearchBar } from '../components/common/SearchBar';
import { CategoryChips } from '../components/common/CategoryChips';
import { DashboardStats } from '../components/common/DashboardStats';
import { EmptyState } from '../components/common/EmptyState';
import { RecordCard } from '../components/record/RecordCard';
import { RecordGridItem } from '../components/record/RecordGridItem';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Toast } from '../components/common/Toast';
import { ImagePickerService } from '../services/ImagePickerService';
import { CategoryFilter } from '../types';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../theme/spacing';

interface HomeScreenProps {
  onOpenCapture: (imageUri: string) => void;
  onOpenDetail: (recordId: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenCapture,
  onOpenDetail,
}) => {
  const {
    records,
    categoryStats,
    isLoading,
    searchQuery,
    selectedCategory,
    viewMode,
    toast,
    setSearchQuery,
    setSelectedCategory,
    toggleViewMode,
    refreshRecords,
    deleteRecord,
    hideToast,
  } = useRecords();

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);

  const handleCameraCapture = async () => {
    setIsFabMenuOpen(false);
    const uri = await ImagePickerService.capturePhoto();
    if (uri) {
      onOpenCapture(uri);
    }
  };

  const handleGalleryPick = async () => {
    setIsFabMenuOpen(false);
    const uri = await ImagePickerService.pickFromGallery();
    if (uri) {
      onOpenCapture(uri);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTargetId) {
      const id = deleteTargetId;
      setDeleteTargetId(null);
      await deleteRecord(id);
    }
  };

  const insets = useSafeAreaInsets();

  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (RNStatusBar.currentHeight || 28) : 0
  );
  const bottomInset = insets.bottom;

  const isFiltering =
    Boolean(searchQuery.trim().length > 0) || selectedCategory !== 'All';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      <Toast toast={toast} onDismiss={hideToast} />

      <View style={[styles.container, { paddingTop: topInset }]}>

        <Header
          title="Smart Capture"
          subtitle="Instant offline notes & receipts"
          showViewToggle
          viewMode={viewMode}
          onToggleViewMode={toggleViewMode}
        />

        <DashboardStats
          stats={categoryStats}
          onSelectCategory={(cat: CategoryFilter) => setSelectedCategory(cat)}
        />

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />

        <CategoryChips
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categoryStats={categoryStats}
        />

        <FlatList
          data={records}
          key={viewMode}
          numColumns={viewMode === 'grid' ? 2 : 1}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.listContent,
            viewMode === 'grid' && styles.gridContent,
            records.length === 0 && styles.emptyListContent,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refreshRecords}
              tintColor={Colors.primary}
              colors={[Colors.primary, '#FFFFFF']}
            />
          }
          renderItem={({ item }) =>
            viewMode === 'list' ? (
              <RecordCard
                record={item}
                onPress={() => onOpenDetail(item.id)}
                onDeletePress={() => setDeleteTargetId(item.id)}
              />
            ) : (
              <RecordGridItem
                record={item}
                onPress={() => onOpenDetail(item.id)}
              />
            )
          }
          ListEmptyComponent={
            !isLoading ? (
              <EmptyState
                isFiltering={isFiltering}
                onActionPress={() => setIsFabMenuOpen(true)}
                onClearFilters={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
              />
            ) : undefined
          }
        />

        <View style={[styles.fabWrapper, { bottom: Math.max(bottomInset + 20, 24) }]}>
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setIsFabMenuOpen(true)}
            activeOpacity={0.85}
            accessibilityLabel="Capture photo or choose image"
            accessibilityRole="button"
          >
            <Ionicons name="camera" size={22} color={Colors.textOnYellow} />
            <Text style={styles.fabText}>CAPTURE</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={isFabMenuOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsFabMenuOpen(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setIsFabMenuOpen(false)}
          >
            <View style={[styles.actionSheet, { paddingBottom: Math.max(bottomInset + Spacing.lg, Spacing.xxl) }]}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>New Photo Note</Text>
              <Text style={styles.sheetSubtitle}>
                Snap a live document or attach from gallery
              </Text>

              <TouchableOpacity
                style={styles.sheetOption}
                onPress={handleCameraCapture}
                activeOpacity={0.75}
              >
                <View style={styles.sheetIconCircle}>
                  <Ionicons name="camera" size={22} color={Colors.textOnYellow} />
                </View>
                <View style={styles.sheetOptionText}>
                  <Text style={styles.sheetOptionTitle}>Take Photo</Text>
                  <Text style={styles.sheetOptionDesc}>Use camera to snap a receipt, document, or sketch</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sheetOption}
                onPress={handleGalleryPick}
                activeOpacity={0.75}
              >
                <View style={[styles.sheetIconCircle, styles.sheetIconCircleSecondary]}>
                  <Ionicons name="images" size={22} color={Colors.primary} />
                </View>
                <View style={styles.sheetOptionText}>
                  <Text style={styles.sheetOptionTitle}>Choose from Gallery</Text>
                  <Text style={styles.sheetOptionDesc}>Select an existing image from your photo album</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sheetCancelBtn}
                onPress={() => setIsFabMenuOpen(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.sheetCancelText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        <ConfirmDialog
          visible={deleteTargetId !== null}
          title="Delete Note & File?"
          message="This will delete this note from the database and unlink its image from local storage. This action cannot be reversed."
          confirmText="Delete Note"
          cancelText="Cancel"
          isDestructive
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTargetId(null)}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: 96,
  },
  gridContent: {
    paddingHorizontal: Spacing.sm,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  fabWrapper: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    zIndex: 10,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.round,
    ...Shadows.glowYellow,
  },
  fabText: {
    color: Colors.textOnYellow,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    ...Shadows.lg,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.surfaceBorder,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  sheetSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.sm,
  },
  sheetIconCircle: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  sheetIconCircleSecondary: {
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  sheetOptionText: {
    flex: 1,
  },
  sheetOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sheetOptionDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sheetCancelBtn: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  sheetCancelText: {
    color: Colors.textSecondary,
    fontWeight: '700',
    fontSize: 13,
  },
});
