import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
            <Ionicons name="close" size={18} color={colors.textMuted} />
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
          <Ionicons name="warning" size={16} color={colors.danger} />
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
            <Ionicons name="scan-outline" size={16} color={colors.primary} />
            <Text style={styles.duplicateBtnText}>Uji Radius 25m</Text>
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
            <Text style={styles.detailsBtnText}>Lihat Detail</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.textInverse} />
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
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tagsGroup: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.xs,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  closeBtn: {
    padding: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
  },
  title: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
    marginBottom: 4,
  },
  description: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  evacWarningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    padding: spacing.sm,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  evacWarningText: {
    color: colors.danger,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: typography.size.xs,
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
    backgroundColor: colors.dangerLight,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: radii.xs,
  },
  radiusPillText: {
    fontSize: 9,
    color: colors.danger,
    fontWeight: typography.weight.bold,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  duplicateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
    gap: spacing.xs,
  },
  duplicateBtnText: {
    color: colors.primary,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  detailsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    gap: spacing.xs,
  },
  detailsBtnText: {
    color: colors.textInverse,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  btnPressed: {
    opacity: 0.8,
  },
});
