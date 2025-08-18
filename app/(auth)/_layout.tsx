/**
 * Auth Layout
 * Stack navigator for authentication screens
 */

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="role-selection" />
      <Stack.Screen name="create-account" />
      <Stack.Screen name="onboarding/worker/basics" />
      <Stack.Screen name="onboarding/worker/professional" />
      <Stack.Screen name="onboarding/worker/portfolio" />
      <Stack.Screen name="onboarding/worker/availability" />
      <Stack.Screen name="onboarding/worker/review" />
      <Stack.Screen name="onboarding/hirer/basics" />
      <Stack.Screen name="onboarding/hirer/preferences" />
      <Stack.Screen name="onboarding/hirer/billing" />
      <Stack.Screen name="onboarding/hirer/review" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
