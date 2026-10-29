import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NoteRecord } from '../../types';
import { CategoryBadge } from './CategoryBadge';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';

interface RecordGridItemProps {
  record: NoteRecord;
  onPress: () => void;
}

export const RecordGridItem: React.FC<RecordGridItemProps> = ({ record, onPress }) => {
  const [imageError, setImageError] = useState(false);

  const formattedDate = new Date(record.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Note: ${record.title}, Category: ${record.category}`}
    >
      <View style={styles.imageContainer}>
        {record.imageUri && !imageError ? (
          <Image
            source={{ uri: record.imageUri }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.imageFallback}>
            <Ionicons name="image-outline" size={28} color={Colors.textMuted} />
          </View>
        )}

        <View style={styles.badgeOverlay}>
          <CategoryBadge category={record.category} size="small" showIcon={false} />
        </View>
      </View>

      <View style={styles.details}>
        <Text style={[Typography.captionBold, styles.title]} numberOfLines={1}>
          {record.title}
        </Text>
        <Text style={[Typography.small, styles.date]}>{formattedDate}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: Spacing.xs,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  imageContainer: {
    width: '100%',
    height: 125,
    backgroundColor: Colors.surfaceElevated,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeOverlay: {
    position: 'absolute',
    top: Spacing.xs,
    left: Spacing.xs,
  },
  details: {
    padding: Spacing.sm,
  },
  title: {
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: 2,
  },
  date: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '500',
  },
});
