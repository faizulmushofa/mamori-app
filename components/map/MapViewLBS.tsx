import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, radii, typography, shadows } from '../../lib/constants/tokens';
import {
  CATEGORY_METADATA,
  SEVERITY_METADATA,
  type IncidentItem,
} from '../../lib/types/incident.types';
import {
  calculateHaversineDistance,
  formatDistance,
  isDuplicateCandidate,
} from '../../lib/actions/geo.actions';
import type { Coordinates } from '../../lib/types/geo.types';

interface MapViewLBSProps {
  userCoords: Coordinates | null;
  permissionGranted: boolean;
  isLoadingGPS: boolean;
  gpsError: string | null;
  incidents: IncidentItem[];
  selectedIncident: IncidentItem | null;
  onSelectIncident: (incident: IncidentItem) => void;
  onRefreshGPS: () => void;
}

/**
 * Komponen Peta Interaktif LBS Mamori (Pertemuan 9 & PRD F-10)
 */
export const MapViewLBS: React.FC<MapViewLBSProps> = ({
  userCoords,
  permissionGranted,
  isLoadingGPS,
  gpsError,
  incidents,
  selectedIncident,
  onSelectIncident,
  onRefreshGPS,
}) => {
  const [mapType, setMapType] = useState<'standard' | 'schematic'>('standard');

  const selectedDistance = useMemo(() => {
    if (!userCoords || !selectedIncident) return null;
    return calculateHaversineDistance(userCoords, selectedIncident.coordinates);
  }, [userCoords, selectedIncident]);

  return (
    <View style={styles.container}>
      <View style={styles.mapCanvas}>
        <View style={styles.gridBackground}>
          <Text style={styles.campusWatermark}>
            KAMPUS TERPADU MAMORI • SEKTOR 1
          </Text>

          {/* User Location Indicator */}
          {userCoords && (
            <View style={styles.userMarkerContainer}>
              <View style={styles.userPulseRing} />
              <View style={styles.userMarkerDot} />
              <View style={styles.userCallout}>
                <Text style={styles.userCalloutText}>📍 Posisi Anda</Text>
                <Text style={styles.coordsMini}>
                  {userCoords.latitude.toFixed(5)}, {userCoords.longitude.toFixed(5)}
                </Text>
              </View>
            </View>
          )}

          {/* Render 25m Circle Radius untuk Insiden Terpilih */}
          {selectedIncident && (
            <View style={styles.radius25mOverlay}>
              <View style={styles.radius25mCircle} />
              <Text style={styles.radiusLabel}>Radius Duplikat: 25 m</Text>
            </View>
          )}

          {/* Incident Pins */}
          <View style={styles.markersLayer}>
            {incidents.map((inc) => {
              const isSelected = selectedIncident?.id === inc.id;
              const catMeta = CATEGORY_METADATA[inc.category];
              const sevMeta = SEVERITY_METADATA[inc.severity];

              return (
                <Pressable
                  key={inc.id}
                  style={({ pressed }) => [
                    styles.pinContainer,
                    isSelected && styles.pinContainerSelected,
                    pressed && styles.pinPressed,
                  ]}
                  onPress={() => onSelectIncident(inc)}
                >
                  <View
                    style={[
                      styles.pinBubble,
                      { backgroundColor: catMeta.color },
                      isSelected && styles.pinBubbleSelected,
                    ]}
                  >
                    <Text style={styles.pinIcon}>
                      {inc.category === 'bencana'
                        ? '🚨'
                        : inc.category === 'drainase'
                        ? '🌊'
                        : inc.category === 'listrik'
                        ? '⚡'
                        : inc.category === 'pohon'
                        ? '🌳'
                        : '🔧'}
                    </Text>
                  </View>
                  <View style={[styles.pinTail, { borderTopColor: catMeta.color }]} />

                  <View
                    style={[
                      styles.miniSevBadge,
                      { backgroundColor: sevMeta.bgColor, borderColor: sevMeta.color },
                    ]}
                  >
                    <Text
                      style={[styles.miniSevText, { color: sevMeta.color }]}
                      numberOfLines={1}
                    >
                      {inc.title.slice(0, 14)}...
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Floating Top Controls */}
        <View style={styles.topControlBar}>
          <View style={styles.gpsStatusPill}>
            {isLoadingGPS ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: permissionGranted
                      ? colors.success
                      : colors.danger,
                  },
                ]}
              />
            )}
            <Text style={styles.gpsStatusText}>
              {permissionGranted
                ? userCoords
                  ? `GPS Aktif (${formatDistance(selectedDistance)} terpilih)`
                  : 'Mencari Koordinat...'
                : gpsError || 'Izin GPS Belum Diberikan'}
            </Text>
          </View>
        </View>

        {/* Floating Right Actions */}
        <View style={styles.floatingActions}>
          <Pressable
            style={({ pressed }) => [
              styles.floatBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={onRefreshGPS}
          >
            <Text style={styles.floatBtnIcon}>🔄</Text>
            <Text style={styles.floatBtnLabel}>Sync GPS</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.floatBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={() =>
              setMapType((prev) => (prev === 'standard' ? 'schematic' : 'standard'))
            }
          >
            <Text style={styles.floatBtnIcon}>🗺️</Text>
            <Text style={styles.floatBtnLabel}>
              {mapType === 'standard' ? 'Peta' : 'Skema'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 380,
    width: '100%',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  mapCanvas: {
    flex: 1,
    position: 'relative',
  },
  gridBackground: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  campusWatermark: {
    position: 'absolute',
    top: spacing.md,
    fontSize: typography.size.xs,
    color: '#94A3B8',
    fontWeight: typography.weight.bold,
    letterSpacing: 1.5,
  },
  userMarkerContainer: {
    position: 'absolute',
    top: '40%',
    left: '46%',
    alignItems: 'center',
  },
  userPulseRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(29, 78, 216, 0.2)',
    top: -14,
    left: -14,
  },
  userMarkerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.surface,
    ...shadows.sm,
  },
  userCallout: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.xs,
    marginTop: 4,
    ...shadows.sm,
    alignItems: 'center',
  },
  userCalloutText: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  coordsMini: {
    fontSize: 8,
    color: colors.textMuted,
  },
  radius25mOverlay: {
    position: 'absolute',
    top: '25%',
    left: '20%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radius25mCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: colors.radius25mCircle,
    borderWidth: 2,
    borderColor: colors.radius25mStroke,
    borderStyle: 'dashed',
  },
  radiusLabel: {
    position: 'absolute',
    bottom: -16,
    fontSize: 9,
    fontWeight: typography.weight.bold,
    color: colors.danger,
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    borderRadius: radii.xs,
  },
  markersLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-around',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.xl,
  },
  pinContainer: {
    alignItems: 'center',
    margin: spacing.sm,
  },
  pinContainerSelected: {
    transform: [{ scale: 1.15 }],
    zIndex: 10,
  },
  pinBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  pinBubbleSelected: {
    borderColor: colors.warning,
    borderWidth: 3,
  },
  pinIcon: {
    fontSize: 16,
  },
  pinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  miniSevBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: radii.xs,
    borderWidth: 1,
    marginTop: 2,
    maxWidth: 90,
  },
  miniSevText: {
    fontSize: 8,
    fontWeight: typography.weight.semibold,
  },
  topControlBar: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gpsStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    gap: spacing.xs,
    ...shadows.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  gpsStatusText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: colors.textMain,
  },
  floatingActions: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    gap: spacing.sm,
  },
  floatBtn: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
    flexDirection: 'row',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  floatBtnIcon: {
    fontSize: 14,
  },
  floatBtnLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  pinPressed: {
    opacity: 0.8,
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
});
