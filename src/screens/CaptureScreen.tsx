import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Category, CATEGORIES } from '../types';
import { useRecords } from '../state/RecordsContext';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, BorderRadius, Shadows } from '../theme/spacing';
import { ImagePickerService } from '../services/ImagePickerService';
import { LoadingOverlay } from '../components/common/LoadingOverlay';

interface CaptureScreenProps {
  initialImageUri: string;
  onSaved: () => void;
  onCancel: () => void;
}

export const CaptureScreen: React.FC<CaptureScreenProps> = ({
  initialImageUri,
  onSaved,
  onCancel,
}) => {
  const { createRecord, isActionLoading } = useRecords();

  const [imageUri, setImageUri] = useState<string>(initialImageUri);
  const [title, setTitle] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [category, setCategory] = useState<Category>('Work');
  const [titleError, setTitleError] = useState<string | null>(null);

  const handleRetakeCamera = async () => {
    const uri = await ImagePickerService.capturePhoto();
    if (uri) setImageUri(uri);
  };

  const handlePickGallery = async () => {
    const uri = await ImagePickerService.pickFromGallery();
    if (uri) setImageUri(uri);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }
    setTitleError(null);

    const saved = await createRecord(title, notes, category, imageUri);
    if (saved) {
      onSaved();
    }
  };

  const insets = useSafeAreaInsets();

  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (RNStatusBar.currentHeight || 28) : 0
  );
  const bottomInset = insets.bottom;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <LoadingOverlay visible={isActionLoading} message="Optimizing & saving to storage..." />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.topBar, { paddingTop: topInset + Spacing.sm }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onCancel}
            accessibilityLabel="Cancel note creation"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[Typography.h3, styles.screenTitle]}>New Capture</Text>
          <TouchableOpacity
            style={[styles.saveTopBtn, !title.trim() && styles.saveTopBtnDisabled]}
            onPress={handleSave}
            disabled={isActionLoading || !title.trim()}
            accessibilityRole="button"
            accessibilityLabel="Save note"
          >
            <Text style={styles.saveTopBtnText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(bottomInset + Spacing.xl, Spacing.xxxl) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          <View style={styles.previewContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
            <View style={styles.imageOverlayControls}>
              <TouchableOpacity
                style={styles.retakeBtn}
                onPress={handleRetakeCamera}
                accessibilityLabel="Retake photo"
              >
                <Ionicons name="camera-reverse-outline" size={15} color={Colors.primary} />
                <Text style={styles.retakeBtnText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.retakeBtn}
                onPress={handlePickGallery}
                accessibilityLabel="Replace with image from gallery"
              >
                <Ionicons name="image-outline" size={15} color={Colors.primary} />
                <Text style={styles.retakeBtnText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formCard}>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>NOTE TITLE</Text>
                <Text style={styles.requiredMark}>*Required</Text>
              </View>
              <TextInput
                style={[styles.textInput, titleError ? styles.inputError : null]}
                placeholder="e.g., Match Ticket, Bill, Whiteboard Sketch..."
                placeholderTextColor={Colors.textMuted}
                value={title}
                onChangeText={text => {
                  setTitle(text);
                  if (titleError) setTitleError(null);
                }}
                maxLength={100}
                autoFocus
              />
              {titleError && <Text style={styles.errorText}>{titleError}</Text>}
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
                        styles.categoryChoice,
                        isSelected
                          ? [styles.categorySelected, { borderColor: config.color, backgroundColor: config.background }]
                          : styles.categoryUnselected,
                      ]}
                      onPress={() => setCategory(cat)}
                      activeOpacity={0.7}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                    >
                      <Ionicons
                        name={config.icon}
                        size={15}
                        color={isSelected ? config.color : Colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.categoryChoiceText,
                          isSelected
                            ? { color: config.color, fontWeight: '800' }
                            : { color: Colors.textSecondary },
                        ]}
                      >
                        {cat}
                      </Text>
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={14}
                          color={config.color}
                          style={styles.checkIcon}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>NOTES & DETAILS</Text>
                <Text style={styles.optionalMark}>Optional</Text>
              </View>
              <TextInput
                style={[styles.textInput, styles.notesInput]}
                placeholder="Add amounts, memo, action items or description..."
                placeholderTextColor={Colors.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primarySaveButton, !title.trim() && styles.primarySaveDisabled]}
            onPress={handleSave}
            disabled={isActionLoading || !title.trim()}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Ionicons name="checkmark-circle-outline" size={20} color={Colors.textOnYellow} />
            <Text style={styles.primarySaveButtonText}>SAVE NOTE</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoid: {
    flex: 1,
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
  backButton: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  screenTitle: {
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  saveTopBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
  },
  saveTopBtnDisabled: {
    opacity: 0.45,
  },
  saveTopBtnText: {
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
  previewContainer: {
    width: '100%',
    height: 220,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    ...Shadows.md,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageOverlayControls: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(9, 9, 11, 0.9)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  retakeBtnText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: Spacing.base,
    marginTop: Spacing.base,
    ...Shadows.sm,
  },
  inputGroup: {
    marginBottom: Spacing.base,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.6,
  },
  requiredMark: {
    fontSize: 11,
    color: Colors.danger,
    fontWeight: '600',
  },
  optionalMark: {
    fontSize: 11,
    color: Colors.textMuted,
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
  inputError: {
    borderColor: Colors.danger,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  notesInput: {
    height: 96,
    paddingTop: 10,
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  categoryChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 6,
  },
  categoryUnselected: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.surfaceBorder,
  },
  categorySelected: {},
  categoryChoiceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: 2,
  },
  primarySaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
    ...Shadows.glowYellow,
  },
  primarySaveDisabled: {
    opacity: 0.45,
  },
  primarySaveButtonText: {
    color: Colors.textOnYellow,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
