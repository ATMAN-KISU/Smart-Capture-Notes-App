import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import { Typography } from '../../theme/typography';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Saving capture...',
}) => {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[Typography.bodyBold, styles.message]}>{message}</Text>
          <Text style={[Typography.small, styles.subMessage]}>
            Optimizing file & writing to local storage
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    maxWidth: 300,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    ...Shadows.lg,
  },
  message: {
    color: Colors.textPrimary,
    marginTop: Spacing.base,
    textAlign: 'center',
    fontWeight: '700',
  },
  subMessage: {
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
