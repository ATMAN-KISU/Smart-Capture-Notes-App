import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Dimensions,
  Share,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Category, CATEGORIES } from '../types';
import { useRecords } from '../state/RecordsContext';
import { CategoryBadge } from '../components/record/CategoryBadge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { LoadingOverlay } from '../components/common/LoadingOverlay';
import { FileStorageService } from '../services/FileStorageService';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, BorderRadius, Shadows } from '../theme/spacing';

interface DetailScreenProps {
  recordId: string;
  onBack: () => void;
  onDeleted: () => void;
}

export const DetailScreen: React.FC<DetailScreenProps> = ({
  recordId,
  onBack,
  onDeleted,
}) => {
  const { records, updateRecord, deleteRecord, isActionLoading } = useRecords();

  const currentRecord = records.find(r => r.id === recordId);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<Category>('Work');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isFullScreenImage, setIsFullScreenImage] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (currentRecord) {
      setTitle(currentRecord.title);
      setNotes(currentRecord.notes);
      setCategory(currentRecord.category);
    }
  }, [currentRecord]);

  if (!currentRecord) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.primary} />
          <Text style={[Typography.h3, styles.notFoundText]}>Note Not Found</Text>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Return to Notes</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleSaveChanges = async () => {
    if (!title.trim()) return;

    await updateRecord(recordId, {
      title,
      notes,
      category,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setTitle(currentRecord.title);
    setNotes(currentRecord.notes);
    setCategory(currentRecord.category);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setShowDeleteModal(false);
    const success = await deleteRecord(recordId);
    if (success) {
      onDeleted();
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: currentRecord.title,
        message: `${currentRecord.title} [${currentRecord.category}]\n\n${currentRecord.notes}`,
        url: Platform.OS === 'ios' ? currentRecord.imageUri : undefined,
      });
    } catch (e) {
      console.warn('Share cancelled:', e);
    }
  };

  const createdDate = new Date(currentRecord.createdAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const updatedDate = new Date(currentRecord.updatedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const fileSize =
    currentRecord.imageSize > 0
      ? FileStorageService.formatBytes(currentRecord.imageSize)
      : 'Unknown';

  const insets = useSafeAreaInsets();
  // Comfortable safety distance below front punch-hole cameras & notches
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (RNStatusBar.currentHeight || 28) : 0
  );
  const bottomInset = insets.bottom;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <LoadingOverlay visible={isActionLoading} message="Updating note..." />

      <View style={[styles.topBar, { paddingTop: topInset + Spacing.sm }]}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onBack}
          accessibilityLabel="Back to notes"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.topBarRight}>
          {!isEditing ? (
            <>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={handleShare}
                accessibilityLabel="Share note"
                accessibilityRole="button"
              >
                <Ionicons name="share-outline" size={18} color={Colors.textPrimary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.iconBtn, styles.editTopBtn]}
                onPress={() => setIsEditing(true)}
                accessibilityLabel="Edit note"
                accessibilityRole="button"
              >
                <Ionicons name="pencil-outline" size={18} color={Colors.textOnYellow} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.iconBtn, styles.deleteTopBtn]}
                onPress={() => setShowDeleteModal(true)}
                accessibilityLabel="Delete note"
                accessibilityRole="button"
              >
                <Ionicons name="trash-outline" size={18} color={Colors.danger} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.cancelTextBtn}
                onPress={handleCancelEdit}
                accessibilityRole="button"
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, !title.trim() && styles.saveBtnDisabled]}
                onPress={handleSaveChanges}
                disabled={!title.trim() || isActionLoading}
                accessibilityRole="button"
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(bottomInset + Spacing.xl, Spacing.xxxl) },
        ]}
        showsVerticalScrollIndicator={false}
      >

        <TouchableOpacity
          style={styles.imageCard}
          activeOpacity={0.9}
          onPress={() => setIsFullScreenImage(true)}
          accessibilityLabel="View full image"
          accessibilityRole="imagebutton"
        >
          {currentRecord.imageUri && !imageError ? (
            <Image
              source={{ uri: currentRecord.imageUri }}
              style={styles.previewImage}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.imageFallback}>
              <Ionicons name="image-outline" size={44} color={Colors.textMuted} />
              <Text style={styles.fallbackText}>Image file missing or inaccessible</Text>
            </View>
          )}

          <View style={styles.expandPill}>
            <Ionicons name="expand-outline" size={13} color={Colors.primary} />
            <Text style={styles.expandText}>Tap to zoom</Text>
          </View>
        </TouchableOpacity>

        {!isEditing ? (
          <View style={styles.detailsCard}>
            <View style={styles.categoryRow}>
              <CategoryBadge category={currentRecord.category} size="medium" />
              <Text style={styles.sizePill}>Storage: {fileSize}</Text>
            </View>

            <Text style={[Typography.h2, styles.viewTitle]}>{currentRecord.title}</Text>

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>NOTES & DETAILS</Text>
            {currentRecord.notes.trim().length > 0 ? (
              <Text style={[Typography.body, styles.notesBody]}>{currentRecord.notes}</Text>
            ) : (
              <Text style={styles.emptyNotesBody}>No description provided for this capture.</Text>
            )}

            <View style={styles.divider} />

            <View style={styles.metaSection}>
              <Text style={styles.metaHeader}>RECORD DETAILS</Text>
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={13} color={Colors.primary} />
                <Text style={styles.metaKey}>Created:</Text>
                <Text style={styles.metaValue}>{createdDate}</Text>
              </View>
              {currentRecord.updatedAt !== currentRecord.createdAt && (
                <View style={styles.metaRow}>
                  <Ionicons name="sync-outline" size={13} color={Colors.primary} />
                  <Text style={styles.metaKey}>Updated:</Text>
                  <Text style={styles.metaValue}>{updatedDate}</Text>
                </View>
              )}
              <View style={styles.metaRow}>
                <Ionicons name="folder-outline" size={13} color={Colors.primary} />
                <Text style={styles.metaKey}>Filename:</Text>
                <Text style={styles.metaValue} numberOfLines={1}>
                  {currentRecord.imageFileName}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.editCard}>
            <Text style={styles.editModeHeader}>Edit Capture Note</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>TITLE *</Text>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Title is required"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CATEGORY</Text>
              <View style={styles.categoryPicker}>
                {CATEGORIES.map(cat => {
                  const isSelected = category === cat;
                  const config = Colors.categories[cat];

                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catChoice,
                        isSelected
                          ? [styles.catSelected, { borderColor: config.color, backgroundColor: config.background }]
                          : styles.catUnselected,
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Ionicons
                        name={config.icon}
                        size={15}
                        color={isSelected ? config.color : Colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.catChoiceText,
                          isSelected
                            ? { color: config.color, fontWeight: '800' }
                            : { color: Colors.textSecondary },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>NOTES & DETAILS</Text>
              <TextInput
                style={[styles.textInput, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Description or notes content..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={isFullScreenImage}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setIsFullScreenImage(false)}
      >
        <SafeAreaView style={styles.fullScreenContainer}>
          <StatusBar style="light" />
          <View style={[styles.fullScreenTopBar, { paddingTop: topInset + Spacing.sm }]}>
            <Text style={styles.fullScreenTitle} numberOfLines={1}>
              {currentRecord.title}
            </Text>
            <TouchableOpacity
              style={styles.fullScreenCloseBtn}
              onPress={() => setIsFullScreenImage(false)}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.fullScreenImageWrap}>
            <Image
              source={{ uri: currentRecord.imageUri }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </View>
        </SafeAreaView>
      </Modal>

      <ConfirmDialog
        visible={showDeleteModal}
        title="Delete Record & File?"
        message="This will permanently delete this note and remove the saved image from your storage."
        confirmText="Confirm Delete"
        cancelText="Keep Note"
        isDestructive
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
    backgroundColor: Colors.surface,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editTopBtn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  deleteTopBtn: {
    borderColor: Colors.dangerMuted,
  },
  cancelTextBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  cancelText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
  },
  saveBtnDisabled: {
    opacity: 0.45,
  },
  saveBtnText: {
    color: Colors.textOnYellow,
    fontWeight: '800',
    fontSize: 13,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl,
  },
  imageCard: {
    width: '100%',
    height: 280,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    ...Shadows.md,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  fallbackText: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  expandPill: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(9, 9, 11, 0.85)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  expandText: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: Spacing.lg,
    marginTop: Spacing.base,
    ...Shadows.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sizePill: {
    fontSize: 11,
    color: Colors.primary,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.round,
    fontWeight: '700',
  },
  viewTitle: {
    color: Colors.textPrimary,
    fontWeight: '800',
    marginBottom: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceBorder,
    marginVertical: Spacing.md,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  notesBody: {
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  emptyNotesBody: {
    color: Colors.textMuted,
    fontStyle: 'italic',
    fontSize: 13,
  },
  metaSection: {
    backgroundColor: Colors.surfaceElevated,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 6,
  },
  metaHeader: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaKey: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
  },
  editCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: Spacing.lg,
    marginTop: Spacing.base,
    ...Shadows.sm,
  },
  editModeHeader: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: '800',
    marginBottom: Spacing.base,
  },
  inputGroup: {
    marginBottom: Spacing.base,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: BorderRadius.md,
    color: Colors.textPrimary,
    fontSize: 14,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  notesInput: {
    height: 110,
    paddingTop: 10,
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 6,
  },
  catUnselected: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.surfaceBorder,
  },
  catSelected: {},
  catChoiceText: {
    fontSize: 12,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullScreenTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  fullScreenTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: Spacing.md,
  },
  fullScreenCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenImageWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.8,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  notFoundText: {
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.md,
  },
  backButtonText: {
    color: Colors.textOnYellow,
    fontWeight: '800',
  },
});
