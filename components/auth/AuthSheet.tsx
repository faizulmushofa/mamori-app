import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, radii, typography, shadows } from '../../constants/tokens';

interface AuthSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  onGoogleLogin?: () => void;
}

/**
 * Modal Bottom Sheet Login Just-In-Time (Deferred Authentication)
 * Muncul saat tamu (guest) menekan tombol upvote, lapor, atau riwayat laporan.
 */
export const AuthSheet: React.FC<AuthSheetProps> = ({
  visible,
  onClose,
  title = 'Masuk untuk Melanjutkan',
  subtitle = 'Untuk menjaga validitas laporan dan konfirmasi komunitas kampus, silakan masuk ke akun Anda.',
  onGoogleLogin,
}) => {
  const router = useRouter();

  const handleEmailLogin = () => {
    onClose();
    router.push('/(auth)/login');
  };

  const handleRegister = () => {
    onClose();
    router.push('/(auth)/register');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheetContainer}>
          <View style={styles.handleBar} />

          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={28} color={colors.primary} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.buttonStack}>
            {/* 1. Google OAuth Button */}
            <Pressable
              style={({ pressed }) => [
                styles.googleBtn,
                pressed && styles.btnPressed,
              ]}
              onPress={onGoogleLogin || handleEmailLogin}
            >
              <Ionicons name="logo-google" size={18} color="#EA4335" />
              <Text style={styles.googleBtnText}>Lanjut dengan Akun Google</Text>
            </Pressable>

            {/* 2. Email Kampus Button */}
            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && styles.btnPressed,
              ]}
              onPress={handleEmailLogin}
            >
              <Ionicons name="mail" size={18} color={colors.textInverse} />
              <Text style={styles.primaryBtnText}>Masuk dengan Email Kampus</Text>
            </Pressable>

            {/* 3. Register Link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerPrompt}>Belum punya akun? </Text>
              <Pressable onPress={handleRegister} hitSlop={8}>
                <Text style={styles.registerLink}>Daftar Mahasiswa Baru</Text>
              </Pressable>
            </View>

            {/* 4. Guest Continue */}
            <Pressable
              style={({ pressed }) => [
                styles.guestBtn,
                pressed && styles.btnPressed,
              ]}
              onPress={onClose}
            >
              <Text style={styles.guestBtnText}>Tetap Jelajahi sebagai Tamu</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
    ...shadows.lg,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.borderDark,
    borderRadius: radii.full,
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  buttonStack: {
    width: '100%',
    gap: spacing.md,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderDark,
    gap: spacing.sm,
    ...shadows.sm,
  },
  googleBtnText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    gap: spacing.sm,
  },
  primaryBtnText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.textInverse,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  registerPrompt: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  registerLink: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  guestBtn: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
  },
  guestBtnText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  btnPressed: {
    opacity: 0.8,
  },
});
