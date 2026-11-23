import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, typography, shadows } from '../../constants/tokens';
import { useAuth } from '../../hooks/useAuth';
import { listDrafts, deleteDraft, type ReportDraft } from '../../lib/actions/draft.actions';
import { MOCK_INCIDENTS } from '../../data/mockIncidents';
import {
  STATUS_METADATA,
  CATEGORY_METADATA,
  type IncidentItem,
  type IncidentCategory,
  type IncidentStatus,
} from '../../types/incident';
import { AuthSheet } from '../../components/auth/AuthSheet';

/**
 * Tab 4: Status Pelaporan Saya & Manajemen Draf Offline (PRD F-06 & F-30)
 */
export default function MyReportsScreen() {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'submitted' | 'drafts'>('submitted');

  const [drafts, setDrafts] = useState<ReportDraft[]>([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState<boolean>(false);
  const [authSheetVisible, setAuthSheetVisible] = useState<boolean>(false);
  const [syncingDraftId, setSyncingDraftId] = useState<string | null>(null);

  // Ambil draf lokal dari expo-file-system
  const loadLocalDrafts = useCallback(async () => {
    try {
      setIsLoadingDrafts(true);
      const list = await listDrafts();
      setDrafts(list);
    } catch {
      // Memory fallback / silent handle
    } finally {
      setIsLoadingDrafts(false);
    }
  }, []);

  useEffect(() => {
    loadLocalDrafts();
  }, [loadLocalDrafts]);

  // Hapus draf lokal
  const handleDeleteDraft = async (draftId: string) => {
    Alert.alert(
      'Hapus Draf?',
      'Draf ini akan dihapus permanen dari memori perangkat.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            await deleteDraft(draftId);
            loadLocalDrafts();
          },
        },
      ]
    );
  };

  // Sinkronisasi draf offline (TUS upload simulation)
  const handleSyncDraft = async (draft: ReportDraft) => {
    if (!isAuthenticated) {
      setAuthSheetVisible(true);
      return;
    }

    try {
      setSyncingDraftId(draft.id);
      setTimeout(async () => {
        await deleteDraft(draft.id);
        await loadLocalDrafts();
        setSyncingDraftId(null);
        Alert.alert(
          'Draf Berhasil Diunggah',
          `Laporan "${draft.description.slice(0, 30)}..." telah disinkronkan ke server kampus.`
        );
      }, 1200);
    } catch {
      setSyncingDraftId(null);
      Alert.alert('Gagal Sinkronisasi', 'Periksa koneksi internet Anda.');
    }
  };

  // Laporan terkirim milik pengguna (disimulasikan dari mock)
  const mySubmittedReports: IncidentItem[] = isAuthenticated
    ? MOCK_INCIDENTS.slice(0, 3)
    : [];

  return (
    <View style={styles.container}>
      {/* 1. Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Laporan Saya</Text>
        <Text style={styles.headerSubtitle}>
          Pelacakan siklus penanganan & draf offline
        </Text>
      </View>

      {/* 2. Segmented Switcher */}
      <View style={styles.segmentedContainer}>
        <Pressable
          style={[
            styles.segmentButton,
            activeTab === 'submitted' && styles.segmentButtonActive,
          ]}
          onPress={() => setActiveTab('submitted')}
        >
          <Ionicons
            name="cloud-done-outline"
            size={16}
            color={activeTab === 'submitted' ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.segmentText,
              activeTab === 'submitted' && styles.segmentTextActive,
            ]}
          >
            Terkirim ({mySubmittedReports.length})
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.segmentButton,
            activeTab === 'drafts' && styles.segmentButtonActive,
          ]}
          onPress={() => {
            setActiveTab('drafts');
            loadLocalDrafts();
          }}
        >
          <Ionicons
            name="save-outline"
            size={16}
            color={activeTab === 'drafts' ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.segmentText,
              activeTab === 'drafts' && styles.segmentTextActive,
            ]}
          >
            Draf Offline ({drafts.length})
          </Text>
        </Pressable>
      </View>

      {/* 3. Tab Konten */}
      {activeTab === 'submitted' ? (
        !isAuthenticated ? (
          <View style={styles.guestStateBox}>
            <View style={styles.guestIconCircle}>
              <Ionicons name="lock-closed" size={32} color={colors.primary} />
            </View>
            <Text style={styles.guestStateTitle}>Masuk untuk Memantau Laporan</Text>
            <Text style={styles.guestStateDesc}>
              Masuk dengan akun Google atau Email Kampus untuk melihat riwayat laporan
              dan status tindak lanjut tim pengelola.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.loginBtn, pressed && styles.btnPressed]}
              onPress={() => setAuthSheetVisible(true)}
            >
              <Text style={styles.loginBtnText}>Masuk Sekarang</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={mySubmittedReports}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const statusMeta = STATUS_METADATA[item.status];
              const catMeta = CATEGORY_METADATA[item.category];

              return (
                <View style={styles.reportCard}>
                  <View style={styles.reportCardHeader}>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: catMeta.bgColor, borderColor: catMeta.color },
                      ]}
                    >
                      <Text style={[styles.badgeText, { color: catMeta.color }]}>
                        {catMeta.label}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusPill,
                        { backgroundColor: statusMeta.bgColor },
                      ]}
                    >
                      <Text
                        style={[styles.statusPillText, { color: statusMeta.color }]}
                      >
                        {statusMeta.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {item.description}
                  </Text>

                  {/* Progress Timeline Tracker */}
                  <View style={styles.timelineRow}>
                    {(
                      [
                        'dilaporkan',
                        'terverifikasi',
                        'diteruskan',
                        'dikerjakan',
                        'selesai',
                      ] as IncidentStatus[]
                    ).map((stepKey, idx) => {
                      const isReached =
                        STATUS_METADATA[stepKey].stepOrder <= statusMeta.stepOrder;
                      return (
                        <React.Fragment key={stepKey}>
                          <View
                            style={[
                              styles.timelineDot,
                              isReached && styles.timelineDotActive,
                            ]}
                          />
                          {idx < 4 && (
                            <View
                              style={[
                                styles.timelineLine,
                                isReached && styles.timelineLineActive,
                              ]}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.cardDate}>
                      Dibuat: {new Date(item.createdAt).toLocaleDateString('id-ID')}
                    </Text>
                    <Text style={styles.confirmationsText}>
                      ▲ {item.confirmationsCount} konfirmasi
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )
      ) : (
        /* Tab Draf Offline */
        <FlatList
          data={drafts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            isLoadingDrafts ? (
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={{ marginTop: spacing.xl }}
              />
            ) : (
              <View style={styles.emptyDraftBox}>
                <Ionicons name="folder-open-outline" size={44} color={colors.borderDark} />
                <Text style={styles.emptyDraftTitle}>Tidak ada draf offline</Text>
                <Text style={styles.emptyDraftDesc}>
                  Laporan yang dibuat saat tidak ada sinyal akan otomatis tersimpan di sini
                  menggunakan scoped storage (expo-file-system).
                </Text>
              </View>
            )
          }
          renderItem={({ item }) => {
            const cat = (
              item.category === 'risiko-bencana' ? 'bencana' : item.category
            ) as IncidentCategory;
            const catMeta = CATEGORY_METADATA[cat] || CATEGORY_METADATA.lainnya;
            const isSyncing = syncingDraftId === item.id;

            return (
              <View style={styles.draftCard}>
                <View style={styles.reportCardHeader}>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: catMeta.bgColor, borderColor: catMeta.color },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: catMeta.color }]}>
                      {catMeta.label}
                    </Text>
                  </View>
                  <Text style={styles.draftSizeText}>
                    {(item.photo.bytes / 1024).toFixed(0)} KB • Tersimpan Lokal
                  </Text>
                </View>

                <Text style={styles.cardTitle}>Draf Laporan {catMeta.label}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {item.description || 'Tidak ada deskripsi'}
                </Text>

                <View style={styles.draftActionsRow}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.deleteDraftBtn,
                      pressed && styles.btnPressed,
                    ]}
                    onPress={() => handleDeleteDraft(item.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.danger} />
                    <Text style={styles.deleteDraftText}>Hapus</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.syncDraftBtn,
                      isSyncing && styles.btnDisabled,
                      pressed && styles.btnPressed,
                    ]}
                    disabled={isSyncing}
                    onPress={() => handleSyncDraft(item)}
                  >
                    {isSyncing ? (
                      <ActivityIndicator size="small" color={colors.textInverse} />
                    ) : (
                      <>
                        <Ionicons
                          name="cloud-upload"
                          size={16}
                          color={colors.textInverse}
                        />
                        <Text style={styles.syncDraftText}>Sinkronkan</Text>
                      </>
                    )}
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Auth Sheet */}
      <AuthSheet
        visible={authSheetVisible}
        onClose={() => setAuthSheetVisible(false)}
        title="Masuk untuk Akses Laporan"
        subtitle="Masuk dengan akun Google atau email kampus untuk sinkronisasi draf dan pemantauan penanganan."
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  headerSubtitle: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSubtle,
    gap: 6,
  },
  segmentButtonActive: {
    backgroundColor: colors.primaryLight,
  },
  segmentText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: colors.textMuted,
  },
  segmentTextActive: {
    color: colors.primary,
    fontWeight: typography.weight.bold,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 80,
    gap: spacing.md,
  },
  reportCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  reportCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.xs,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
  },
  cardTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.borderDark,
  },
  timelineDotActive: {
    backgroundColor: colors.primary,
  },
  timelineLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
  },
  timelineLineActive: {
    backgroundColor: colors.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
  },
  cardDate: {
    fontSize: 10,
    color: colors.textMuted,
  },
  confirmationsText: {
    fontSize: 10,
    fontWeight: typography.weight.semibold,
    color: colors.primary,
  },
  guestStateBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  guestIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  guestStateTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  guestStateDesc: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  loginBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    marginTop: spacing.md,
  },
  loginBtnText: {
    color: colors.textInverse,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.sm,
  },
  emptyDraftBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.xs,
  },
  emptyDraftTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  emptyDraftDesc: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  draftCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  draftSizeText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  draftActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  deleteDraftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: 4,
  },
  deleteDraftText: {
    color: colors.danger,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  syncDraftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    gap: 4,
  },
  syncDraftText: {
    color: colors.textInverse,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnPressed: {
    opacity: 0.8,
  },
});
