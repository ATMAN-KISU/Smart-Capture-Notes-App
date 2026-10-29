import React from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Category, CategoryFilter, CATEGORIES } from '../../types';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';

interface CategoryChipsProps {
  selectedCategory: CategoryFilter;
  onSelectCategory: (category: CategoryFilter) => void;
  categoryStats?: Record<string, number>;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryStats = {},
}) => {
  const options: CategoryFilter[] = ['All', ...CATEGORIES];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map(option => {
          const isSelected = selectedCategory === option;
          const count = categoryStats[option] ?? 0;

          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
              ]}
              onPress={() => onSelectCategory(option)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Filter by ${option}, ${count} notes`}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                ]}
              >
                {option}
              </Text>

              <View
                style={[
                  styles.badge,
                  isSelected ? styles.badgeSelected : styles.badgeUnselected,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    isSelected ? styles.badgeTextSelected : styles.badgeTextUnselected,
                  ]}
                >
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
  },
  chipUnselected: {
    backgroundColor: Colors.surface,
    borderColor: Colors.surfaceBorder,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
  chipTextUnselected: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: Colors.textOnYellow,
    fontWeight: '800',
  },
  badge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.round,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeUnselected: {
    backgroundColor: Colors.surfaceElevated,
  },
  badgeSelected: {
    backgroundColor: Colors.textOnYellow,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  badgeTextUnselected: {
    color: Colors.textSecondary,
  },
  badgeTextSelected: {
    color: Colors.primary,
  },
});
