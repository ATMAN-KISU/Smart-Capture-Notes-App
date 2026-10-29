import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../../types';
import { Colors } from '../../theme/colors';
import { BorderRadius } from '../../theme/spacing';

interface CategoryBadgeProps {
  category: Category;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'small',
  showIcon = true,
}) => {
  const catConfig = Colors.categories[category] || Colors.categories.Other;

  const isSmall = size === 'small';
  const isLarge = size === 'large';

  const iconSize = isSmall ? 10 : isLarge ? 15 : 12;
  const fontSize = isSmall ? 10 : isLarge ? 13 : 11;
  const paddingVertical = isSmall ? 2 : isLarge ? 6 : 4;
  const paddingHorizontal = isSmall ? 8 : isLarge ? 12 : 9;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: catConfig.background,
          borderColor: catConfig.border,
          paddingVertical,
          paddingHorizontal,
        },
      ]}
    >
      {showIcon && (
        <Ionicons
          name={catConfig.icon}
          size={iconSize}
          color={catConfig.color}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: catConfig.color,
            fontSize,
          },
        ]}
      >
        {category}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
