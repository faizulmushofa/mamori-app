import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors, typography } from '../../lib/tokens';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: typography.weight.medium,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Peta LBS',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🗺️</Text>,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Lapor',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>📷</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Akun',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
