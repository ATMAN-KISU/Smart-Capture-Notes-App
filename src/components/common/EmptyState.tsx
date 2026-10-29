import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import { BrandLogo } from './BrandLogo';

interface EmptyStateProps {
  isFiltering?: boolean;
  onActionPress?: () => void;
  onClearFilters?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isFiltering = false,
  onActionPress,
  onClearFilters,
}) => {
  if (isFiltering) {
    return (
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Ionicons name="search-outline" size={30} color={Colors.primary} />
        </View>
        <Text style={[Typography.h3, styles.title]}>No Matches Found</Text>
        <Text style={[Typography.body, styles.description]}>
          Try adjusting your search query or reset your category filter.
        </Text>
        {onClearFilters && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onClearFilters}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <Ionicons name="refresh-outline" size={15} color={Colors.primary} />
            <Text style={styles.secondaryButtonText}>Reset All Filters</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <BrandLogo size="xl" />
      </View>
      <Text style={[Typography.h3, styles.title]}>Your Vault is Empty</Text>
      <Text style={[Typography.body, styles.description]}>
        Snap receipts, quick wireframes, office documents, or personal notes with secure local storage.
      </Text>
      {onActionPress && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onActionPress}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Ionicons name="camera" size={17} color={Colors.textOnYellow} />
          <Text style={styles.primaryButtonText}>Capture First Note</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
    marginTop: Spacing.md,
  },
  logoWrap: {
    marginBottom: Spacing.base,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  title: {
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    fontWeight: '800',
  },
  description: {
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
    marginBottom: Spacing.lg,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.round,
    ...Shadows.glowYellow,
  },
  primaryButtonText: {
    color: Colors.textOnYellow,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.md,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
});
