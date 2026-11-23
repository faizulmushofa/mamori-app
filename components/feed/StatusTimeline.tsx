import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radii, typography } from '../../lib/tokens';
import {
  STATUS_METADATA,
  type IncidentStatus,
  type StatusTimelineEvent,
} from '../../lib/types';

interface StatusTimelineProps {
  currentStatus: IncidentStatus;
  events?: StatusTimelineEvent[];
  unresponsiveDays?: number;
}

/**
 * Komponen Timeline Status Publik (Pertemuan 11 & PRD F-30, F-31, F-33)
 */
export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  currentStatus,
  events,
  unresponsiveDays = 0,
}) => {
  const defaultSteps: Array<{ status: IncidentStatus; label: string; role: string }> =
    [
      { status: 'dilaporkan', label: '1. Dilaporkan', role: 'Pelapor (Komunitas)' },
      { status: 'terverifikasi', label: '2. Terverifikasi', role: 'Moderator / 3+ Warga' },
      { status: 'diteruskan', label: '3. Diteruskan', role: 'Admin Sistem Kampus' },
      { status: 'dikerjakan', label: '4. Dikerjakan', role: 'Unit Sarpras / K3' },
      { status: 'selesai', label: '5. Selesai', role: 'Verifikasi Hasil Selesai' },
    ];

  const currentOrder = STATUS_METADATA[currentStatus]?.stepOrder || 1;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Timeline Status Penanganan</Text>
        {unresponsiveDays > 0 && currentStatus !== 'selesai' && (
          <View style={styles.unresponsiveBadge}>
            <Text style={styles.unresponsiveText}>
              ⏱️ {unresponsiveDays} hari tanpa respons
            </Text>
          </View>
        )}
      </View>

      <View style={styles.timelineList}>
        {defaultSteps.map((step, index) => {
          const stepMeta = STATUS_METADATA[step.status];
          const isCompleted = stepMeta.stepOrder < currentOrder;
          const isCurrent = stepMeta.stepOrder === currentOrder;
          const isPending = stepMeta.stepOrder > currentOrder;

          return (
            <View key={step.status} style={styles.timelineRow}>
              <View style={styles.nodeColumn}>
                <View
                  style={[
                    styles.nodeCircle,
                    isCompleted && styles.nodeCompleted,
                    isCurrent && styles.nodeCurrent,
                    isPending && styles.nodePending,
                  ]}
                >
                  <Text style={styles.nodeIcon}>
                    {isCompleted ? '✓' : isCurrent ? '●' : '○'}
                  </Text>
                </View>

                {index < defaultSteps.length - 1 && (
                  <View
                    style={[
                      styles.connectorLine,
                      isCompleted && styles.lineCompleted,
                    ]}
                  />
                )}
              </View>

              <View style={styles.infoColumn}>
                <View style={styles.stepTitleRow}>
                  <Text
                    style={[
                      styles.stepLabel,
                      isCurrent && styles.stepLabelCurrent,
                      isPending && styles.stepLabelPending,
                    ]}
                  >
                    {step.label}
                  </Text>
                  {isCurrent && (
                    <View style={styles.currentPill}>
                      <Text style={styles.currentPillText}>Saat Ini</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.stepRole}>Ditangani oleh: {step.role}</Text>

                {isCurrent && (
                  <Text style={styles.stepTimestamp}>
                    Diproses aktif • Warga dapat memantau sampai tuntas (PRD §1).
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  unresponsiveBadge: {
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  unresponsiveText: {
    fontSize: 10,
    color: colors.warning,
    fontWeight: typography.weight.bold,
  },
  timelineList: {
    marginTop: spacing.xs,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  nodeColumn: {
    alignItems: 'center',
    width: 28,
  },
  nodeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  nodeCompleted: {
    backgroundColor: colors.success,
  },
  nodeCurrent: {
    backgroundColor: colors.primary,
  },
  nodePending: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  nodeIcon: {
    color: colors.textInverse,
    fontSize: 11,
    fontWeight: typography.weight.bold,
  },
  connectorLine: {
    width: 2,
    flex: 1,
    minHeight: 34,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  lineCompleted: {
    backgroundColor: colors.success,
  },
  infoColumn: {
    flex: 1,
    paddingLeft: spacing.md,
    paddingBottom: spacing.lg,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  stepLabelCurrent: {
    color: colors.primary,
  },
  stepLabelPending: {
    color: colors.textMuted,
    fontWeight: typography.weight.regular,
  },
  currentPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.xs,
  },
  currentPillText: {
    fontSize: 9,
    color: colors.primary,
    fontWeight: typography.weight.bold,
  },
  stepRole: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  stepTimestamp: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
