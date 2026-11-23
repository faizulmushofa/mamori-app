import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../constants/tokens';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Masuk' }} />
      <Stack.Screen name="register" options={{ title: 'Daftar' }} />
    </Stack>
  );
}
