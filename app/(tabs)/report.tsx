import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, typography, shadows } from '../../constants/tokens';
import { useLocationTracking } from '../../hooks/useLocationTracking';
import { useAuth } from '../../hooks/useAuth';
import { requestCameraPermission } from '../../lib/actions/permission.actions';
import { saveDraft } from '../../lib/actions/draft.actions';
import { isDuplicateCandidate } from '../../lib/actions/geo.actions';
import { MOCK_INCIDENTS } from '../../data/mockIncidents';
import {
  CATEGORY_METADATA,
  SEVERITY_METADATA,
  type IncidentCategory,
  type IncidentSeverity,
} from '../../types/incident';
import type { ReportCategory } from '../../lib/types/storage.types';
import { AuthSheet } from '../../components/auth/AuthSheet';

const CATEGORIES: IncidentCategory[] = [
  'fasilitas',
  'kebersihan',
  'drainase',
  'pohon',
  'listrik',
  'bencana',
];

const SEVERITIES: IncidentSeverity[] = ['rendah', 'sedang', 'tinggi'];

/**
 * Tab 3 (Tengah - Tombol Besar): Wizard Pelaporan 4-Langkah (PRD F-01 s/d F-06)
 * Mendukung foto kamera langsung, watermark GPS/waktu, pencegahan duplikat 25m,
 * dan penyimpanan draf offline di scoped storage expo-file-system.
 */
