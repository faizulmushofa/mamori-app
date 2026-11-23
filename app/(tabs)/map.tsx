import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '../../constants/tokens';
import { useLocationTracking } from '../../hooks/useLocationTracking';
import { MapViewLBS } from '../../components/map/MapViewLBS';
import { IncidentSummaryCard } from '../../components/map/IncidentSummaryCard';
import { DuplicateDetectionModal } from '../../components/map/DuplicateDetectionModal';
import { MOCK_INCIDENTS } from '../../data/mockIncidents';
import type { IncidentItem } from '../../types/incident';
import {
  calculateHaversineDistance,
  isDuplicateCandidate,
} from '../../lib/actions/geo.actions';

/**
 * Tab 2: Peta LBS & Radius Insiden Kampus (Pertemuan 9, Sub-CPMK 7 & PRD F-10)
 */
export default function MapScreen() {
  const router = useRouter();
  const {
    coords,
    permissionGranted,
    isLoading: isLoadingGPS,
    errorMsg: gpsError,
    refresh,
  } = useLocationTracking();

  const [incidents, setIncidents] = useState<IncidentItem[]>(MOCK_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);

  // State untuk deteksi duplikat radius 25m
  const [duplicateModalVisible, setDuplicateModalVisible] = useState<boolean>(false);
  const [testedIncident, setTestedIncident] = useState<IncidentItem | null>(null);

  // Kalkulasi jarak instan ke insiden terpilih
  const selectedDistance = useMemo(() => {
    if (!coords || !selectedIncident) return null;
    return calculateHaversineDistance(
      { latitude: coords.latitude, longitude: coords.longitude },
      selectedIncident.coordinates
    );
  }, [coords, selectedIncident]);

  const handleSelectIncident = useCallback((incident: IncidentItem) => {
    setSelectedIncident((prev) => (prev?.id === incident.id ? null : incident));
  }, []);

  const handleCheckDuplicate = useCallback(
    (incident: IncidentItem) => {
      if (!coords) {
        Alert.alert(
          'Lokasi GPS Belum Tersedia',
          'Aktifkan GPS atau izinkan akses lokasi untuk menguji radius spasial 25 meter.'
        );
        return;
      }

      const userCoord = { latitude: coords.latitude, longitude: coords.longitude };
      const isDup = isDuplicateCandidate(userCoord, incident.coordinates, 25);

      setTestedIncident(incident);

      if (isDup) {
        setDuplicateModalVisible(true);
      } else {
        const dist = calculateHaversineDistance(userCoord, incident.coordinates);
        Alert.alert(
          'Bukan Duplikat Spasial',
          `Jarak Anda ke insiden ini adalah ${dist.toFixed(
            1
          )} meter (> 25 m). Laporan ini dianggap masalah baru di lokasi berbeda.`
        );
      }
    },
    [coords]
  );

  const handleMergeDuplicate = useCallback((incidentId: string) => {
    setDuplicateModalVisible(false);
    setIncidents((prev) =>
      prev.map((item) =>
        item.id === incidentId
          ? { ...item, confirmationsCount: item.confirmationsCount + 1 }
          : item
      )
    );
    Alert.alert(
      'Berhasil Bergabung',
      'Laporan Anda digabungkan sebagai bukti penguat. Tim Sarpras menerima prioritas penanganan lebih tinggi.'
    );
  }, []);

  const handleCreateNewReport = useCallback(() => {
    setDuplicateModalVisible(false);
    router.push('/(tabs)/report');
  }, [router]);

  return (
    <View style={styles.container}>
      {/* 1. Header Peta */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <Ionicons name="map" size={20} color={colors.primary} />
          <Text style={styles.headerTitle}>Peta Pantauan Kampus</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.refreshBtn, pressed && styles.btnPressed]}
          onPress={refresh}
        >
          <Ionicons name="locate-outline" size={18} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Interactive MapView */}
        <MapViewLBS
          userCoords={coords ? { latitude: coords.latitude, longitude: coords.longitude } : null}
          permissionGranted={permissionGranted}
          isLoadingGPS={isLoadingGPS}
          gpsError={gpsError}
          incidents={incidents}
          selectedIncident={selectedIncident}
          onSelectIncident={handleSelectIncident}
          onRefreshGPS={refresh}
        />

        {/* 3. Incident Summary Card jika ada insiden terpilih */}
        {selectedIncident ? (
          <View style={styles.cardContainer}>
            <IncidentSummaryCard
              incident={selectedIncident}
              userCoords={coords ? { latitude: coords.latitude, longitude: coords.longitude } : null}
              haversineDistance={selectedDistance}
              onCheckDuplicate={handleCheckDuplicate}
              onClose={() => setSelectedIncident(null)}
              onViewDetails={() => router.push('/(tabs)')}
            />
          </View>
        ) : (
          <View style={styles.instructionBox}>
            <Ionicons name="finger-print-outline" size={24} color={colors.primary} />
            <Text style={styles.instructionText}>
              Sentuh salah satu penanda pada peta untuk melihat detail insiden dan
              menguji kalkulasi jarak Haversine (radius 25 m).
            </Text>
          </View>
        )}
      </ScrollView>

      {/* 4. Modal Duplikat Spasial (PRD F-11 & F-12) */}
      <DuplicateDetectionModal
        visible={duplicateModalVisible}
        existingIncident={testedIncident}
        distanceMeters={
          coords && testedIncident
            ? calculateHaversineDistance(
                { latitude: coords.latitude, longitude: coords.longitude },
                testedIncident.coordinates
              )
            : null
        }
        onMerge={handleMergeDuplicate}
        onCreateNew={handleCreateNewReport}
        onCancel={() => setDuplicateModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 80,
    gap: spacing.md,
  },
  cardContainer: {
    marginTop: spacing.xs,
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  instructionText: {
    flex: 1,
    fontSize: typography.size.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
  btnPressed: {
    opacity: 0.8,
  },
});
