import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { BorderRadius, Shadows } from '../../theme/spacing';

interface BrandLogoProps {
  size?: 'small' | 'medium' | 'large' | 'xl';
  showBadgeBorder?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'medium',
  showBadgeBorder = true,
}) => {
  const dimensions = {
    small: { box: 32, font: 14, icon: 10, radius: BorderRadius.sm },
    medium: { box: 38, font: 16, icon: 12, radius: BorderRadius.md },
    large: { box: 52, font: 22, icon: 16, radius: BorderRadius.lg },
    xl: { box: 76, font: 32, icon: 22, radius: BorderRadius.xl },
  }[size];

  return (
    <View
      style={[
        styles.container,
        {
          width: dimensions.box,
          height: dimensions.box,
          borderRadius: dimensions.radius,
          borderWidth: showBadgeBorder ? 1.5 : 0,
        },
      ]}
      accessibilityRole="image"
      accessibilityLabel="Smart Capture SC Logo"
    >

      <View style={styles.monogramRow}>
        <Text style={[styles.letterS, { fontSize: dimensions.font }]}>S</Text>
        <Ionicons
          name="flash"
          size={dimensions.icon}
          color={Colors.primary}
          style={styles.lightning}
        />
        <Text style={[styles.letterC, { fontSize: dimensions.font }]}>C</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#09090B',
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Shadows.glowYellow,
  },
  monogramRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterS: {
    color: Colors.primary,
    fontWeight: '900',
    letterSpacing: -1,
    fontStyle: 'italic',
  },
  lightning: {
    marginHorizontal: -2,
    marginTop: -2,
  },
  letterC: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: -1,
    fontStyle: 'italic',
  },
});
