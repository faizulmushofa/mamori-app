import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, typography, shadows } from '../../constants/tokens';
import { useAuth } from '../../hooks/useAuth';
import { checkLocationPermission, checkCameraPermission } from '../../lib/actions/permission.actions';
import { AuthSheet } from '../../components/auth/AuthSheet';

/**
 * Tab 5: Profil, Validasi Kampus & Pengaturan (PRD F-91 & F-92)
 */
export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, isAuthenticated, signOut, isLoading } = useAuth();

  const [authSheetVisible, setAuthSheetVisible] = useState<boolean>(false);
  const [cameraPermGranted, setCameraPermGranted] = useState<boolean>(false);
  const [locationPermGranted, setLocationPermGranted] = useState<boolean>(false);

  // State Verifikasi Kampus untuk Akun Google Pribadi
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const [inputNim, setInputNim] = useState<string>('');
  const [inputCampusEmail, setInputCampusEmail] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Audit Izin Hardware JIT
  useEffect(() => {
    let isMounted = true;
    Promise.all([checkLocationPermission(), checkCameraPermission()]).then(
      ([loc, cam]) => {
        if (isMounted) {
          setLocationPermGranted(loc === 'granted');
          setCameraPermGranted(cam === 'granted');
        }
      }
    );
    return () => {
      isMounted = false;
    };
  }, []);

  const handleVerifyCampus = () => {
    if (!inputNim.trim() || !inputCampusEmail.trim()) {
      Alert.alert('Perhatian', 'NIM dan Email Kampus wajib diisi.');
      return;
    }

    if (!inputCampusEmail.includes('.ac.id')) {
      Alert.alert('Validasi Gagal', 'Gunakan email resmi kampus (contoh: nim@student.ac.id).');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setShowVerifyModal(false);
      Alert.alert(
        'Verifikasi Berhasil',
        `Akun Anda berhasil ditautkan dengan NIM ${inputNim}. Status Anda sekarang Mahasiswa Terverifikasi.`
      );
    }, 1000);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Keluar dari Akun?',
      'Sesi login Anda akan dihapus dari penyimpanan terenkripsi hardware (SecureStore).',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. Header Profil */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil & Pengaturan</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Kartu Identitas Pengguna */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={32} color={colors.primary} />
          </View>

          <View style={styles.profileMeta}>
            <Text style={styles.userName}>
              {profile ? profile.name : 'Pengguna Tamu'}
            </Text>
            <Text style={styles.userEmail}>
              {profile ? profile.email : 'Belum masuk dengan akun kampus'}
            </Text>

            <View style={styles.roleBadgeRow}>
              {isAuthenticated ? (
                profile?.isCampusVerified ? (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
                    <Text style={styles.verifiedBadgeText}>Mahasiswa Terverifikasi</Text>
                  </View>
                ) : (
                  <View style={styles.unverifiedBadge}>
                    <Ionicons name="alert-circle" size={13} color={colors.warning} />
                    <Text style={styles.unverifiedBadgeText}>Akun Publik (Belum Verifikasi)</Text>
                  </View>
                )
              ) : (
                <View style={styles.guestBadge}>
                  <Text style={styles.guestBadgeText}>Mode Tamu (Guest)</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* 3. Kartu Validasi Kampus (Khusus Akun Google Pribadi / Publik) */}
        {isAuthenticated && !profile?.isCampusVerified && (
          <View style={styles.campusVerifyBox}>
            <View style={styles.verifyTitleRow}>
              <Ionicons name="school-outline" size={20} color={colors.primary} />
              <Text style={styles.verifyTitle}>Tautkan Identitas Mahasiswa</Text>
            </View>
            <Text style={styles.verifyDesc}>
              Anda masuk dengan akun Google pribadi. Tautkan NIM Anda untuk mendapatkan
              hak suara penuh dan prioritas tindak lanjut laporan.
            </Text>

            {showVerifyModal ? (
              <View style={styles.verifyForm}>
                <TextInput
                  style={styles.verifyInput}
                  placeholder="Nomor Induk Mahasiswa (NIM)"
                  placeholderTextColor={colors.textMuted}
                  value={inputNim}
                  onChangeText={setInputNim}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.verifyInput}
                  placeholder="Email Kampus (@student.ac.id)"
                  placeholderTextColor={colors.textMuted}
                  value={inputCampusEmail}
                  onChangeText={setInputCampusEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Pressable
                  style={({ pressed }) => [
                    styles.verifySubmitBtn,
                    pressed && styles.btnPressed,
                  ]}
                  onPress={handleVerifyCampus}
                >
                  <Text style={styles.verifySubmitText}>
                    {isVerifying ? 'Memvalidasi...' : 'Verifikasi Sekarang'}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  styles.startVerifyBtn,
                  pressed && styles.btnPressed,
                ]}
                onPress={() => setShowVerifyModal(true)}
              >
                <Text style={styles.startVerifyText}>Mulai Verifikasi NIM</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.primary} />
              </Pressable>
            )}
          </View>
        )}

        {/* 4. Audit Izin Hardware Just-In-Time (PRD F-92) */}
        <Text style={styles.sectionHeader}>Audit Izin Hardware (JIT)</Text>
        <View style={styles.settingsGroup}>
          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="location-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Izin Lokasi (LBS & Geofencing)</Text>
              <Text style={styles.settingStatus}>
                {locationPermGranted ? 'Diizinkan (Aktif)' : 'Belum Diizinkan'}
              </Text>
            </View>
            <Ionicons
              name={locationPermGranted ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={locationPermGranted ? colors.success : colors.danger}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="camera-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Izin Kamera Langsung</Text>
              <Text style={styles.settingStatus}>
                {cameraPermGranted ? 'Diizinkan (Aktif)' : 'Belum Diizinkan'}
              </Text>
            </View>
            <Ionicons
              name={cameraPermGranted ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={cameraPermGranted ? colors.success : colors.danger}
            />
          </View>
        </View>

        {/* 5. Aksi Masuk / Keluar */}
        <Text style={styles.sectionHeader}>Akun & Keamanan</Text>
        <View style={styles.settingsGroup}>
          {isAuthenticated ? (
            <Pressable
              style={({ pressed }) => [styles.logoutItem, pressed && styles.btnPressed]}
              onPress={handleSignOut}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.danger} />
              <Text style={styles.logoutText}>Keluar dari Akun</Text>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.loginItem, pressed && styles.btnPressed]}
              onPress={() => setAuthSheetVisible(true)}
            >
              <Ionicons name="log-in-outline" size={20} color={colors.primary} />
              <Text style={styles.loginItemText}>Masuk dengan Akun Kampus</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      {/* Auth Sheet Modal */}
      <AuthSheet
        visible={authSheetVisible}
        onClose={() => setAuthSheetVisible(false)}
        title="Masuk ke Akun MAMORI"
        subtitle="Masuk dengan Google atau Email Kampus untuk mengakses seluruh fitur pelaporan."
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
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 80,
    gap: spacing.md,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileMeta: {
    flex: 1,
  },
  userName: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  userEmail: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  roleBadgeRow: {
    marginTop: spacing.xs,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.xs,
    gap: 4,
    alignSelf: 'flex-start',
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  unverifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.xs,
    gap: 4,
    alignSelf: 'flex-start',
  },
  unverifiedBadgeText: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
    color: colors.warning,
  },
  guestBadge: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.xs,
    alignSelf: 'flex-start',
  },
  guestBadgeText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  campusVerifyBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: spacing.xs,
  },
  verifyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  verifyTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  verifyDesc: {
    fontSize: typography.size.xs,
    color: colors.textMain,
    lineHeight: 18,
  },
  startVerifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    marginTop: spacing.xs,
  },
  startVerifyText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  verifyForm: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  verifyInput: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.size.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  verifySubmitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  verifySubmitText: {
    color: colors.textInverse,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.xs,
  },
  sectionHeader: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing.sm,
    marginLeft: spacing.xs,
  },
  settingsGroup: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  settingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textMain,
  },
  settingStatus: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  logoutText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.danger,
  },
  loginItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  loginItemText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  btnPressed: {
    opacity: 0.8,
  },
});
