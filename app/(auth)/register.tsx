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
 * Layar Pendaftaran Mahasiswa & Civitas Kampus Baru (Milestone 2)
 */
export default function RegisterScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState<string>('');
  const [nim, setNim] = useState<string>('');
  const [faculty, setFaculty] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [role, setRole] = useState<'student' | 'staff'>('student');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (
      !fullName.trim() ||
      !nim.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setErrorMessage('Seluruh field bertanda bintang (*) wajib diisi.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const isCampusDomain = email.includes('.ac.id');

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            nim: nim.trim(),
            faculty: faculty.trim() || 'Fakultas Umum',
            role,
            is_campus_verified: isCampusDomain,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      Alert.alert(
        'Pendaftaran Berhasil',
        'Akun Anda telah dibuat. Silakan periksa email Anda jika konfirmasi diperlukan, atau langsung masuk.',
        [
          {
            text: 'Masuk Sekarang',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
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
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.btnPressed]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textMain} />
          </Pressable>
          <Text style={styles.headerTitle}>Pendaftaran Akun</Text>
          <View style={{ width: 36 }} />
        </View>

        <Text style={styles.title}>Gabung Civitas MAMORI</Text>
        <Text style={styles.subtitle}>
          Daftarkan akun resmi untuk verifikasi laporan dan partisipasi siaga kampus.
        </Text>

        {/* Error Banner */}
        {errorMessage && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Form Input */}
        <View style={styles.formContainer}>
          {/* Pilihan Role */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Peran Kampus *</Text>
            <View style={styles.roleSelector}>
              <Pressable
                style={[
                  styles.roleOption,
                  role === 'student' && styles.roleOptionActive,
                ]}
                onPress={() => setRole('student')}
              >
                <Ionicons
                  name="school-outline"
                  size={16}
                  color={role === 'student' ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[
                    styles.roleOptionText,
                    role === 'student' && styles.roleOptionTextActive,
                  ]}
                >
                  Mahasiswa
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.roleOption,
                  role === 'staff' && styles.roleOptionActive,
                ]}
                onPress={() => setRole('staff')}
              >
                <Ionicons
                  name="briefcase-outline"
                  size={16}
                  color={role === 'staff' ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[
                    styles.roleOptionText,
                    role === 'staff' && styles.roleOptionTextActive,
                  ]}
                >
                  Staf / Pengelola
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Nama Lengkap */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nama Lengkap *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Sesuai kartu mahasiswa/identitas"
              placeholderTextColor={colors.textMuted}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* NIM / NIP */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {role === 'student' ? 'NIM (Nomor Induk Mahasiswa) *' : 'NIP / ID Staf *'}
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Contoh: 210103045"
              placeholderTextColor={colors.textMuted}
              value={nim}
              onChangeText={setNim}
              keyboardType="numeric"
            />
          </View>

          {/* Fakultas / Unit */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Fakultas / Unit Kerja</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Contoh: Fakultas Ilmu Komputer / Sarpras"
              placeholderTextColor={colors.textMuted}
              value={faculty}
              onChangeText={setFaculty}
            />
          </View>

          {/* Email Kampus */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Kampus / Aktif *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="nama@student.ac.id"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Kata Sandi */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Kata Sandi *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Minimal 6 karakter"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Konfirmasi Kata Sandi */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Konfirmasi Kata Sandi *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ulangi kata sandi"
              placeholderTextColor={colors.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          {/* Submit Button */}
          <Pressable
            style={({ pressed }) => [
              styles.signUpBtn,
              isLoading && styles.btnDisabled,
              pressed && styles.btnPressed,
            ]}
            disabled={isLoading}
            onPress={handleSignUp}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <Text style={styles.signUpBtnText}>Daftar Akun Baru</Text>
            )}
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerPrompt}>Sudah punya akun? </Text>
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.footerLink}>Masuk di sini</Text>
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.lg,
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
  roleSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  roleOptionActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  roleOptionText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: colors.textMuted,
  },
  roleOptionTextActive: {
    color: colors.primary,
    fontWeight: typography.weight.bold,
  },
  textInput: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.size.sm,
    color: colors.textMain,
    borderWidth: 1,
    borderColor: colors.border,
  },
  signUpBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.sm,
  },
  signUpBtnText: {
    color: colors.textInverse,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
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
  btnDisabled: {
    opacity: 0.6,
  },
  btnPressed: {
    opacity: 0.8,
  },
});
