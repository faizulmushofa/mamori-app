import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { colors, spacing, radii, typography, shadows } from '../../lib/tokens';

/**
 * Layar Tab 4: Profil & Hardware Secure Store (Pertemuan 10 & PRD §4, F-91)
 */
export default function ProfileScreen() {
  const [activeRole, setActiveRole] = useState<'mahasiswa' | 'k3' | 'warden'>('mahasiswa');

  const userProfile = {
    nama: 'Rani Alawiyah',
    identitas: 'NIM: 20220140025 • Fak. Teknik',
    email: 'rani.a@umy.ac.id',
    peran: activeRole === 'mahasiswa' ? 'Mahasiswa (Pelapor Aktif)' : 'Floor Warden Gedung B',
    xp: 280,
    reputasi: '98% (Sangat Terpercaya)',
    totalLaporan: 7,
    laporanSelesai: 4,
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Profil & Kredensial Pengguna</Text>
        <Text style={styles.headerSub}>
          Pertemuan 10 • Hardware-Backed Secure Storage (`expo-secure-store`)
        </Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>RA</Text>
          </View>
          <View style={styles.avatarMeta}>
            <Text style={styles.userName}>{userProfile.nama}</Text>
            <Text style={styles.userNim}>{userProfile.identitas}</Text>
            <View style={styles.roleTag}>
              <Text style={styles.roleTagText}>🛡️ {userProfile.peran}</Text>
            </View>
          </View>
        </View>

        <View style={styles.securityVaultBox}>
          <Text style={styles.vaultIcon}>🔐</Text>
          <View style={styles.vaultTextGroup}>
            <Text style={styles.vaultTitle}>
              Enkripsi Hardware-Backed Aktif
            </Text>
            <Text style={styles.vaultDesc}>
              Token autentikasi & session tersimpan aman di Android Keystore / iOS
              Secure Enclave via `expo-secure-store` (PRD F-91).
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCell}>
            <Text style={styles.statNumber}>{userProfile.xp}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statNumber}>{userProfile.totalLaporan}</Text>
            <Text style={styles.statLabel}>Laporan</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={[styles.statNumber, { color: colors.success }]}>
              {userProfile.laporanSelesai}
            </Text>
            <Text style={styles.statLabel}>Terselesaikan</Text>
          </View>
        </View>
      </View>

      <View style={styles.roleSwitchCard}>
        <Text style={styles.switchTitle}>Uji Peran Pengguna (PRD §4):</Text>
        <View style={styles.roleButtonGroup}>
          <Pressable
            style={[
              styles.roleChoiceBtn,
              activeRole === 'mahasiswa' && styles.roleChoiceActive,
            ]}
            onPress={() => setActiveRole('mahasiswa')}
          >
            <Text
              style={[
                styles.roleChoiceText,
                activeRole === 'mahasiswa' && styles.roleChoiceTextActive,
              ]}
            >
              Mahasiswa
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.roleChoiceBtn,
              activeRole === 'warden' && styles.roleChoiceActive,
            ]}
            onPress={() => setActiveRole('warden')}
          >
            <Text
              style={[
                styles.roleChoiceText,
                activeRole === 'warden' && styles.roleChoiceTextActive,
              ]}
            >
              Floor Warden
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
    gap: spacing.lg,
  },
  topHeader: {
    marginBottom: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  headerSub: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarInitial: {
    color: colors.textInverse,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  avatarMeta: {
    flex: 1,
  },
  userName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  userNim: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  roleTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  roleTagText: {
    fontSize: typography.size.xs,
    color: colors.primary,
    fontWeight: typography.weight.semibold,
  },
  securityVaultBox: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  vaultIcon: {
    fontSize: 20,
  },
  vaultTextGroup: {
    flex: 1,
  },
  vaultTitle: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  vaultDesc: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  statLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  roleSwitchCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  switchTitle: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  roleButtonGroup: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  roleChoiceBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
  },
  roleChoiceActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleChoiceText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: colors.textMain,
  },
  roleChoiceTextActive: {
    color: colors.textInverse,
  },
});
