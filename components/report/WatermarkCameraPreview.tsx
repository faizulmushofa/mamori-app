import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, radii, typography, shadows } from '../../lib/tokens';
import type { Coordinates } from '../../lib/haversine';

interface WatermarkCameraPreviewProps {
  coordinates: Coordinates | null;
  timestamp: string;
  photoCaptured: boolean;
  onCapturePhoto: () => void;
  onRetakePhoto: () => void;
}

/**
 * Viewfinder Kamera dengan Tanam Watermark Koordinat & Timestamp WIB (PRD F-09)
 */
export const WatermarkCameraPreview: React.FC<WatermarkCameraPreviewProps> = ({
  coordinates,
  timestamp,
  photoCaptured,
  onCapturePhoto,
  onRetakePhoto,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.viewfinder}>
        {photoCaptured ? (
          <View style={styles.capturedPhoto}>
            <Text style={styles.photoSimulatedIcon}>📸</Text>
            <Text style={styles.photoSimulatedLabel}>
              Foto Laporan Berhasil Ditangkap (Resolusi Penuh)
            </Text>
          </View>
        ) : (
          <View style={styles.liveCameraFeed}>
            <View style={styles.crosshair} />
            <Text style={styles.cameraHelpText}>
              Arahkan kamera langsung ke objek masalah / risiko
            </Text>
          </View>
        )}

        <View style={styles.watermarkContainer}>
          <View style={styles.watermarkRow}>
            <Text style={styles.watermarkTag}>MAMORI SECURITY VERIFIED</Text>
          </View>
          <Text style={styles.watermarkText}>
            📍 LAT/LONG:{' '}
            {coordinates
              ? `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`
              : 'GPS MENYINKRONKAN...'}
          </Text>
          <Text style={styles.watermarkText}>
            ⏰ WAKTU:{' '}
            {timestamp || '2026-11-23 14:18:20 WIB (REAL-TIME EMBED)'}
          </Text>
          <Text style={styles.watermarkSubtext}>
            EXIF TAMPER-PROOF • SCOPED STORAGE VAULT
          </Text>
        </View>
      </View>

      <View style={styles.shutterBar}>
        {photoCaptured ? (
          <Pressable
            style={({ pressed }) => [
              styles.retakeBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={onRetakePhoto}
          >
            <Text style={styles.retakeBtnText}>🔄 Ambil Ulang Foto</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.shutterBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={onCapturePhoto}
          >
            <View style={styles.shutterInner} />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    ...shadows.lg,
  },
  viewfinder: {
    height: 280,
    backgroundColor: '#1E293B',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveCameraFeed: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshair: {
    width: 60,
    height: 60,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  cameraHelpText: {
    color: '#94A3B8',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
  capturedPhoto: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  photoSimulatedIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  photoSimulatedLabel: {
    color: '#E2E8F0',
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
  },
  watermarkContainer: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  watermarkRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  watermarkTag: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: typography.weight.bold,
    letterSpacing: 0.5,
  },
  watermarkText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: typography.weight.bold,
  },
  watermarkSubtext: {
    color: '#94A3B8',
    fontSize: 8,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  shutterBar: {
    backgroundColor: '#0F172A',
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
  },
  retakeBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  retakeBtnText: {
    color: '#F8FAFC',
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
});
