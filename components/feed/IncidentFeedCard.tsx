import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, typography, shadows } from '../../constants/tokens';
import {
  CATEGORY_METADATA,
  SEVERITY_METADATA,
  STATUS_METADATA,
  type IncidentItem,
  type IncidentCategory,
} from '../../types/incident';
import { formatDistance } from '../../lib/actions/geo.actions';

interface IncidentFeedCardProps {
  incident: IncidentItem;
  distanceMeters: number | null;
  hasUpvoted?: boolean;
  onUpvote: (incidentId: string) => void;
  onOpenMap: (incident: IncidentItem) => void;
  onPressDetails?: (incident: IncidentItem) => void;
}

const getCategoryVectorIcon = (category: IncidentCategory) => {
  switch (category) {
    case 'bencana':
      return 'warning-outline' as const;
    case 'drainase':
      return 'water-outline' as const;
    case 'listrik':
      return 'flash-outline' as const;
    case 'pohon':
      return 'leaf-outline' as const;
    case 'kebersihan':
      return 'trash-outline' as const;
    case 'fasilitas':
      return 'construct-outline' as const;
    default:
      return 'alert-circle-outline' as const;
  }
};

/**
 * Postingan Laporan Insiden Bergaya Instagram + Quora (PRD F-10 & F-20)
 * Menggunakan React.memo untuk menjamin 60 FPS saat scrolling daftar.
 */
export const IncidentFeedCard = memo<IncidentFeedCardProps>(function IncidentFeedCard({
  incident,
  distanceMeters,
  hasUpvoted = false,
  onUpvote,
  onOpenMap,
  onPressDetails,
}) {
  const categoryMeta = CATEGORY_METADATA[incident.category];
  const severityMeta = SEVERITY_METADATA[incident.severity];
  const statusMeta = STATUS_METADATA[incident.status];

  // Inisial avatar pelapor
  const reporterInitials = incident.reporterName
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return (
    <View style={styles.card}>
      {/* 1. Header Postingan: Avatar, Nama, Waktu, & Kategori */}
      <View style={styles.header}>
        <View style={styles.reporterInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{reporterInitials}</Text>
          </View>
          <View style={styles.reporterMeta}>
            <View style={styles.nameRow}>
              <Text style={styles.reporterName} numberOfLines={1}>
                {incident.reporterName}
              </Text>
              {incident.verifiedBy && (
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={colors.primary}
                  style={styles.verifiedIcon}
                />
              )}
            </View>
            <Text style={styles.timestamp}>
              {new Date(incident.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        <View style={styles.headerBadges}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: categoryMeta.bgColor, borderColor: categoryMeta.color },
            ]}
          >
            <Ionicons
              name={getCategoryVectorIcon(incident.category)}
              size={12}
              color={categoryMeta.color}
            />
            <Text style={[styles.categoryBadgeText, { color: categoryMeta.color }]}>
              {categoryMeta.label}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusMeta.bgColor },
            ]}
          >
            <View
              style={[styles.statusDot, { backgroundColor: statusMeta.color }]}
            />
            <Text style={[styles.statusBadgeText, { color: statusMeta.color }]}>
              {statusMeta.label}
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Gambar Bukti dengan Watermark GPS & Waktu (PRD F-09) */}
      <View style={styles.mediaContainer}>
        {incident.photoUrl ? (
          <Image
            source={{ uri: incident.photoUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={36} color={colors.borderDark} />
            <Text style={styles.imagePlaceholderText}>Bukti Foto Lapangan</Text>
          </View>
        )}

        {/* Overlay Watermark Terverifikasi (F-09) */}
        <View style={styles.watermarkOverlay}>
          <View style={styles.watermarkRow}>
            <Ionicons name="location" size={11} color={colors.textInverse} />
            <Text style={styles.watermarkText}>
              {incident.coordinates.latitude.toFixed(5)},{' '}
              {incident.coordinates.longitude.toFixed(5)}
            </Text>
          </View>
          <Text style={styles.watermarkText}>
            MAMORI VERIFIED • {new Date(incident.createdAt).toLocaleDateString('id-ID')}
          </Text>
        </View>

        {/* Warning Jalur Evakuasi */}
        {incident.evacuationBarrier && (
          <View style={styles.barrierBanner}>
            <Ionicons name="warning" size={13} color={colors.textInverse} />
            <Text style={styles.barrierBannerText}>Menghalangi Jalur Evakuasi</Text>
          </View>
        )}
      </View>

      {/* 3. Konten Masalah */}
      <Pressable
        onPress={() => onPressDetails?.(incident)}
        style={styles.contentBody}
      >
        <Text style={styles.title}>{incident.title}</Text>
        <Text style={styles.description} numberOfLines={3}>
          {incident.description}
        </Text>
      </Pressable>

      {/* 4. Footer Aksi: Upvote ("Masih ada di sini") ala Quora & Buka Peta */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.upvoteButton,
            hasUpvoted && styles.upvoteButtonActive,
            pressed && styles.btnPressed,
          ]}
          onPress={() => onUpvote(incident.id)}
        >
          <Ionicons
            name={hasUpvoted ? 'arrow-up-circle' : 'arrow-up-circle-outline'}
            size={18}
            color={hasUpvoted ? colors.textInverse : colors.primary}
          />
          <Text
            style={[
              styles.upvoteButtonText,
              hasUpvoted && styles.upvoteButtonTextActive,
            ]}
          >
            Masih ada di sini
          </Text>
          <View
            style={[
              styles.upvoteCounter,
              hasUpvoted && styles.upvoteCounterActive,
            ]}
          >
            <Text
              style={[
                styles.upvoteCounterText,
                hasUpvoted && styles.upvoteCounterTextActive,
              ]}
            >
              {incident.confirmationsCount}
            </Text>
          </View>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.mapActionBtn, pressed && styles.btnPressed]}
          onPress={() => onOpenMap(incident)}
        >
          <Ionicons name="navigate-outline" size={15} color={colors.primary} />
          <Text style={styles.mapActionBtnText}>
            {distanceMeters != null
              ? `${formatDistance(distanceMeters)} • Peta`
              : 'Lihat di Peta'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  reporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  reporterMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reporterName: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  verifiedIcon: {
    marginTop: 1,
  },
  timestamp: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.xs,
    borderWidth: 1,
    gap: 4,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
  },
  mediaContainer: {
    width: '100%',
    height: 220,
    backgroundColor: colors.surfaceSubtle,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  imagePlaceholderText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  watermarkOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  watermarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  watermarkText: {
    color: colors.textInverse,
    fontSize: 9,
    fontFamily: typography.fontFamily.mono,
    fontWeight: typography.weight.medium,
  },
  barrierBanner: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    ...shadows.sm,
  },
  barrierBannerText: {
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: typography.weight.bold,
  },
  contentBody: {
    padding: spacing.md,
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
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationPillText: {
    fontSize: typography.size.xs,
    color: colors.primary,
    fontWeight: typography.weight.medium,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: typography.weight.semibold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
  },
  upvoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.full,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  upvoteButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  upvoteButtonText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  upvoteButtonTextActive: {
    color: colors.textInverse,
  },
  upvoteCounter: {
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.full,
  },
  upvoteCounterActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  upvoteCounterText: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  upvoteCounterTextActive: {
    color: colors.textInverse,
  },
  mapActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    gap: 4,
  },
  mapActionBtnText: {
    fontSize: typography.size.xs,
    color: colors.textMain,
    fontWeight: typography.weight.semibold,
  },
  btnPressed: {
    opacity: 0.75,
  },
});
