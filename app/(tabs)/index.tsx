import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
} from 'react-native';
import { useLocationTracking } from '../../hooks/useLocationTracking';
import { colors, spacing, radii, typography, shadows } from '../../constants/tokens';
import { MOCK_INCIDENTS, CAMPUS_CENTER } from '../../data/mockIncidents';
import {
  CATEGORY_METADATA,
  SEVERITY_METADATA,
  STATUS_METADATA,
  type IncidentItem,
} from '../../types/incident';
import { calculateHaversineDistance, formatDistance } from '../../lib/actions/geo.actions';
import { MapViewLBS } from '../../components/map/MapViewLBS';
import { IncidentSummaryCard } from '../../components/map/IncidentSummaryCard';
import { DuplicateDetectionModal } from '../../components/map/DuplicateDetectionModal';

/**
 * Layar Tab 1: Peta Interaktif & LBS (Pertemuan 9 & PRD F-10, F-11, F-12)
 * Fokus: LBS, Komputasi Spasial Haversine, Visualisasi Radius 25m, Deteksi Duplikat.
 */
export default function MapScreen() {
  const { coords, isLoading, permissionGranted, errorMsg, refresh } =
    useLocationTracking({
      distanceInterval: 5,
      timeInterval: 4000,
    });

  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(
    MOCK_INCIDENTS[0]
  );
  const [duplicateModalVisible, setDuplicateModalVisible] = useState(false);
  const [duplicateTarget, setDuplicateTarget] = useState<IncidentItem | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailTarget, setDetailTarget] = useState<IncidentItem | null>(null);

  const effectiveCoords = useMemo(() => {
    return coords
      ? { latitude: coords.latitude, longitude: coords.longitude }
      : CAMPUS_CENTER;
  }, [coords]);

  const selectedDistance = useMemo(() => {
    if (!selectedIncident) return null;
    return calculateHaversineDistance(effectiveCoords, selectedIncident.coordinates);
  }, [effectiveCoords, selectedIncident]);

  const handleCheckDuplicate = (incident: IncidentItem) => {
    setDuplicateTarget(incident);
    setDuplicateModalVisible(true);
  };

  const handleViewDetail = (incident: IncidentItem) => {
    setDetailTarget(incident);
    setDetailModalVisible(true);
  };

  const handleMergeDuplicate = (existingId: string) => {
    setDuplicateModalVisible(false);
    Alert.alert(
      '✓ Berhasil Menggabungkan!',
      `Bukti laporan Anda telah ditambahkan ke laporan #${existingId}. Ini meningkatkan bobot prioritas ke pihak sarpras/K3 tanpa menduplikasi data di peta (PRD F-12).`
    );
  };

  const handleCreateNewReport = () => {
    setDuplicateModalVisible(false);
    Alert.alert(
      'Opsi Laporan Baru',
      'Koordinat GPS terkunci di lokasi ini. Form pembuatan laporan lengkap dengan foto watermark tersedia pada Pertemuan 10.'
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Status Kampus Siaga & Sub-CPMK 7 */}
        <View style={styles.statusBanner}>
          <View style={styles.bannerIconBox}>
            <Text style={styles.bannerIcon}>🛡️</Text>
          </View>
          <View style={styles.bannerTextBox}>
            <Text style={styles.bannerTitle}>Kesiapsiagaan & LBS Kampus</Text>
            <Text style={styles.bannerSubtitle}>
              Pertemuan 9 • Komputasi Haversine & Deteksi Duplikat 25m (Sub-CPMK 7)
            </Text>
          </View>
        </View>

        {/* Peta Interaktif & Marker LBS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Peta Insiden & Posisi Terkini</Text>
          <Text style={styles.badgeCount}>
            {MOCK_INCIDENTS.length} Titik Terpantau
          </Text>
        </View>

        <MapViewLBS
          userCoords={effectiveCoords}
          permissionGranted={permissionGranted}
          isLoadingGPS={isLoading}
          gpsError={errorMsg}
          incidents={MOCK_INCIDENTS}
          selectedIncident={selectedIncident}
          onSelectIncident={(inc) => setSelectedIncident(inc)}
          onRefreshGPS={refresh}
        />

        {/* Keterangan Jarak & Penjelasan Haversine */}
        <View style={styles.haversineExplainerCard}>
          <View style={styles.rowAlign}>
            <Text style={styles.explainerIcon}>📐</Text>
            <Text style={styles.explainerTitle}>
              Komputasi Spasial Sisi Klien (Haversine)
            </Text>
          </View>
          <Text style={styles.explainerBody}>
            Jarak setiap insiden dihitung real-time dari posisi GPS Anda. Jika
            laporan baru dibuat dalam radius <Text style={styles.boldText}>≤ 25 meter</Text>{' '}
            dengan kategori serupa, sistem otomatis mendeteksi kandidat duplikat
            (PRD F-11 & F-12).
          </Text>
        </View>

        {/* Floating Card Insiden Terpilih */}
        {selectedIncident && (
          <View style={styles.selectedContainer}>
            <Text style={styles.selectedHeading}>Insiden Dipilih di Peta:</Text>
            <IncidentSummaryCard
              incident={selectedIncident}
              userCoords={effectiveCoords}
              haversineDistance={selectedDistance}
              onCheckDuplicate={handleCheckDuplicate}
              onViewDetails={handleViewDetail}
              onClose={() => setSelectedIncident(null)}
            />
          </View>
        )}

        {/* Simulasi Tombol Lapor di Lokasi Ini */}
        <View style={styles.quickActionBox}>
          <Pressable
            style={({ pressed }) => [
              styles.quickReportBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={() =>
              Alert.alert(
                '📍 Lapor di Koordinat Ini',
                `Koordinat Anda: ${effectiveCoords.latitude.toFixed(5)}, ${effectiveCoords.longitude.toFixed(5)}.\n\nFormulir pelaporan 4 langkah lengkap dengan foto watermark kamera akan dibuka di Pertemuan 10 (feat/ui-pertemuan-10).`
              )
            }
          >
            <Text style={styles.quickReportBtnText}>
              + Buat Laporan di Lokasi Ini (P10)
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Modal Dialog Deteksi Duplikat 25m (PRD F-11 & F-12) */}
      <DuplicateDetectionModal
        visible={duplicateModalVisible}
        existingIncident={duplicateTarget}
        distanceMeters={
          duplicateTarget
            ? calculateHaversineDistance(effectiveCoords, duplicateTarget.coordinates)
            : 0
        }
        onMerge={handleMergeDuplicate}
        onCreateNew={handleCreateNewReport}
        onCancel={() => setDuplicateModalVisible(false)}
      />

      {/* Modal Detail Ringkas Insiden (Pertemuan 9) */}
      {detailTarget && (
        <Modal
          visible={detailModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setDetailModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.detailModalCard}>
              <View style={styles.detailHeaderRow}>
                <View
                  style={[
                    styles.catBadge,
                    {
                      backgroundColor:
                        CATEGORY_METADATA[detailTarget.category].bgColor,
                      borderColor:
                        CATEGORY_METADATA[detailTarget.category].color,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.catBadgeText,
                      { color: CATEGORY_METADATA[detailTarget.category].color },
                    ]}
                  >
                    {CATEGORY_METADATA[detailTarget.category].label}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setDetailModalVisible(false)}
                  style={styles.closeModalBtn}
                >
                  <Text style={styles.closeModalText}>✕</Text>
                </Pressable>
              </View>

              <Text style={styles.detailModalTitle}>{detailTarget.title}</Text>
              <Text style={styles.detailModalDesc}>
                {detailTarget.description}
              </Text>

              {detailTarget.evacuationBarrier && (
                <View style={styles.evacAlertBox}>
                  <Text style={styles.evacAlertText}>
                    🚨 Menghalangi Jalur Evakuasi Kampus (Prioritas K3)
                  </Text>
                </View>
              )}

              <View style={styles.detailMetaGrid}>
                <View style={styles.metaCell}>
                  <Text style={styles.metaCellLabel}>Tingkat Keparahan</Text>
                  <Text
                    style={[
                      styles.metaCellValue,
                      {
                        color:
                          SEVERITY_METADATA[detailTarget.severity].color,
                      },
                    ]}
                  >
                    {SEVERITY_METADATA[detailTarget.severity].label}
                  </Text>
                </View>

                <View style={styles.metaCell}>
                  <Text style={styles.metaCellLabel}>Status Penanganan</Text>
                  <Text
                    style={[
                      styles.metaCellValue,
                      {
                        color: STATUS_METADATA[detailTarget.status].color,
                      },
                    ]}
                  >
                    {STATUS_METADATA[detailTarget.status].label}
                  </Text>
                </View>

                <View style={styles.metaCell}>
                  <Text style={styles.metaCellLabel}>Jarak dari Anda</Text>
                  <Text style={styles.metaCellValue}>
                    {formatDistance(
                      calculateHaversineDistance(
                        effectiveCoords,
                        detailTarget.coordinates
                      )
                    )}
                  </Text>
                </View>

                <View style={styles.metaCell}>
                  <Text style={styles.metaCellLabel}>Validasi Komunitas</Text>
                  <Text style={styles.metaCellValue}>
                    {detailTarget.confirmationsCount} Konfirmasi
                  </Text>
                </View>
              </View>

              <Pressable
                style={styles.closeDetailBtn}
                onPress={() => setDetailModalVisible(false)}
              >
                <Text style={styles.closeDetailBtnText}>Tutup</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: spacing.lg,
  },
  bannerIconBox: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    ...shadows.sm,
  },
  bannerIcon: {
    fontSize: 20,
  },
  bannerTextBox: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  bannerSubtitle: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  badgeCount: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  haversineExplainerCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.md,
    ...shadows.sm,
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  explainerIcon: {
    fontSize: 16,
  },
  explainerTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  explainerBody: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: typography.weight.bold,
    color: colors.danger,
  },
  selectedContainer: {
    marginTop: spacing.lg,
  },
  selectedHeading: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  quickActionBox: {
    marginTop: spacing.xl,
  },
  quickReportBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
    alignItems: 'center',
    ...shadows.md,
  },
  quickReportBtnText: {
    color: colors.textInverse,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  detailModalCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    width: '100%',
    ...shadows.lg,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  catBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  catBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  closeModalBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModalText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: typography.weight.bold,
  },
  detailModalTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
    marginBottom: spacing.xs,
  },
  detailModalDesc: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  evacAlertBox: {
    backgroundColor: colors.dangerLight,
    padding: spacing.sm,
    borderRadius: radii.sm,
    marginBottom: spacing.md,
  },
  evacAlertText: {
    fontSize: typography.size.xs,
    color: colors.danger,
    fontWeight: typography.weight.bold,
  },
  detailMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    padding: spacing.sm,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  metaCell: {
    width: '48%',
  },
  metaCellLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  metaCellValue: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
    marginTop: 2,
  },
  closeDetailBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  closeDetailBtnText: {
    color: colors.textInverse,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.sm,
  },
});
