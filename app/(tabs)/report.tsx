import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, radii, typography, shadows } from '../../lib/tokens';
import {
  CATEGORY_METADATA,
  SEVERITY_METADATA,
  type IncidentCategory,
  type IncidentSeverity,
} from '../../lib/types';
import { CAMPUS_CENTER } from '../../lib/mockIncidents';
import { WatermarkCameraPreview } from '../../components/report/WatermarkCameraPreview';
import { RuntimePermissionModal } from '../../components/report/RuntimePermissionModal';

/**
 * Layar Tab 2: Wizard Form Pelaporan 4-Langkah (Pertemuan 10 & PRD F-01 s/d F-06, F-09, F-90)
 */
export default function ReportScreen() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<IncidentCategory>('bencana');
  const [selectedSeverity, setSelectedSeverity] =
    useState<IncidentSeverity>('tinggi');
  const [evacuationBarrier, setEvacuationBarrier] = useState(true);
  const [description, setDescription] = useState(
    'Lampu tangga darurat lantai 2 menuju lantai 1 gedung B mati total, gelap saat malam.'
  );

  const [permModalVisible, setPermModalVisible] = useState(false);
  const [permType, setPermType] = useState<'camera' | 'location' | 'storage'>('camera');

  const maxChars = 280;
  const remainingChars = maxChars - description.length;

  const handleSaveDraftScopedStorage = () => {
    Alert.alert(
      '📁 Draf Tersimpan di Scoped Storage',
      'Foto watermark dan data form berhasil disimpan ke documentDirectory (expo-file-system) (F-06, F-90).'
    );
  };

  const handleSubmitReport = () => {
    Alert.alert(
      '🎉 Laporan Berhasil Dikirim!',
      'Status: DILAPORKAN. Pelapor akan menerima notifikasi setiap ada pembaruan status (PRD F-30, F-32).'
    );
    router.push('/(tabs)/feed');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.wizardHeader}>
        <View style={styles.headerTopRow}>
          <Pressable onPress={() => router.push('/(tabs)')} style={styles.cancelLink}>
            <Text style={styles.cancelLinkText}>✕ Batal</Text>
          </Pressable>
          <Text style={styles.wizardTitle}>Buat Laporan Baru</Text>
          <Text style={styles.stepBadge}>Langkah {currentStep} dari 4</Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[styles.progressSegment, currentStep >= 1 && styles.segmentActive]}
          />
          <View
            style={[styles.progressSegment, currentStep >= 2 && styles.segmentActive]}
          />
          <View
            style={[styles.progressSegment, currentStep >= 3 && styles.segmentActive]}
          />
          <View
            style={[styles.progressSegment, currentStep >= 4 && styles.segmentActive]}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Langkah 1: Bukti Foto Langsung</Text>
            <Text style={styles.stepDesc}>
              Ambil foto langsung dari kamera. Watermark koordinat GPS dan waktu
              otomatis ditanam permanen ke dalam foto (PRD F-01, F-09).
            </Text>

            <WatermarkCameraPreview
              coordinates={CAMPUS_CENTER}
              timestamp="2026-11-23 14:20:10 WIB"
              photoCaptured={photoCaptured}
              onCapturePhoto={() => setPhotoCaptured(true)}
              onRetakePhoto={() => setPhotoCaptured(false)}
            />

            {!photoCaptured && (
              <Pressable
                style={styles.jitPermButton}
                onPress={() => {
                  setPermType('camera');
                  setPermModalVisible(true);
                }}
              >
                <Text style={styles.jitPermText}>
                  🛡️ Pelajari Izin Privasi Kamera & UU PDP
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {currentStep === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Langkah 2: Klasifikasi Masalah</Text>
            <Text style={styles.stepDesc}>
              Pilih kategori yang paling sesuai dan tingkat keparahan risiko fasilitas.
            </Text>

            <Text style={styles.fieldLabel}>Kategori Masalah:</Text>
            <View style={styles.categoryGrid}>
              {(
                Object.keys(CATEGORY_METADATA) as IncidentCategory[]
              ).map((cat) => {
                const meta = CATEGORY_METADATA[cat];
                const isSelected = selectedCategory === cat;
                return (
                  <Pressable
                    key={cat}
                    style={[
                      styles.categoryCard,
                      isSelected && {
                        borderColor: meta.color,
                        backgroundColor: meta.bgColor,
                      },
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text style={styles.catEmoji}>
                      {cat === 'bencana'
                        ? '🚨'
                        : cat === 'drainase'
                        ? '🌊'
                        : cat === 'listrik'
                        ? '⚡'
                        : cat === 'pohon'
                        ? '🌳'
                        : cat === 'kebersihan'
                        ? '🧹'
                        : cat === 'fasilitas'
                        ? '🏢'
                        : '📌'}
                    </Text>
                    <Text
                      style={[
                        styles.catLabel,
                        isSelected && { color: meta.color, fontWeight: '700' },
                      ]}
                    >
                      {meta.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.fieldLabel, { marginTop: spacing.lg }]}>
              Tingkat Keparahan:
            </Text>
            <View style={styles.severityRow}>
              {(['rendah', 'sedang', 'tinggi'] as IncidentSeverity[]).map((sev) => {
                const meta = SEVERITY_METADATA[sev];
                const isSelected = selectedSeverity === sev;
                return (
                  <Pressable
                    key={sev}
                    style={[
                      styles.sevCard,
                      isSelected && {
                        borderColor: meta.color,
                        backgroundColor: meta.bgColor,
                      },
                    ]}
                    onPress={() => setSelectedSeverity(sev)}
                  >
                    <Text
                      style={[
                        styles.sevLabel,
                        isSelected && { color: meta.color, fontWeight: '700' },
                      ]}
                    >
                      {meta.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.evacToggleCard}>
              <View style={styles.evacToggleInfo}>
                <Text style={styles.evacToggleTitle}>
                  🚨 Menghalangi Jalur Evakuasi?
                </Text>
                <Text style={styles.evacToggleDesc}>
                  Tandai jika masalah ini memblokir tangga darurat, pintu darurat,
                  atau akses ambulans (PRD F-05).
                </Text>
              </View>
              <Switch
                value={evacuationBarrier}
                onValueChange={setEvacuationBarrier}
                trackColor={{ false: '#CBD5E1', true: colors.danger }}
                thumbColor={colors.surface}
              />
            </View>
          </View>
        )}

        {currentStep === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Langkah 3: Deskripsi Singkat</Text>
            <Text style={styles.stepDesc}>
              Jelaskan lokasi spesifik dan kondisi bahaya secara objektif.
            </Text>

            <View style={styles.descInputBox}>
              <TextInput
                style={styles.descTextInput}
                multiline
                numberOfLines={5}
                maxLength={maxChars}
                value={description}
                onChangeText={setDescription}
                placeholder="Tuliskan keterangan detail laporan..."
                placeholderTextColor={colors.textLight}
              />
              <Text
                style={[
                  styles.charCounter,
                  remainingChars < 20 && { color: colors.danger },
                ]}
              >
                Sisa karakter: {remainingChars} / {maxChars}
              </Text>
            </View>

            <View style={styles.guideCard}>
              <Text style={styles.guideTitle}>💡 Tips Pelaporan Amanah:</Text>
              <Text style={styles.guideText}>
                • Sebutkan nama gedung dan lantai secara spesifik.{'\n'}
                • Hindari menyertakan data pribadi orang lain.{'\n'}
                • Laporan yang berujung selesai mendapat akumulasi XP tertinggi (PRD §5).
              </Text>
            </View>
          </View>
        )}

        {currentStep === 4 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Langkah 4: Review & Pengiriman</Text>
            <Text style={styles.stepDesc}>
              Periksa ringkasan laporan sebelum dikirim ke publik.
            </Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Kategori:</Text>
                <Text style={styles.summaryValue}>
                  {CATEGORY_METADATA[selectedCategory].label}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Keparahan:</Text>
                <Text style={styles.summaryValue}>
                  {SEVERITY_METADATA[selectedSeverity].label}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Jalur Evakuasi:</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    evacuationBarrier && { color: colors.danger, fontWeight: '700' },
                  ]}
                >
                  {evacuationBarrier ? '⚠️ YA (Terhalang)' : 'Tidak'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Koordinat GPS:</Text>
                <Text style={styles.summaryValue}>
                  {CAMPUS_CENTER.latitude.toFixed(5)}, {CAMPUS_CENTER.longitude.toFixed(5)}
                </Text>
              </View>
              <View style={styles.summaryDescBox}>
                <Text style={styles.summaryLabel}>Deskripsi:</Text>
                <Text style={styles.summaryDescText}>{description}</Text>
              </View>
            </View>

            <View style={styles.storageInfoBox}>
              <Text style={styles.storageInfoIcon}>📁</Text>
              <View style={styles.storageInfoTextGroup}>
                <Text style={styles.storageInfoTitle}>
                  Scoped Storage Document Vault
                </Text>
                <Text style={styles.storageInfoDesc}>
                  Foto dan draf tersimpan di `documentDirectory`. Tetap aman saat
                  offline (F-06, F-90).
                </Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.saveDraftBtn,
                pressed && styles.btnPressed,
              ]}
              onPress={handleSaveDraftScopedStorage}
            >
              <Text style={styles.saveDraftBtnText}>
                💾 Simpan Draf ke Scoped Storage
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <View style={styles.footerBar}>
        {currentStep > 1 && (
          <Pressable
            style={({ pressed }) => [
              styles.prevBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={() => setCurrentStep((prev) => (prev - 1) as any)}
          >
            <Text style={styles.prevBtnText}>← Sebelumnya</Text>
          </Pressable>
        )}

        {currentStep < 4 ? (
          <Pressable
            style={({ pressed }) => [
              styles.nextBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={() => {
              if (currentStep === 1 && !photoCaptured) {
                Alert.alert(
                  'Ambil Foto Terlebih Dahulu',
                  'Sesuai PRD F-01, setiap laporan wajib memiliki bukti foto langsung.'
                );
                return;
              }
              setCurrentStep((prev) => (prev + 1) as any);
            }}
          >
            <Text style={styles.nextBtnText}>Lanjut ke Langkah {currentStep + 1} →</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.submitBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={handleSubmitReport}
          >
            <Text style={styles.submitBtnText}>🚀 Kirim Laporan Sekarang</Text>
          </Pressable>
        )}
      </View>

      <RuntimePermissionModal
        visible={permModalVisible}
        type={permType}
        onAllow={() => {
          setPermModalVisible(false);
          setPhotoCaptured(true);
        }}
        onDeny={() => setPermModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  wizardHeader: {
    backgroundColor: colors.surface,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.sm,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cancelLink: {
    paddingVertical: 2,
  },
  cancelLinkText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  wizardTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  stepBadge: {
    fontSize: typography.size.xs,
    color: colors.primary,
    fontWeight: typography.weight.semibold,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  progressBar: {
    flexDirection: 'row',
    gap: spacing.xs,
    height: 4,
  },
  progressSegment: {
    flex: 1,
    backgroundColor: colors.border,
    borderRadius: radii.full,
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
  },
  stepContent: {
    gap: spacing.md,
  },
  stepTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  stepDesc: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  jitPermButton: {
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  jitPermText: {
    fontSize: typography.size.xs,
    color: colors.primary,
    fontWeight: typography.weight.semibold,
  },
  fieldLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  catLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: colors.textMain,
    textAlign: 'center',
  },
  severityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sevCard: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  sevLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: colors.textMain,
  },
  evacToggleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: spacing.md,
  },
  evacToggleInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  evacToggleTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.danger,
  },
  evacToggleDesc: {
    fontSize: typography.size.xs,
    color: colors.textMain,
    marginTop: 2,
    lineHeight: 16,
  },
  descInputBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  descTextInput: {
    fontSize: typography.size.sm,
    color: colors.textMain,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  charCounter: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  guideCard: {
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: radii.lg,
  },
  guideTitle: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.primary,
    marginBottom: 4,
  },
  guideText: {
    fontSize: typography.size.xs,
    color: colors.textMain,
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  summaryValue: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  summaryDescBox: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
  },
  summaryDescText: {
    fontSize: typography.size.xs,
    color: colors.textMain,
    marginTop: 2,
    fontStyle: 'italic',
  },
  storageInfoBox: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  storageInfoIcon: {
    fontSize: 20,
  },
  storageInfoTextGroup: {
    flex: 1,
  },
  storageInfoTitle: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  storageInfoDesc: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 14,
  },
  saveDraftBtn: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  saveDraftBtnText: {
    color: colors.textMain,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    gap: spacing.sm,
    ...shadows.lg,
  },
  prevBtn: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  prevBtnText: {
    color: colors.textMain,
    fontWeight: typography.weight.semibold,
    fontSize: typography.size.sm,
  },
  nextBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  nextBtnText: {
    color: colors.textInverse,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.sm,
  },
  submitBtn: {
    flex: 2,
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  submitBtnText: {
    color: colors.textInverse,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
  },
  btnPressed: {
    opacity: 0.85,
  },
});
