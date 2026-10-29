import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { Typography } from '../../theme/typography';

interface PermissionBannerProps {
  permissionType: 'Camera' | 'Photo Library';
  onRetry?: () => void;
}

export const PermissionBanner: React.FC<PermissionBannerProps> = ({
  permissionType,
  onRetry,
}) => {
  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  return (
    <View style={styles.banner}>
      <View style={styles.iconCircle}>
        <Ionicons name="lock-closed-outline" size={20} color={Colors.warning} />
      </View>
      <View style={styles.content}>
        <Text style={[Typography.captionBold, styles.title]}>
          {permissionType} Access Blocked
        </Text>
        <Text style={[Typography.small, styles.description]}>
          Permission is required to take or pick photos. Enable access in system settings to proceed.
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={openSettings}
            accessibilityRole="button"
          >
            <Ionicons name="settings-outline" size={14} color="#FFFFFF" />
            <Text style={styles.settingsButtonText}>Open Settings</Text>
          </TouchableOpacity>

          {onRetry && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={onRetry}
              accessibilityRole="button"
            >
              <Text style={styles.retryButtonText}>Check Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.warning,
    padding: Spacing.md,
    marginHorizontal: Spacing.base,
    marginVertical: Spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.warningMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  description: {
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.warning,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.sm,
  },
  settingsButtonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
  },
  retryButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
  },
  retryButtonText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
