/**
 * Root Layout for EZ Clear Native App
 * Sets up navigation, theme, and global providers
 */

// CRITICAL: These imports must be first for reanimated/gesture-handler to work
import 'react-native-gesture-handler';
import 'react-native-reanimated';

// Global error handler for debugging
if (global.ErrorUtils?.setGlobalHandler) {
  const prev = global.ErrorUtils.getGlobalHandler?.();
  global.ErrorUtils.setGlobalHandler((e, isFatal) => {
    console.log('🔴 GLOBAL JS ERROR:', e?.message, e?.stack, { isFatal });
    prev?.(e, isFatal);
  });
}

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Providers
import { ThemeProvider } from '../src/context/ThemeProvider';
import { AuthProvider } from '../src/context/AuthContext';
// import { ErrorBoundary } from '../src/components/ErrorBoundary';
import i18n from '../i18n';
import { applyLanguage, loadInitialLanguage } from '../i18n/helpers';
import { I18nextProvider } from 'react-i18next';

export default function RootLayout() {

  useEffect(() => {
    (async () => {
      const initial = await loadInitialLanguage();
      if (initial && initial !== i18n.language) {
        await i18n.changeLanguage(initial);
        await applyLanguage(initial);
      }
    })();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <I18nextProvider i18n={i18n}>
              <StatusBar style="light" backgroundColor="#0A0A0B" />
              {/* Remount tree on language change to update headers and static labels */}
              <React.Fragment key={i18n.language}>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(tabs)" />
                </Stack>
              </React.Fragment>
            </I18nextProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
