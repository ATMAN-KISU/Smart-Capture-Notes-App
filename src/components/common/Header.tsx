import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { ViewMode } from '../../types';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showViewToggle?: boolean;
  viewMode?: ViewMode;
  onToggleViewMode?: () => void;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    accessibilityLabel: string;
  };
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showViewToggle = false,
  viewMode = 'list',
  onToggleViewMode,
  rightAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>

        <BrandLogo size="medium" />

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={[Typography.h2, styles.title]}>{title}</Text>
            <View style={styles.cskBadge}>
              <Text style={styles.cskBadgeText}>CSK ED.</Text>
            </View>
          </View>
          {subtitle && <Text style={[Typography.caption, styles.subtitle]}>{subtitle}</Text>}
        </View>
      </View>

      <View style={styles.actionsContainer}>
        {showViewToggle && onToggleViewMode && (
          <TouchableOpacity
            style={[
              styles.iconButton,
              viewMode === 'grid' && styles.iconButtonActive,
            ]}
            onPress={onToggleViewMode}
            activeOpacity={0.75}
            accessibilityLabel={`Switch to ${viewMode === 'list' ? 'grid' : 'list'} view`}
            accessibilityRole="button"
          >
            <Ionicons
              name={viewMode === 'list' ? 'grid-outline' : 'list-outline'}
              size={18}
              color={viewMode === 'grid' ? Colors.textOnYellow : Colors.primary}
            />
          </TouchableOpacity>
        )}

        {rightAction && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={rightAction.onPress}
            activeOpacity={0.75}
            accessibilityLabel={rightAction.accessibilityLabel}
            accessibilityRole="button"
          >
            <Ionicons name={rightAction.icon} size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  cskBadge: {
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
  },
  cskBadgeText: {
    color: Colors.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: Colors.textSecondary,
    marginTop: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
});
