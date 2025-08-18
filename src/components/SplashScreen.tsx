/**
 * Splash Screen Component
 * Shows EZ Clear logo on app startup
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        {/* Logo Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="flash" size={48} color="white" />
        </View>

        {/* App Name */}
        <Text style={styles.logoText}>
          EZ Clear
        </Text>

        {/* Tagline */}
        <Text style={styles.tagline}>
          Find trusted professionals
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
