import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { colors, spacing, radii, typography, shadows } from '../../lib/constants/tokens';
import { CATEGORY_METADATA, type IncidentItem } from '../../lib/types/incident.types';
import { formatDistance } from '../../lib/actions/geo.actions';

interface DuplicateDetectionModalProps {
  visible: boolean;
  existingIncident: IncidentItem | null;
  distanceMeters: number;
  onMerge: (existingId: string) => void;
  onCreateNew: () => void;
  onCancel: () => void;
}

/**
 * Modal Deteksi Duplikat Radius 25m (PRD F-11, F-12)
 */
export const DuplicateDetectionModal: React.FC<DuplicateDetectionModalProps> = ({
  visible,
  existingIncident,
  distanceMeters,
  onMerge,
  onCreateNew,
  onCancel,
}) => {
  if (!existingIncident) return null;

  const categoryMeta = CATEGORY_METADATA[existingIncident.category];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.badgeWarning}>
              <Text style={styles.badgeWarningText}>Radius 25m Terdeteksi</Text>
            </View>
            <Text style={styles.title}>Kandidat Laporan Duplikat</Text>
            <Text style={styles.subtitle}>
              Sistem mendeteksi laporan aktif berjarak{' '}
              <Text style={styles.distanceHighlight}>
                {formatDistance(distanceMeters)}
              </Text>{' '}
              dari titik Anda dengan kategori serupa.
            </Text>
          </View>

          <ScrollView style={styles.scrollContent}>
            <View style={styles.existingCard}>
              <View style={styles.rowBetween}>
                <View
                  style={[
                    styles.categoryTag,
                    { backgroundColor: categoryMeta.bgColor },
                  ]}
                >
                  <Text
                    style={[styles.categoryTagText, { color: categoryMeta.color }]}
                  >
                    {categoryMeta.label}
                  </Text>
                </View>
                <Text style={styles.statusPill}>
                  Status: {existingIncident.status.toUpperCase()}
                </Text>
              </View>

              <Text style={styles.incidentTitle}>{existingIncident.title}</Text>
              <Text style={styles.incidentDesc} numberOfLines={3}>
                {existingIncident.description}
              </Text>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  👤 Dilaporkan oleh: {existingIncident.reporterName}
                </Text>
                <Text style={styles.metaText}>
                  👍 {existingIncident.confirmationsCount} Konfirmasi Warga
                </Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>💡 Mengapa disarankan bergabung?</Text>
              <Text style={styles.infoDesc}>
                Menggabungkan laporan menambah bukti dan bobot urgensi ke petugas
                sarpras/K3 tanpa mengotori peta dengan laporan ganda (PRD §2).
              </Text>
            </View>
          </ScrollView>

          <View style={styles.actionContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && styles.btnPressed,
              ]}
              onPress={() => onMerge(existingIncident.id)}
            >
              <Text style={styles.primaryBtnText}>
                ✓ Gabung Sebagai Bukti Tambahan
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && styles.btnPressed,
              ]}
              onPress={onCreateNew}
            >
              <Text style={styles.secondaryBtnText}>
                Tetap Buat Laporan Baru
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.cancelBtn,
                pressed && styles.btnPressed,
              ]}
              onPress={onCancel}
            >
              <Text style={styles.cancelBtnText}>Batal</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    width: '100%',
    maxHeight: '85%',
    padding: spacing.xl,
    ...shadows.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  badgeWarning: {
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  badgeWarningText: {
    color: colors.warning,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  distanceHighlight: {
    color: colors.danger,
    fontWeight: typography.weight.bold,
  },
  scrollContent: {
    marginVertical: spacing.sm,
  },
  existingCard: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  categoryTagText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  statusPill: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    fontWeight: typography.weight.medium,
  },
  incidentTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
    marginTop: spacing.xs,
  },
  incidentDesc: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  metaRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  infoBox: {
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: radii.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.primary,
    marginBottom: 2,
  },
  infoDesc: {
    fontSize: typography.size.xs,
    color: colors.textMain,
    lineHeight: 16,
  },
  actionContainer: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: colors.textInverse,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
  },
  secondaryBtn: {
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  secondaryBtnText: {
    color: colors.textMain,
    fontWeight: typography.weight.semibold,
    fontSize: typography.size.sm,
  },
  cancelBtn: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
  },
  btnPressed: {
    opacity: 0.8,
  },
});
