import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, typography, shadows } from '../../constants/tokens';
import {
  CATEGORY_METADATA,
  STATUS_METADATA,
  type IncidentItem,
} from '../../types/incident';

interface DuplicateDetectionModalProps {
  visible: boolean;
  existingIncident: IncidentItem | null;
  distanceMeters: number | null;
  onMerge: (incidentId: string) => void;
  onCreateNew: () => void;
  onCancel: () => void;
}

/**
 * Modal Interaktif Pencegahan Duplikat Spasial (PRD F-11 & F-12)
 * Memverifikasi laporan baru dalam radius 25 meter dengan kategori serupa.
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
  const statusMeta = STATUS_METADATA[existingIncident.status];
  const roundedDistance = distanceMeters != null ? Math.round(distanceMeters) : 0;

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
              <Ionicons name="alert-circle" size={14} color={colors.warning} />
              <Text style={styles.badgeWarningText}>DETEKSI DUPLIKAT SPASIAL</Text>
            </View>
            <Text style={styles.title}>Laporan Serupa Ditemukan</Text>
            <Text style={styles.subtitle}>
              Ditemukan masalah sejenis berjarak hanya{' '}
              <Text style={styles.distanceHighlight}>{roundedDistance} meter</Text> dari
              posisi Anda.
            </Text>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.existingCard}>
              <View style={styles.rowBetween}>
                <View
                  style={[
                    styles.categoryTag,
                    { backgroundColor: categoryMeta.bgColor },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryTagText,
                      { color: categoryMeta.color },
                    ]}
                  >
                    {categoryMeta.label}
                  </Text>
                </View>
                <Text style={styles.statusPill}>{statusMeta.label}</Text>
              </View>

              <Text style={styles.incidentTitle}>{existingIncident.title}</Text>
              <Text style={styles.incidentDesc} numberOfLines={3}>
                {existingIncident.description}
              </Text>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  Pelapor: {existingIncident.reporterName}
                </Text>
                <Text style={styles.metaText}>
                  Dukungan: {existingIncident.confirmationsCount} warga
                </Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <View style={styles.infoTitleRow}>
                <Ionicons name="information-circle" size={16} color={colors.primary} />
                <Text style={styles.infoTitle}>Mengapa disarankan bergabung?</Text>
              </View>
              <Text style={styles.infoDesc}>
                Menggabungkan laporan Anda memperkuat bukti dan meningkatkan prioritas
                penanganan tim Sarpras tanpa membuat antrean ganda.
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
              <Ionicons name="checkmark-circle" size={18} color={colors.textInverse} />
              <Text style={styles.primaryBtnText}>
                Gabung Sebagai Bukti Tambahan
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && styles.btnPressed,
              ]}
              onPress={onCreateNew}
            >
              <Ionicons name="add-circle-outline" size={18} color={colors.textMain} />
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.warning,
    gap: 4,
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
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  infoTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.primary,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    gap: spacing.xs,
  },
  primaryBtnText: {
    color: colors.textInverse,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderDark,
    gap: spacing.xs,
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
