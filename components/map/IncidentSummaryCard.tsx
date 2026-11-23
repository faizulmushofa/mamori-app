import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, radii, typography, shadows } from '../../constants/tokens';
import {
  CATEGORY_METADATA,
  SEVERITY_METADATA,
  STATUS_METADATA,
  type IncidentItem,
} from '../../types/incident';
import { formatDistance } from '../../lib/actions/geo.actions';
import type { Coordinates } from '../../lib/types/geo.types';

interface IncidentSummaryCardProps {
  incident: IncidentItem;
  userCoords: Coordinates | null;
  haversineDistance: number | null;
  onViewDetails?: (incident: IncidentItem) => void;
  onCheckDuplicate?: (incident: IncidentItem) => void;
  onClose?: () => void;
}

/**
 * Bottom Sheet / Floating Card Insiden Terpilih (Pertemuan 9 & PRD F-10)
 */
export const IncidentSummaryCard: React.FC<IncidentSummaryCardProps> = ({
  incident,
  haversineDistance,
  onViewDetails,
  onCheckDuplicate,
  onClose,
}) => {
  const categoryMeta = CATEGORY_METADATA[incident.category];
  const severityMeta = SEVERITY_METADATA[incident.severity];
  const statusMeta = STATUS_METADATA[incident.status];

  const isNearbyWithin25m = haversineDistance != null && haversineDistance <= 25;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.tagsGroup}>
          <View
            style={[
              styles.badge,
              { backgroundColor: categoryMeta.bgColor, borderColor: categoryMeta.color },
            ]}
          >
            <Text style={[styles.badgeText, { color: categoryMeta.color }]}>
              {categoryMeta.label}
            </Text>
          </View>

          <View
            style={[
              styles.badge,
              { backgroundColor: severityMeta.bgColor, borderColor: severityMeta.color },
            ]}
          >
            <Text style={[styles.badgeText, { color: severityMeta.color }]}>
              {severityMeta.label}
            </Text>
          </View>
        </View>

        {onClose && (
          <Pressable
            hitSlop={8}
            onPress={onClose}
            style={({ pressed }) => [styles.closeBtn, pressed && styles.btnPressed]}
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {incident.title}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {incident.description}
      </Text>

      {incident.evacuationBarrier && (
        <View style={styles.evacWarningRow}>
          <Text style={styles.evacWarningIcon}>⚠️</Text>
          <Text style={styles.evacWarningText}>
            Menghalangi Jalur Evakuasi Kampus (Prioritas K3)
          </Text>
        </View>
      )}

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Jarak dari Anda</Text>
          <View style={styles.distanceRow}>
            <Text
              style={[
                styles.statValue,
                isNearbyWithin25m && styles.statValueAlert,
              ]}
            >
              {formatDistance(haversineDistance)}
            </Text>
            {isNearbyWithin25m && (
              <View style={styles.radiusPill}>
                <Text style={styles.radiusPillText}>≤ 25m</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Status Publik</Text>
          <Text style={[styles.statValue, { color: statusMeta.color }]}>
            {statusMeta.label}
          </Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Konfirmasi</Text>
          <Text style={styles.statValue}>{incident.confirmationsCount} warga</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        {onCheckDuplicate && (
          <Pressable
            style={({ pressed }) => [
              styles.duplicateBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={() => onCheckDuplicate(incident)}
          >
            <Text style={styles.duplicateBtnText}>🔍 Uji Radius 25m</Text>
          </Pressable>
        )}

        {onViewDetails && (
          <Pressable
            style={({ pressed }) => [
              styles.detailsBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={() => onViewDetails(incident)}
          >
            <Text style={styles.detailsBtnText}>Lihat Detail →</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  tagsGroup: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    fontWeight: typography.weight.bold,
  },
  title: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
    marginTop: spacing.xs,
  },
  description: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 18,
  },
  evacWarningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  evacWarningIcon: {
    fontSize: 14,
  },
  evacWarningText: {
    fontSize: typography.size.xs,
    color: colors.danger,
    fontWeight: typography.weight.semibold,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginTop: spacing.md,
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 2,
  },
  statValue: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  statValueAlert: {
    color: colors.danger,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  radiusPill: {
    backgroundColor: colors.danger,
    paddingHorizontal: 4,
    borderRadius: radii.xs,
  },
  radiusPillText: {
    color: colors.textInverse,
    fontSize: 9,
    fontWeight: typography.weight.bold,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  duplicateBtn: {
    flex: 1,
    backgroundColor: colors.warningLight,
    borderColor: colors.warning,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  duplicateBtnText: {
    color: colors.warning,
    fontWeight: typography.weight.semibold,
    fontSize: typography.size.sm,
  },
  detailsBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  detailsBtnText: {
    color: colors.textInverse,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.sm,
  },
  btnPressed: {
    opacity: 0.8,
  },
});