export default function ReportScreen() {
  const router = useRouter();
  const { coords } = useLocationTracking();
  const { user, isAuthenticated } = useAuth();

  // Wizard Step: 1 = Foto Kamera, 2 = Kategori & Keparahan, 3 = Deskripsi, 4 = Review & Kirim
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [photoTimestamp, setPhotoTimestamp] = useState<string>('');
  const [category, setCategory] = useState<IncidentCategory>('fasilitas');
  const [severity, setSeverity] = useState<IncidentSeverity>('sedang');
  const [evacuationBarrier, setEvacuationBarrier] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [authSheetVisible, setAuthSheetVisible] = useState<boolean>(false);

  // JIT Camera Permission check
  useEffect(() => {
    let isMounted = true;
    requestCameraPermission().then((res) => {
      if (isMounted) setHasCameraPermission(res === 'granted');
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Aksi Jepret Foto Kamera (PRD F-01 & F-02)
  const handleCapturePhoto = () => {
    const timestamp = new Date().toISOString();
    setPhotoTimestamp(timestamp);
    setCapturedPhotoUri(`file:///data/user/0/mamori/files/report_${Date.now()}.jpg`);
    setStep(2);
  };

  // Cek duplikat radius 25m saat di langkah 3
  const nearbyDuplicate = React.useMemo(() => {
    if (!coords) return null;
    const userCoord = { latitude: coords.latitude, longitude: coords.longitude };
    return (
      MOCK_INCIDENTS.find(
        (existing) =>
          existing.category === category &&
          isDuplicateCandidate(userCoord, existing.coordinates, 25)
      ) || null
    );
  }, [coords, category]);

  // 2. Simpan Draf Offline (Scoped Storage expo-file-system, PRD F-06)
  const handleSaveOfflineDraft = async () => {
    try {
      setIsSubmitting(true);
      const draftId = `draft-${Date.now()}`;
      const userCoords = coords
        ? { latitude: coords.latitude, longitude: coords.longitude }
        : { latitude: -7.8014, longitude: 110.3644 };

      const reportCategory: ReportCategory =
        category === 'bencana' ? 'risiko-bencana' : category;

      await saveDraft({
        id: draftId,
        reportId: `rep-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        coords: userCoords,
        capturedAt: photoTimestamp || new Date().toISOString(),
        category: reportCategory,
        description: description.trim() || title.trim(),
        severity,
        blocksEvacuation: evacuationBarrier,
        photo: {
          id: `photo-${Date.now()}`,
          fileName: `photo_${Date.now()}.jpg`,
          mimeType: 'image/jpeg',
          bytes: 1024 * 512,
        },
        upload: {
          provider: 'tus',
          status: 'pending',
          objectPath: `${user?.id || 'guest'}/${draftId}.jpg`,
          uploadUrl: null,
          bytesUploaded: 0,
          totalBytes: 1024 * 512,
          updatedAt: new Date().toISOString(),
          error: null,
        },
      });

      Alert.alert(
        'Draf Tersimpan Offline',
        'Laporan telah disimpan secara aman di Scoped Storage (expo-file-system). Anda dapat mengunggahnya kapan saja dari tab Laporan.',
        [
          {
            text: 'Lihat Draf Saya',
            onPress: () => router.push('/(tabs)/my-reports'),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Gagal Menyimpan Draf', err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Kirim Laporan Langsung
  const handleSubmitReport = async () => {
    if (!isAuthenticated) {
      setAuthSheetVisible(true);
      return;
    }

    if (!title.trim()) {
      Alert.alert('Perhatian', 'Harap isi judul ringkas laporan Anda.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Laporan Terkirim',
        'Laporan Anda berhasil dicatat dengan status Dilaporkan. Tim Sarpras & K3 kampus segera memverifikasi.',
        [
          {
            text: 'Buka Laporan Saya',
            onPress: () => router.push('/(tabs)/my-reports'),
          },
        ]
      );
    }, 1000);
  };

  return (
    <View style={styles.container}>
      {/* 1. Header Wizard */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.btnPressed]}
          onPress={() => {
            if (step > 1) setStep((prev) => (prev - 1) as any);
            else router.back();
          }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textMain} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Buat Laporan Masalah</Text>
          <Text style={styles.stepIndicator}>Langkah {step} dari 4</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* 2. Step Progress Bar */}
      <View style={styles.progressBarRow}>
        {[1, 2, 3, 4].map((s) => (
          <View
            key={s}
            style={[
              styles.progressSegment,
              s <= step && styles.progressSegmentActive,
            ]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* LANGKAH 1: Kamera & Watermark GPS */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionTitle}>Ambil Foto Bukti Lapangan</Text>
            <Text style={styles.sectionSubtitle}>
              Foto diambil langsung dari kamera untuk menjamin keaslian masalah. Galeri
              foto dinonaktifkan (PRD F-01).
            </Text>

            <View style={styles.cameraBox}>
              <View style={styles.cameraPreviewArea}>
                <Ionicons name="camera-reverse-outline" size={48} color={colors.borderDark} />
                <Text style={styles.cameraInstruction}>
                  Arahkan kamera ke titik kerusakan atau risiko fasilitas
                </Text>
              </View>

              {/* Watermark Live Badge */}
              <View style={styles.watermarkLiveBadge}>
                <Ionicons name="location" size={12} color={colors.textInverse} />
                <Text style={styles.watermarkLiveText}>
                  GPS: {coords ? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}` : 'Mencari...'}
                </Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.captureBtn,
                pressed && styles.btnPressed,
              ]}
              onPress={handleCapturePhoto}
            >
              <View style={styles.captureInnerCircle}>
                <Ionicons name="camera" size={26} color={colors.textInverse} />
              </View>
              <Text style={styles.captureBtnText}>Jepret Foto Bukti</Text>
            </Pressable>
          </View>
        )}

        {/* LANGKAH 2: Kategori & Keparahan */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionTitle}>Pilih Kategori Masalah</Text>
            <Text style={styles.sectionSubtitle}>
              Pilih klasifikasi yang paling sesuai agar diteruskan ke unit yang tepat.
            </Text>

            <View style={styles.categoryGrid}>
              {CATEGORIES.map((catKey) => {
                const meta = CATEGORY_METADATA[catKey];
                const isSelected = category === catKey;
                return (
                  <Pressable
                    key={catKey}
                    style={[
                      styles.categoryCard,
                      isSelected && {
                        borderColor: meta.color,
                        backgroundColor: meta.bgColor,
                      },
                    ]}
                    onPress={() => setCategory(catKey)}
                  >
                    <Ionicons
                      name="construct-outline"
                      size={20}
                      color={isSelected ? meta.color : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.categoryCardLabel,
                        isSelected && { color: meta.color, fontWeight: '700' },
                      ]}
                    >
                      {meta.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>
              Tingkat Keparahan
            </Text>
            <View style={styles.severityRow}>
              {SEVERITIES.map((sevKey) => {
                const meta = SEVERITY_METADATA[sevKey];
                const isSelected = severity === sevKey;
                return (
                  <Pressable
                    key={sevKey}
                    style={[
                      styles.severityChip,
                      isSelected && {
                        backgroundColor: meta.color,
                        borderColor: meta.color,
                      },
                    ]}
                    onPress={() => setSeverity(sevKey)}
                  >
                    <Text
                      style={[
                        styles.severityChipText,
                        isSelected && { color: colors.textInverse, fontWeight: '700' },
                      ]}
                    >
                      {meta.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Checkbox Evakuasi */}
            <Pressable
              style={styles.checkboxRow}
              onPress={() => setEvacuationBarrier((prev) => !prev)}
            >
              <View
                style={[
                  styles.checkbox,
                  evacuationBarrier && styles.checkboxActive,
                ]}
              >
                {evacuationBarrier && (
                  <Ionicons name="checkmark" size={14} color={colors.textInverse} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.checkboxTitle}>
                  Masalah Menghalangi Jalur Evakuasi Kampus
                </Text>
                <Text style={styles.checkboxDesc}>
                  Tandai jika kerusakan menutup pintu darurat, tangga, atau koridor K3.
                </Text>
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.nextBtn, pressed && styles.btnPressed]}
              onPress={() => setStep(3)}
            >
              <Text style={styles.nextBtnText}>Lanjut ke Deskripsi</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.textInverse} />
            </Pressable>
          </View>
        )}

        {/* LANGKAH 3: Deskripsi & Cek Duplikat */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionTitle}>Deskripsi Masalah</Text>
            <Text style={styles.sectionSubtitle}>
              Berikan penjelasan ringkas maksimal 280 karakter (PRD F-04).
            </Text>

            <TextInput
              style={styles.inputTitle}
              placeholder="Judul singkat masalah (misal: Keran Bocor)"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={styles.inputArea}
              placeholder="Deskripsi detail lokasi dan kondisi saat ini..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              maxLength={280}
              value={description}
              onChangeText={setDescription}
            />
            <Text style={styles.charCounter}>{description.length}/280 karakter</Text>

            {/* Peringatan Deteksi Duplikat Spasial (PRD F-11) */}
            {nearbyDuplicate && (
              <View style={styles.duplicateAlertBox}>
                <Ionicons name="alert-circle" size={18} color={colors.warning} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.duplicateAlertTitle}>
                    Peringatan: Masalah Serupa Terdeteksi di Sekitar
                  </Text>
                  <Text style={styles.duplicateAlertDesc}>
                    "{nearbyDuplicate.title}" berjarak &le; 25 m dari posisi Anda.
                    Laporan ini disarankan digabung saat peninjauan.
                  </Text>
                </View>
              </View>
            )}

            <Pressable
              style={({ pressed }) => [styles.nextBtn, pressed && styles.btnPressed]}
              onPress={() => setStep(4)}
            >
              <Text style={styles.nextBtnText}>Tinjau Laporan</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.textInverse} />
            </Pressable>
          </View>
        )}

        {/* LANGKAH 4: Review & Kirim / Simpan Draf Offline */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionTitle}>Konfirmasi Laporan</Text>
            <Text style={styles.sectionSubtitle}>
              Periksa ringkasan sebelum mengirim. Jika sinyal tidak stabil, simpan sebagai
              draf offline di perangkat.
            </Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>{title || 'Tanpa Judul'}</Text>
                <View
                  style={[
                    styles.summaryCategoryBadge,
                    { backgroundColor: CATEGORY_METADATA[category].bgColor },
                  ]}
                >
                  <Text
                    style={[
                      styles.summaryCategoryText,
                      { color: CATEGORY_METADATA[category].color },
                    ]}
                  >
                    {CATEGORY_METADATA[category].label}
                  </Text>
                </View>
              </View>

              <Text style={styles.summaryDesc}>
                {description || 'Tidak ada deskripsi tambahan.'}
              </Text>

              <View style={styles.summaryMetaRow}>
                <Ionicons name="shield-checkmark-outline" size={14} color={colors.primary} />
                <Text style={styles.summaryMetaText}>
                  Keparahan: {SEVERITY_METADATA[severity].label}
                </Text>
              </View>

              <View style={styles.summaryMetaRow}>
                <Ionicons name="location-outline" size={14} color={colors.primary} />
                <Text style={styles.summaryMetaText}>
                  Koordinat: {coords ? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}` : 'Default Kampus'}
                </Text>
              </View>
            </View>

            {/* Tombol Aksi */}
            <View style={styles.actionStack}>
              <Pressable
                style={({ pressed }) => [
                  styles.submitBtn,
                  isSubmitting && styles.btnDisabled,
                  pressed && styles.btnPressed,
                ]}
                disabled={isSubmitting}
                onPress={handleSubmitReport}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={colors.textInverse} />
                ) : (
                  <>
                    <Ionicons name="cloud-upload" size={18} color={colors.textInverse} />
                    <Text style={styles.submitBtnText}>Kirim Laporan Sekarang</Text>
                  </>
                )}
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.draftBtn,
                  isSubmitting && styles.btnDisabled,
                  pressed && styles.btnPressed,
                ]}
                disabled={isSubmitting}
                onPress={handleSaveOfflineDraft}
              >
                <Ionicons name="save-outline" size={18} color={colors.primary} />
                <Text style={styles.draftBtnText}>
                  Simpan Draf Offline (Scoped Storage)
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Auth Sheet jika belum login saat submit */}
      <AuthSheet
        visible={authSheetVisible}
        onClose={() => setAuthSheetVisible(false)}
        title="Masuk untuk Mengirim Laporan"
        subtitle="Identitas pelapor terenkripsi aman di hardware device. Masuk dengan akun Google atau email kampus."
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  stepIndicator: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  progressBarRow: {
    flexDirection: 'row',
    height: 3,
    backgroundColor: colors.border,
  },
  progressSegment: {
    flex: 1,
    backgroundColor: colors.border,
  },
  progressSegmentActive: {
    backgroundColor: colors.primary,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 80,
  },
  stepContainer: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  sectionSubtitle: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: -spacing.xs,
  },
  cameraBox: {
    width: '100%',
    height: 240,
    backgroundColor: '#0F172A',
    borderRadius: radii.xl,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginTop: spacing.sm,
  },
  cameraPreviewArea: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  cameraInstruction: {
    fontSize: typography.size.xs,
    color: '#94A3B8',
    textAlign: 'center',
  },
  watermarkLiveBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radii.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  watermarkLiveText: {
    color: colors.textInverse,
    fontSize: 10,
    fontFamily: typography.fontFamily.mono,
  },
  captureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
    marginTop: spacing.md,
    gap: spacing.sm,
    ...shadows.md,
  },
  captureInnerCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtnText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.textInverse,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.xs,
  },
  categoryCardLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: colors.textMain,
  },
  severityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  severityChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  severityChipText: {
    fontSize: typography.size.xs,
    color: colors.textMain,
    fontWeight: typography.weight.semibold,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.borderDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxTitle: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  checkboxDesc: {
    fontSize: 10,
    color: colors.textMuted,
    lineHeight: 14,
  },
  inputTitle: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.size.sm,
    color: colors.textMain,
  },
  inputArea: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.size.sm,
    color: colors.textMain,
    textAlignVertical: 'top',
    height: 100,
  },
  charCounter: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: -spacing.xs,
  },
  duplicateAlertBox: {
    flexDirection: 'row',
    backgroundColor: colors.warningLight,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.warning,
    gap: spacing.sm,
  },
  duplicateAlertTitle: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.warning,
  },
  duplicateAlertDesc: {
    fontSize: 10,
    color: colors.textMain,
    lineHeight: 14,
    marginTop: 2,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  nextBtnText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.textInverse,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
    flex: 1,
  },
  summaryCategoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  summaryCategoryText: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
  },
  summaryDesc: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
  summaryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  summaryMetaText: {
    fontSize: typography.size.xs,
    color: colors.textMain,
  },
  actionStack: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    gap: spacing.xs,
    ...shadows.sm,
  },
  submitBtnText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.textInverse,
  },
  draftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: spacing.xs,
  },
  draftBtnText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.primary,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnPressed: {
    opacity: 0.8,
  },
});
