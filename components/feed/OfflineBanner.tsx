import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, radii, typography } from '../../lib/tokens';

interface OfflineBannerProps {
  isOffline: boolean;
  pendingQueueCount: number;
  onRetryConnection?: () => void;
}

/**
 * Banner Offline Fallback Reaktif (Pertemuan 11 & PRD §5.4, F-61)
 */
export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOffline,
  pendingQueueCount,
  onRetryConnection,
}) => {
  if (!isOffline) return null;

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <Text style={styles.icon}>📡</Text>
        <View style={styles.textGroup}>
          <Text style={styles.title}>Mode Offline Aktif</Text>
          <Text style={styles.desc}>
            Data dimuat dari cache lokal.{' '}
            {pendingQueueCount > 0
              ? `${pendingQueueCount} aksi tersimpan di antrean.`
              : 'Perubahan akan otomatis disinkronkan saat sinyal kembali.'}
          </Text>
        </View>
      </View>

      {onRetryConnection && (
        <Pressable
          style={({ pressed }) => [styles.retryBtn, pressed && styles.btnPressed]}
          onPress={onRetryConnection}
        >
          <Text style={styles.retryBtnText}>Sinkron</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#78350F',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  icon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  textGroup: {
    flex: 1,
  },
  title: {
    color: '#FEF3C7',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  desc: {
    color: '#FDE68A',
    fontSize: 10,
    marginTop: 1,
  },
  retryBtn: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  retryBtnText: {
    color: '#78350F',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  btnPressed: {
    opacity: 0.8,
  },
});
