import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, typography, shadows } from '../../constants/tokens';
import { supabase } from '../../lib/supabase';

/**
 * Layar Masuk / Autentikasi Pengguna (Milestone 2 & PRD F-91)
 * Token & session dienkripsi di hardware expo-secure-store.
 */
export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleEmailSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Email dan kata sandi wajib diisi.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message || 'Gagal masuk. Periksa kembali kredensial Anda.');
        return;
      }

      router.replace('/(tabs)');
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      // Inisiasi OAuth Google via Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'mamori://auth/callback',
        },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      // Jika URL callback tersedia, Expo Linking menangani deep link
      if (data?.url) {
        Alert.alert(
          'Google Sign-In',
          'Mengarahkan ke akun Google untuk otentikasi aman...'
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menginisiasi Google OAuth.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header Branding */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="shield-checkmark" size={32} color={colors.textInverse} />
          </View>
          <Text style={styles.brandTitle}>MAMORI</Text>
          <Text style={styles.brandSubtitle}>
            Platform Kesiapsiagaan & Pelaporan Risiko Kampus
          </Text>
        </View>

        {/* 2. Error Banner */}
        {errorMessage && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* 3. Form Input */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Kampus / Akun</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.textInput}
                placeholder="nama@student.ac.id"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Kata Sandi</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable
                onPress={() => setShowPassword((prev) => !prev)}
                hitSlop={8}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={colors.textMuted}
                />
              </Pressable>
            </View>
          </View>

          {/* Tombol Masuk Email */}
          <Pressable
            style={({ pressed }) => [
              styles.signInBtn,
              isLoading && styles.btnDisabled,
              pressed && styles.btnPressed,
            ]}
            disabled={isLoading}
            onPress={handleEmailSignIn}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <Text style={styles.signInBtnText}>Masuk ke Akun</Text>
            )}
          </Pressable>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ATAU</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Tombol Masuk Google */}
          <Pressable
            style={({ pressed }) => [
              styles.googleBtn,
              isLoading && styles.btnDisabled,
              pressed && styles.btnPressed,
            ]}
            disabled={isLoading}
            onPress={handleGoogleSignIn}
          >
            <Ionicons name="logo-google" size={18} color="#EA4335" />
            <Text style={styles.googleBtnText}>Lanjut dengan Google</Text>
          </Pressable>
        </View>

        {/* 4. Footer Links */}
        <View style={styles.footer}>
          <View style={styles.registerPromptRow}>
            <Text style={styles.footerPrompt}>Belum terdaftar? </Text>
            <Pressable onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.footerLink}>Daftar Mahasiswa Baru</Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.guestLinkBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.guestLinkText}>Tetap Jelajahi sebagai Tamu</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  brandTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.primary,
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  errorText: {
    fontSize: typography.size.xs,
    color: colors.danger,
    flex: 1,
  },
  formContainer: {
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  inputLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.size.sm,
    color: colors.textMain,
  },
  signInBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginTop: spacing.xs,
    ...shadows.sm,
  },
  signInBtnText: {
    color: colors.textInverse,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.sm,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs,
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: typography.weight.semibold,
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
    color: colors.textMain,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  registerPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerPrompt: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  footerLink: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  guestLinkBtn: {
    paddingVertical: spacing.xs,
  },
  guestLinkText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnPressed: {
    opacity: 0.8,
  },
});
