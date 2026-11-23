import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, radii, typography, shadows } from '../../lib/tokens';
import { MOCK_INCIDENTS } from '../../lib/mockIncidents';
import {
  CATEGORY_METADATA,
  SEVERITY_METADATA,
  STATUS_METADATA,
  type IncidentItem,
  type IncidentCategory,
  type IncidentStatus,
} from '../../lib/types';
import { ReactiveFilterBar } from '../../components/feed/ReactiveFilterBar';
import { OfflineBanner } from '../../components/feed/OfflineBanner';

/**
 * Layar Tab 3: Feed Realtime & Filter Reaktif (Pertemuan 11 & PRD F-17, F-20, F-32)
 */
export default function FeedScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IncidentCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<IncidentStatus | 'all'>('all');
  const [isDebouncing, setIsDebouncing] = useState(false);

  const [isOffline, setIsOffline] = useState(false);
  const [pendingQueue, setPendingQueue] = useState(0);

  const [incidents, setIncidents] = useState<IncidentItem[]>(MOCK_INCIDENTS);
  const [confirmedIds, setConfirmedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!searchQuery) {
      setIsDebouncing(false);
      return;
    }
    setIsDebouncing(true);
    const timer = setTimeout(() => {
      setIsDebouncing(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchReporter = item.reporterName.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchReporter) {
          return false;
        }
      }
      return true;
    });
  }, [incidents, selectedCategory, selectedStatus, searchQuery]);

  const handleQuickConfirm = (id: string) => {
    if (confirmedIds[id]) return;

    setConfirmedIds((prev) => ({ ...prev, [id]: true }));
    setIncidents((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, confirmationsCount: item.confirmationsCount + 1 }
          : item
      )
    );

    if (isOffline) {
      setPendingQueue((prev) => prev + 1);
    }
  };

  const renderIncidentCard = ({ item }: { item: IncidentItem }) => {
    const catMeta = CATEGORY_METADATA[item.category];
    const sevMeta = SEVERITY_METADATA[item.severity];
    const statMeta = STATUS_METADATA[item.status];
    const hasConfirmed = !!confirmedIds[item.id];

    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => router.push(`/incident/${item.id}` as any)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.categoryTag,
                { backgroundColor: catMeta.bgColor, borderColor: catMeta.color },
              ]}
            >
              <Text style={[styles.categoryTagText, { color: catMeta.color }]}>
                {catMeta.label}
              </Text>
            </View>

            <View
              style={[
                styles.sevTag,
                { backgroundColor: sevMeta.bgColor, borderColor: sevMeta.color },
              ]}
            >
              <Text style={[styles.sevTagText, { color: sevMeta.color }]}>
                {sevMeta.label}
              </Text>
            </View>
          </View>

          <View style={styles.liveSyncBadge}>
            <View style={styles.liveDot} />
            <Text style={[styles.statusText, { color: statMeta.color }]}>
              {statMeta.label}
            </Text>
          </View>
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {item.description}
        </Text>

        {item.evacuationBarrier && (
          <View style={styles.evacPill}>
            <Text style={styles.evacPillText}>
              🚨 Menghalangi Jalur Evakuasi Kampus
            </Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.reporterInfo}>
            <Text style={styles.reporterText}>👤 {item.reporterName}</Text>
            <Text style={styles.confirmationsText}>
              👍 {item.confirmationsCount} Konfirmasi
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.quickConfirmBtn,
              hasConfirmed && styles.quickConfirmBtnActive,
              pressed && styles.btnPressed,
            ]}
            onPress={() => handleQuickConfirm(item.id)}
          >
            <Text
              style={[
                styles.quickConfirmText,
                hasConfirmed && styles.quickConfirmTextActive,
              ]}
            >
              {hasConfirmed ? '✓ Masih Ada' : '+ Masih Ada?'}
            </Text>
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.screen}>
      <OfflineBanner
        isOffline={isOffline}
        pendingQueueCount={pendingQueue}
        onRetryConnection={() => {
          setIsOffline(false);
          setPendingQueue(0);
        }}
      />

      <View style={styles.topBar}>
        <View style={styles.liveFeedTag}>
          <Text style={styles.livePulseDot}>●</Text>
          <Text style={styles.liveFeedText}>Realtime Feed Kampus</Text>
        </View>

        <Pressable
          style={styles.offlineSimToggle}
          onPress={() => setIsOffline((prev) => !prev)}
        >
          <Text style={styles.offlineSimText}>
            {isOffline ? 'Mode: Offline 📵' : 'Mode: Online 📶'}
          </Text>
        </Pressable>
      </View>

      <ReactiveFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        isDebouncing={isDebouncing}
      />

      <FlatList
        data={filteredIncidents}
        keyExtractor={(item) => item.id}
        renderItem={renderIncidentCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>Tidak Ada Laporan yang Cocok</Text>
            <Text style={styles.emptyDesc}>
              Coba sesuaikan filter kategori, status, atau kata kunci pencarian Anda.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  liveFeedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  livePulseDot: {
    color: colors.success,
    fontSize: 14,
  },
  liveFeedText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  offlineSimToggle: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  offlineSimText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: typography.weight.medium,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl * 2,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  categoryTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.xs,
    borderWidth: 1,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
  },
  sevTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.xs,
    borderWidth: 1,
  },
  sevTagText: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
  },
  liveSyncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  statusText: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
  },
  cardTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
    marginTop: spacing.xs,
  },
  cardDesc: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 18,
  },
  evacPill: {
    backgroundColor: colors.dangerLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.xs,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  evacPillText: {
    fontSize: 10,
    color: colors.danger,
    fontWeight: typography.weight.bold,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  reporterInfo: {
    flex: 1,
  },
  reporterText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  confirmationsText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: typography.weight.semibold,
    marginTop: 1,
  },
  quickConfirmBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  quickConfirmBtnActive: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
  },
  quickConfirmText: {
    color: colors.primary,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  quickConfirmTextActive: {
    color: colors.success,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  emptyDesc: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  btnPressed: {
    opacity: 0.8,
  },
});
