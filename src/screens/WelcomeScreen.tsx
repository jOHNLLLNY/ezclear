/**
 * Welcome Screen with Demo Access
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    // Navigate to account type selection
    navigation.navigate('Auth' as never);
  };

  const handleSkipToDemo = () => {
    // Skip authentication and go directly to main app
    navigation.navigate('Main' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoSection}>
        <View style={styles.logoContainer}>
          <Ionicons name="flash" size={48} color={Colors.secondary[500]} />
        </View>
        <Text style={styles.logoText}>EZ Clear</Text>
        <Text style={styles.tagline}>Find trusted professionals</Text>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>
          Connect with skilled{'\n'}contractors and{'\n'}service providers
        </Text>
        <Text style={styles.heroSubtitle}>
          Whether you need home repairs, cleaning services, or professional help, 
          EZ Clear connects you with trusted local professionals.
        </Text>
      </View>

      {/* Buttons Section */}
      <View style={styles.buttonsSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>

        {/* Demo Button - Only in development */}
        {__DEV__ && (
          <TouchableOpacity
            style={styles.demoButton}
            onPress={handleSkipToDemo}
            activeOpacity={0.8}
          >
            <Text style={styles.demoButtonText}>Skip to Demo</Text>
            <Ionicons name="play" size={16} color={Colors.secondary[500]} />
          </TouchableOpacity>
        )}

        {/* Legal Text */}
        <View style={styles.legalContainer}>
          <Text style={styles.legalText}>
            By continuing, you agree to our{' '}
            <Text style={styles.legalLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: height * 0.1,
    paddingBottom: Spacing.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.secondary[500] + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  logoText: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.dark.textSecondary,
  },
  heroSection: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.dark.text,
    textAlign: 'center',
    lineHeight: Typography.fontSize['2xl'] * 1.3,
    marginBottom: Spacing.lg,
  },
  heroSubtitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.base * 1.6,
    paddingHorizontal: Spacing.md,
  },
  buttonsSection: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  primaryButton: {
    backgroundColor: Colors.secondary[500],
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  primaryButtonText: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.dark.text,
    marginRight: Spacing.sm,
  },
  demoButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.secondary[500],
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  demoButtonText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.secondary[500],
    marginRight: Spacing.xs,
  },
  legalContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  legalText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.sm * 1.5,
  },
  legalLink: {
    color: Colors.secondary[500],
  },
});
