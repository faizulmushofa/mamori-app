import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radii, typography, shadows } from './lib/tokens';

// Import Screens dari app/(tabs) untuk Pertemuan 9 dan 10
import MapScreen from './app/(tabs)/index';
import ReportScreen from './app/(tabs)/report';
import ProfileScreen from './app/(tabs)/profile';

type TabKey = 'map_p9' | 'report_p10' | 'profile_p10';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('map_p9');

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
            <Text style={styles.milestoneText}>
              {activeTab === 'map_p9'
                ? 'P9: LBS'
                : activeTab === 'report_p10'
                ? 'P10: Lapor'
                : 'P10: Akun'}
            </Text>
          </View>
        </View>

        {/* Main Content Body */}
        <View style={styles.mainContent}>
          {activeTab === 'map_p9' && <MapScreen />}
          {activeTab === 'report_p10' && <ReportScreen />}
          {activeTab === 'profile_p10' && <ProfileScreen />}
        </View>

        {/* Bottom Tab Bar (Navigation Shell) */}
        <View style={styles.tabBar}>
          <Pressable
            style={[
              styles.tabItem,
              activeTab === 'map_p9' && styles.tabItemActive,
            ]}
            onPress={() => setActiveTab('map_p9')}
          >
            <Text style={styles.tabIcon}>🗺️</Text>
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'map_p9' && styles.tabLabelActive,
              ]}
            >
              Peta LBS
            </Text>
            <Text style={styles.subPill}>P9</Text>
          </Pressable>

          <Pressable
            style={[
              styles.tabItem,
              activeTab === 'report_p10' && styles.tabItemActive,
            ]}
            onPress={() => setActiveTab('report_p10')}
          >
            <Text style={styles.tabIcon}>📷</Text>
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'report_p10' && styles.tabLabelActive,
              ]}
            >
              Lapor
            </Text>
            <Text style={styles.subPill}>P10</Text>
          </Pressable>

          <Pressable
            style={[
              styles.tabItem,
              activeTab === 'profile_p10' && styles.tabItemActive,
            ]}
            onPress={() => setActiveTab('profile_p10')}
          >
            <Text style={styles.tabIcon}>👤</Text>
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'profile_p10' && styles.tabLabelActive,
              ]}
            >
              Akun
            </Text>
            <Text style={styles.subPill}>P10</Text>
          </Pressable>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    ...shadows.lg,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
  },
  tabItemActive: {
    backgroundColor: colors.primaryLight,
  },
  tabIcon: {
    fontSize: 18,
  },
  tabLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: typography.weight.medium,
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: typography.weight.bold,
  },
  subPill: {
    fontSize: 8,
    color: colors.textLight,
    fontWeight: typography.weight.semibold,
  },
});
