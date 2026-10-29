import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NoteRecord } from '../../types';
import { CategoryBadge } from './CategoryBadge';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import { FileStorageService } from '../../services/FileStorageService';

interface RecordCardProps {
  record: NoteRecord;
  onPress: () => void;
  onDeletePress?: () => void;
}

export const RecordCard: React.FC<RecordCardProps> = ({
  record,
  onPress,
  onDeletePress,
}) => {
  const [imageError, setImageError] = useState(false);

  const formattedDate = new Date(record.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = new Date(record.createdAt).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  const formattedSize =
    record.imageSize > 0 ? FileStorageService.formatBytes(record.imageSize) : null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`Note: ${record.title}, Category: ${record.category}, Created on ${formattedDate}`}
    >
      <View style={styles.thumbnailContainer}>
        {record.imageUri && !imageError ? (
          <Image
            source={{ uri: record.imageUri }}
            style={styles.thumbnail}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.thumbnailFallback}>
            <Ionicons name="image-outline" size={24} color={Colors.textMuted} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <CategoryBadge category={record.category} size="small" />
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>

        <Text style={[Typography.bodyBold, styles.title]} numberOfLines={1}>
          {record.title}
        </Text>

        {record.notes.trim().length > 0 ? (
          <Text style={[Typography.caption, styles.notesSnippet]} numberOfLines={2}>
            {record.notes}
          </Text>
        ) : (
          <Text style={[Typography.caption, styles.emptyNotesSnippet]} numberOfLines={1}>
            No additional description
          </Text>
        )}

        <View style={styles.footerRow}>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={12} color={Colors.primary} />
            <Text style={styles.timeText}>{formattedTime}</Text>
            {formattedSize && (
              <>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.sizeText}>{formattedSize}</Text>
              </>
            )}
          </View>

          {onDeletePress && (
            <TouchableOpacity
              style={styles.deleteIconButton}
              onPress={e => {
                e.stopPropagation();
                onDeletePress();
              }}
              activeOpacity={0.7}
              accessibilityLabel={`Delete ${record.title}`}
              accessibilityRole="button"
            >
              <Ionicons name="trash-outline" size={15} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: Spacing.md,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  thumbnailContainer: {
    width: 82,
    height: 82,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceElevated,
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  title: {
    color: Colors.textPrimary,
    marginBottom: 2,
    fontWeight: '700',
  },
  notesSnippet: {
    color: Colors.textSecondary,
    marginBottom: 6,
    lineHeight: 16,
  },
  emptyNotesSnippet: {
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  dotSeparator: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  sizeText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  deleteIconButton: {
    padding: 3,
  },
});
