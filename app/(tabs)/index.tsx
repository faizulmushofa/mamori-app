import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, typography, shadows } from '../../constants/tokens';
import { MOCK_INCIDENTS } from '../../data/mockIncidents';
import {
  CATEGORY_METADATA,
  type IncidentItem,
  type IncidentCategory,
} from '../../types/incident';
import { useLocationTracking } from '../../hooks/useLocationTracking';
import { useAuth } from '../../hooks/useAuth';
import { IncidentFeedCard } from '../../components/feed/IncidentFeedCard';
import { AuthSheet } from '../../components/auth/AuthSheet';

const ALL_CATEGORIES: Array<{ key: 'all' | IncidentCategory; label: string; icon: any }> = [
  { key: 'all', label: 'Semua', icon: 'grid-outline' },
  { key: 'bencana', label: 'Bencana', icon: 'warning-outline' },
  { key: 'drainase', label: 'Drainase', icon: 'water-outline' },
  { key: 'listrik', label: 'Listrik', icon: 'flash-outline' },
  { key: 'fasilitas', label: 'Fasilitas', icon: 'construct-outline' },
  { key: 'kebersihan', label: 'Kebersihan', icon: 'trash-outline' },
  { key: 'pohon', label: 'Pohon', icon: 'leaf-outline' },
];

/**
 * Tab 1 (Paling Kiri): Lini Masa Postingan Insiden Kampus (PRD F-10 & F-20)
 * Desain ala Instagram + Quora: Card laporan, foto watermark, tombol "Masih ada di sini".
 */
export default function FeedScreen() {
  const router = useRouter();
  const { coords, getDistanceTo } = useLocationTracking();
  const { isAuthenticated } = useAuth();

  const [incidents, setIncidents] = useState<IncidentItem[]>(MOCK_INCIDENTS);
  const [selectedCategory, setSelectedCategory] = useState<'all' | IncidentCategory>('all');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [upvotedIncidentIds, setUpvotedIncidentIds] = useState<Set<string>>(new Set());
  const [authSheetVisible, setAuthSheetVisible] = useState<boolean>(false);

  // Filter daftar insiden
  const filteredIncidents = useMemo(() => {
    if (selectedCategory === 'all') return incidents;
    return incidents.filter((inc) => inc.category === selectedCategory);
  }, [incidents, selectedCategory]);

  // Pull to refresh simulation
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  }, []);

  // Upvote ("Masih ada di sini") handler
  const handleUpvote = useCallback(
    (incidentId: string) => {
      // Jika belum terotentikasi, pemicu login di akhir (Deferred Auth)
      if (!isAuthenticated) {
        setAuthSheetVisible(true);
        return;
      }

      setUpvotedIncidentIds((prev) => {
        const next = new Set(prev);
        const hasVoted = next.has(incidentId);

        if (hasVoted) {
          next.delete(incidentId);
        } else {
          next.add(incidentId);
        }

        // Update counter lokal
        setIncidents((currentList) =>
          currentList.map((item) => {
            if (item.id === incidentId) {
              return {
                ...item,
                confirmationsCount: hasVoted
                  ? Math.max(0, item.confirmationsCount - 1)
                  : item.confirmationsCount + 1,
              };
            }
            return item;
          })
        );

        return next;
      });
    },
    [isAuthenticated]
  );

  // Buka peta untuk insiden tersebut
  const handleOpenMap = useCallback(
    (_incident: IncidentItem) => {
      router.push('/(tabs)/map');
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: IncidentItem }) => {
      const distance = getDistanceTo(item.coordinates);
      const isUpvoted = upvotedIncidentIds.has(item.id);

      return (
        <IncidentFeedCard
          incident={item}
          distanceMeters={distance}
          hasUpvoted={isUpvoted}
          onUpvote={handleUpvote}
          onOpenMap={handleOpenMap}
        />
      );
    },
    [getDistanceTo, upvotedIncidentIds, handleUpvote, handleOpenMap]
  );

  return (
    <View style={styles.container}>
      {/* 1. Header Aplikasi */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Ionicons name="shield-checkmark" size={20} color={colors.textInverse} />
          </View>
          <View>
            <Text style={styles.brandTitle}>MAMORI</Text>
            <Text style={styles.brandSubtitle}>Lini Masa Pantauan Risiko</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.searchBtn, pressed && styles.btnPressed]}
          onPress={() => router.push('/(tabs)/map')}
        >
          <Ionicons name="map-outline" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {/* 2. Chip Filter Kategori Horizontal */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {ALL_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <Pressable
                key={cat.key}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipSelected,
                ]}
                onPress={() => setSelectedCategory(cat.key)}
              >
                <Ionicons
                  name={cat.icon}
                  size={14}
                  color={isSelected ? colors.textInverse : colors.textMain}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextSelected,
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Feed List */}
      <FlatList
        data={filteredIncidents}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.feedList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={colors.borderDark} />
            <Text style={styles.emptyTitle}>Tidak ada laporan aktif</Text>
            <Text style={styles.emptyDesc}>
              Belum ada laporan pada kategori ini. Anda dapat melaporkan temuan masalah
              di kampus menggunakan tombol Lapor di bawah.
            </Text>
          </View>
        }
      />

      {/* Auth Sheet untuk Deferred Login */}
      <AuthSheet
        visible={authSheetVisible}
        onClose={() => setAuthSheetVisible(false)}
        title="Masuk untuk Konfirmasi"
        subtitle="Konfirmasi 'Masih ada di sini' memerlukan akun civitas kampus agar suara Anda tercatat dan diverifikasi."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  brandTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  searchBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: colors.textMain,
  },
  filterChipTextSelected: {
    color: colors.textInverse,
    fontWeight: typography.weight.bold,
  },
  feedList: {
    padding: spacing.md,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  emptyDesc: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  btnPressed: {
    opacity: 0.8,
  },
});
