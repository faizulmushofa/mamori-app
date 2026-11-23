import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, radii, typography, shadows } from '../../lib/tokens';

/**
 * Layar Autentikasi / Login (Pertemuan 10 & PRD §4, F-91)
 */
export default function LoginScreen() {
  const [nimEmail, setNimEmail] = useState('20220140025@umy.ac.id');
  const [password, setPassword] = useState('••••••••');

  const handleLogin = () => {
    Alert.alert(
      '✓ Login Berhasil',
      'Token berhasil disimpan ke SecureStore (F-91).'
    );
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>守</Text>
        </View>
        <Text style={styles.title}>Masuk ke MAMORI</Text>
        <Text style={styles.subtitle}>
          Platform Pelaporan & Kesiapsiagaan Kampus
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>NIM atau Email Kampus</Text>
          <TextInput
            style={styles.input}
            value={nimEmail}
            onChangeText={setNimEmail}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kata Sandi</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <Pressable style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginBtnText}>Masuk & Simpan Token Sesi</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
    alignItems: 'center',
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    color: colors.textInverse,
    fontSize: 24,
    fontWeight: typography.weight.bold,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
  },
  subtitle: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  inputGroup: {
    width: '100%',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: colors.textMain,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.size.sm,
    color: colors.textMain,
  },
  loginBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  loginBtnText: {
    color: colors.textInverse,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
});
