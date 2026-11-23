import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../constants/tokens';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      {/* Tab 1 (Paling Kiri): Lini Masa / Postingan ala IG & Quora */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'newspaper' : 'newspaper-outline'}
              size={22}
              color={color as string}
            />
          ),
        }}
      />

      {/* Tab 2 (Kedua Kiri): Peta LBS Interaktif */}
      <Tabs.Screen
        name="map"
        options={{
          title: 'Peta',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'map' : 'map-outline'}
              size={22}
              color={color as string}
            />
          ),
        }}
      />

      {/* Tab 3 (Tengah): Tombol Kamera Besar Menonjol ala BRImo */}
      <Tabs.Screen
        name="report"
        options={{
          title: 'Lapor',
          tabBarButton: (props) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Lapor masalah kampus baru"
              onPress={props.onPress}
              style={styles.elevatedButtonContainer}
            >
              <View style={styles.elevatedButtonCircle}>
                <Ionicons name="camera" size={26} color={colors.textInverse} />
              </View>
              <Text style={styles.elevatedButtonLabel}>Lapor</Text>
            </Pressable>
          ),
        }}
      />

      {/* Tab 4 (Keempat Kiri): Status Pelaporan Saya & Draf */}
      <Tabs.Screen
        name="my-reports"
        options={{
          title: 'Laporan',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'document-text' : 'document-text-outline'}
              size={22}
              color={color as string}
            />
          ),
        }}
      />

      {/* Tab 5 (Paling Kanan): Profil & Pengaturan */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={22}
              color={color as string}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
    position: 'relative',
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: typography.weight.medium,
    marginTop: 2,
  },
  elevatedButtonContainer: {
    top: -16,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  elevatedButtonCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 8,
  },
  elevatedButtonLabel: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
    color: colors.primary,
    marginTop: 2,
  },
});
