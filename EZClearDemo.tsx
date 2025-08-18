import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from './theme';

export default function EZClearDemo() {
  const { colors, typography, spacing, radius } = theme;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
              <Ionicons name="flash" size={40} color={colors.background} />
            </View>
            
            <Text
              style={[
                styles.logoText,
                {
                  color: colors.onSurface,
                  fontSize: typography.fontSize['3xl'],
                  fontWeight: '700',
                },
              ]}
            >
              EZ Clear
            </Text>
            
            <Text
              style={[
                styles.tagline,
                {
                  color: colors.muted,
                  fontSize: typography.fontSize.lg,
                  fontWeight: '500',
                },
              ]}
            >
              Connect with trusted professionals for home services, repairs, and more.
            </Text>
          </View>

          {/* Get Started Button */}
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: colors.accent,
                borderRadius: radius.md,
              },
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color: 'white',
                  fontSize: typography.fontSize.lg,
                  fontWeight: '600',
                },
              ]}
            >
              Get Started
            </Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.signInText,
              {
                color: colors.muted,
                fontSize: typography.fontSize.base,
                fontWeight: '500',
              },
            ]}
          >
            Already have an account?{' '}
            <Text style={{ color: colors.primary, fontWeight: '600' }}>
              Sign In
            </Text>
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 64,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoText: {
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -1,
  },
  tagline: {
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 24,
    maxWidth: 400,
  },
  button: {
    width: '100%',
    maxWidth: 360,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  buttonText: {
    // styles applied inline
  },
  signInText: {
    textAlign: 'center',
  },
});
