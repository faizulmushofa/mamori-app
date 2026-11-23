import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { colors, spacing, radii, typography, shadows } from '../../lib/tokens';
import { MOCK_INCIDENTS } from '../../lib/mockIncidents';
import {
  CATEGORY_METADATA,
  SEVERITY_METADATA,
  STATUS_METADATA,
} from '../../lib/types';
import { StatusTimeline } from '../../components/feed/StatusTimeline';

/**
 * Layar Detail Insiden Komprehensif (Pertemuan 11 & PRD F-30 s/d F-34)
 */
export default function IncidentDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const incident =
    MOCK_INCIDENTS.find((item) => item.id === id) || MOCK_INCIDENTS[0];

  const [confirmations, setConfirmations] = useState(incident.confirmationsCount);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const categoryMeta = CATEGORY_METADATA[incident.category];
  const severityMeta = SEVERITY_METADATA[incident.severity];
  const statusMeta = STATUS_METADATA[incident.status];

  const handleConfirmStillThere = () => {
    if (hasConfirmed) {
      Alert.alert('Info', 'Anda sudah mengonfirmasi masalah ini.');
      return;
    }
    setConfirmations((prev) => prev + 1);
    setHasConfirmed(true);
    Alert.alert(
      '👍 Konfirmasi Terkirim!',
      'Terima kasih! Konfirmasi Anda tervalidasi via GPS dan menambah prioritas penanganan (PRD F-20).'
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Kembali</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Laporan #{incident.id}
        </Text>
        <View style={styles.dummyRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.badgesRow}>
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
              Keparahan: {severityMeta.label}
            </Text>
          </View>

          <View
            style={[
              styles.badge,
              { backgroundColor: statusMeta.bgColor, borderColor: statusMeta.color },
            ]}
          >
            <Text style={[styles.badgeText, { color: statusMeta.color }]}>
              {statusMeta.label.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.incidentTitle}>{incident.title}</Text>
        <Text style={styles.incidentDesc}>{incident.description}</Text>

        {incident.evacuationBarrier && (
          <View style={styles.evacCard}>
            <Text style={styles.evacIcon}>⚠️</Text>
            <View style={styles.evacTextGroup}>
              <Text style={styles.evacTitle}>
                Hambatan Jalur Evakuasi Bencana Terdeteksi
              </Text>
              <Text style={styles.evacDesc}>
                Laporan ini memblokir rute evakuasi darurat, diprioritaskan bagi tim K3 (PRD F-05).
              </Text>
            </View>
          </View>
        )}

        <View style={styles.photoSection}>
          <Text style={styles.sectionHeading}>Bukti Foto (Sebelum & Sesudah)</Text>
          <View style={styles.photoCompareRow}>
            <View style={styles.photoBox}>
              <View style={styles.photoMock}>
                <Text style={styles.photoEmoji}>📸</Text>
                <Text style={styles.photoMockLabel}>Foto Laporan Awal</Text>
                <Text style={styles.photoWatermarkMini}>
                  WM: {incident.coordinates.latitude.toFixed(4)},{' '}
                  {incident.coordinates.longitude.toFixed(4)}
                </Text>
              </View>
              <Text style={styles.photoTag}>Kondisi Sebelum</Text>
            </View>

            <View style={styles.photoBox}>
              <View
                style={[
                  styles.photoMock,
                  incident.status === 'selesai' && { backgroundColor: '#ECFDF5' },
                ]}
              >
                <Text style={styles.photoEmoji}>
                  {incident.status === 'selesai' ? '✨' : '⏳'}
                </Text>
                <Text style={styles.photoMockLabel}>
                  {incident.status === 'selesai'
                    ? 'Bukti Perbaikan Sarpras'
                    : 'Menunggu Perbaikan'}
                </Text>
              </View>
              <Text style={styles.photoTag}>
                {incident.status === 'selesai' ? 'Kondisi Sesudah' : 'Progres'}
              </Text>
            </View>
          </View>
        </View>

        <StatusTimeline
          currentStatus={incident.status}
          unresponsiveDays={incident.unresponsiveDays}
        />

        <View style={styles.communityActionCard}>
          <View style={styles.commActionHeader}>
            <Text style={styles.commTitle}>Validasi Komunitas</Text>
            <Text style={styles.commCount}>{confirmations} Warga Mengonfirmasi</Text>
          </View>
          <Text style={styles.commDesc}>
            Apakah masalah ini masih ada di lokasi saat Anda melintas?
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.confirmBtn,
              hasConfirmed && styles.confirmBtnActive,
              pressed && styles.btnPressed,
            ]}
            onPress={handleConfirmStillThere}
          >
            <Text style={styles.confirmBtnText}>
              {hasConfirmed
                ? '✓ Telah Anda Konfirmasi Masih Ada'
                : '👍 Masih Ada di Sini (1-Tap Konfirmasi)'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.sm,
  },
  backBtn: {
    paddingVertical: 4,
  },
  backBtnText: {
    color: colors.primary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  headerTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
    maxWidth: 200,
  },
  dummyRight: {
    width: 60,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
    gap: spacing.lg,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
  },
  incidentTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
    lineHeight: 28,
  },
  incidentDesc: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    lineHeight: 22,
  },
  evacCard: {
    flexDirection: 'row',
    backgroundColor: colors.dangerLight,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    gap: spacing.sm,
  },
  evacIcon: {
    fontSize: 20,
  },
  evacTextGroup: {
    flex: 1,
  },
  evacTitle: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.danger,
  },
  evacDesc: {
    fontSize: 10,
    color: colors.textMain,
    marginTop: 2,
    lineHeight: 14,
  },
  photoSection: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeading: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
    marginBottom: spacing.sm,
  },
  photoCompareRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  photoBox: {
    flex: 1,
    alignItems: 'center',
  },
  photoMock: {
    width: '100%',
    height: 110,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xs,
  },
  photoEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  photoMockLabel: {
    fontSize: 10,
    color: colors.textMain,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
  },
  photoWatermarkMini: {
    fontSize: 8,
    color: colors.textMuted,
    marginTop: 2,
  },
  photoTag: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
    fontWeight: typography.weight.medium,
  },
  communityActionCard: {
    backgroundColor: colors.primaryLight,
    padding: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  commActionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  commTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  commCount: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: colors.primary,
  },
  commDesc: {
    fontSize: typography.size.xs,
    color: colors.textMain,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  confirmBtnActive: {
    backgroundColor: colors.success,
  },
  confirmBtnText: {
    color: colors.textInverse,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.sm,
  },
  btnPressed: {
    opacity: 0.85,
  },
});
