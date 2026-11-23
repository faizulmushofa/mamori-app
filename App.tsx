import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radii, typography, shadows } from './constants/tokens';

// Import Screen Pertemuan 9: Peta LBS
import MapScreen from './app/(tabs)/index';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.surface}
          translucent={false}
        />

        {/* Global App Header */}
        <View style={styles.appHeader}>
          <View style={styles.brandGroup}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>守</Text>
            </View>
            <View>
              <Text style={styles.brandTitle}>MAMORI</Text>
              <Text style={styles.brandSubtitle}>
                Kesiapsiagaan & Pelaporan Kampus (SDG 11)
              </Text>
            </View>
          </View>

          <View style={styles.milestoneIndicator}>
            <Text style={styles.milestoneText}>P9: LBS & Map</Text>
          </View>
        </View>

        {/* Main Content Body */}
        <View style={styles.mainContent}>
          <MapScreen />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.sm,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: colors.textInverse,
    fontSize: 18,
    fontWeight: typography.weight.bold,
  },
  brandTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.textMain,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 9,
    color: colors.textMuted,
  },
  milestoneIndicator: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  milestoneText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: typography.weight.bold,
  },
  mainContent: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
