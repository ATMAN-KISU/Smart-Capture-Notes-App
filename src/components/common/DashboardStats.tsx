import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import { CATEGORIES, CategoryFilter } from '../../types';

interface DashboardStatsProps {
  stats: Record<string, number>;
  onSelectCategory?: (category: CategoryFilter) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, onSelectCategory }) => {
  const totalNotes = stats.All || 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.goldDot} />
          <Text style={styles.headerTitle}>CAPTURE VAULT</Text>
        </View>

        <View style={styles.totalPill}>
          <Ionicons name="documents-outline" size={13} color={Colors.textOnYellow} />
          <Text style={styles.totalPillText}>{totalNotes} Total</Text>
        </View>
      </View>

      <View style={styles.gridRow}>
        {CATEGORIES.map(category => {
          const config = Colors.categories[category];
          const count = stats[category] || 0;

          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.statCard,
                {
                  borderColor: count > 0 ? config.color : Colors.surfaceBorder,
                  backgroundColor: count > 0 ? config.background : Colors.surface,
                },
              ]}
              onPress={() => onSelectCategory && onSelectCategory(category)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${category}: ${count} notes`}
            >
              <Ionicons
                name={config.icon}
                size={14}
                color={count > 0 ? config.color : Colors.textMuted}
              />
              <Text
                style={[
                  styles.countText,
                  { color: count > 0 ? config.color : Colors.textSecondary },
                ]}
              >
                {count}
              </Text>
              <Text style={styles.categoryLabel} numberOfLines={1}>
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: Spacing.md,
    marginHorizontal: Spacing.base,
    marginVertical: Spacing.xs,
    ...Shadows.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  goldDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
  totalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
  },
  totalPillText: {
    color: Colors.textOnYellow,
    fontSize: 11,
    fontWeight: '800',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  statCard: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  countText: {
    fontSize: 14,
    fontWeight: '800',
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
