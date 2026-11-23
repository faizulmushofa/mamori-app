import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useLocationTracking } from '../../hooks/useLocationTracking';
import { colors, spacing, radii, typography, shadows } from '../../lib/tokens';
import { MOCK_INCIDENTS, CAMPUS_CENTER } from '../../lib/mockIncidents';
import { type IncidentItem } from '../../lib/types';
import { calculateHaversineDistance } from '../../lib/haversine';
import { MapViewLBS } from '../../components/map/MapViewLBS';
import { IncidentSummaryCard } from '../../components/map/IncidentSummaryCard';
import { DuplicateDetectionModal } from '../../components/map/DuplicateDetectionModal';

/**
 * Layar Tab 1: Peta Interaktif & LBS (Pertemuan 9 & PRD F-10, F-11, F-12)
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

  const handleMergeDuplicate = (existingId: string) => {
    setDuplicateModalVisible(false);
    Alert.alert(
      '✓ Berhasil Menggabungkan!',
      `Bukti laporan Anda telah ditambahkan ke laporan #${existingId} (PRD F-12).`
    );
  };

  const handleCreateNewReport = () => {
    setDuplicateModalVisible(false);
    router.push('/(tabs)/report');
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusBanner}>
          <View style={styles.bannerIconBox}>
            <Text style={styles.bannerIcon}>🛡️</Text>
          </View>
          <View style={styles.bannerTextBox}>
            <Text style={styles.bannerTitle}>Kesiapsiagaan & LBS Kampus</Text>
            <Text style={styles.bannerSubtitle}>
              Pertemuan 9 • Komputasi Haversine & Deteksi Duplikat 25m
            </Text>
          </View>
        </View>

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

        <View style={styles.haversineExplainerCard}>
          <View style={styles.rowAlign}>
            <Text style={styles.explainerIcon}>📐</Text>
            <Text style={styles.explainerTitle}>
              Komputasi Spasial Sisi Klien (Haversine)
            </Text>
          </View>
          <Text style={styles.explainerBody}>
            Jarak dihitung real-time dari koordinat GPS Anda. Jika laporan baru
            berada dalam radius <Text style={styles.boldText}>≤ 25 meter</Text>,
            sistem mendeteksi kandidat duplikat (PRD F-11).
          </Text>
        </View>

        {selectedIncident && (
          <View style={styles.selectedContainer}>
            <Text style={styles.selectedHeading}>Insiden Dipilih di Peta:</Text>
            <IncidentSummaryCard
              incident={selectedIncident}
              userCoords={effectiveCoords}
              haversineDistance={selectedDistance}
              onCheckDuplicate={handleCheckDuplicate}
              onViewDetails={(inc) => router.push(`/incident/${inc.id}` as any)}
              onClose={() => setSelectedIncident(null)}
            />
          </View>
        )}

        <View style={styles.quickActionBox}>
          <Pressable
            style={({ pressed }) => [
              styles.quickReportBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={() => router.push('/(tabs)/report')}
          >
            <Text style={styles.quickReportBtnText}>
              + Buat Laporan di Lokasi Ini (P10)
            </Text>
          </Pressable>
        </View>
      </ScrollView>

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
});
