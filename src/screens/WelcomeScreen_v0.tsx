/**
 * Welcome Screen - V0 Design with Gradients and Effects
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Theme
import { theme } from '../ui';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    navigation.navigate('Auth' as never);
  };

  const handleSkipToDemo = () => {
    navigation.navigate('Main' as never);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={[theme.colors.background, theme.colors.card, theme.colors.background]}
        locations={[0, 0.5, 1]}
        style={styles.backgroundGradient}
      />

      {/* Floating Elements */}
      <View style={styles.floatingElements}>
        <View style={[styles.floatingCircle, styles.circle1]} />
        <View style={[styles.floatingCircle, styles.circle2]} />
        <View style={[styles.floatingCircle, styles.circle3]} />
      </View>

      <SafeAreaView style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryLight]}
              style={styles.logoGradient}
            >
              <Ionicons name="flash" size={48} color="white" />
            </LinearGradient>
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
          {/* Primary Button with Gradient */}
          <TouchableOpacity
            style={styles.primaryButtonContainer}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryHover]}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Demo Button - Only in development */}
          {__DEV__ && (
            <TouchableOpacity
              style={styles.demoButtonContainer}
              onPress={handleSkipToDemo}
              activeOpacity={0.8}
            >
              <BlurView intensity={20} tint="dark" style={styles.demoButton}>
                <Text style={styles.demoButtonText}>Skip to Demo</Text>
                <Ionicons name="play" size={16} color={theme.colors.primary} />
              </BlurView>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  
  // Floating elements for visual interest
  floatingElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  floatingCircle: {
    position: 'absolute',
    borderRadius: 50,
    opacity: 0.1,
  },
  circle1: {
    width: 100,
    height: 100,
    backgroundColor: theme.colors.primary,
    top: height * 0.15,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: theme.colors.secondary,
    top: height * 0.6,
    left: -75,
  },
  circle3: {
    width: 80,
    height: 80,
    backgroundColor: theme.colors.accent,
    top: height * 0.3,
    left: width * 0.8,
  },

  content: {
    flex: 1,
    zIndex: 1,
  },
  
  // Logo section
  logoSection: {
    alignItems: 'center',
    paddingTop: height * 0.1,
    paddingBottom: theme.spacing[10],
  },
  logoContainer: {
    marginBottom: theme.spacing[6],
  },
  logoGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
  },
  logoText: {
    fontSize: theme.typography.fontSize['4xl'],
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing[2],
  },
  tagline: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textMuted,
  },

  // Hero section
  heroSection: {
    flex: 1,
    paddingHorizontal: theme.spacing[8],
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: theme.typography.fontSize['2xl'] * 1.3,
    marginBottom: theme.spacing[6],
  },
  heroSubtitle: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.normal,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: theme.typography.fontSize.base * 1.6,
    paddingHorizontal: theme.spacing[4],
  },

  // Buttons section
  buttonsSection: {
    paddingHorizontal: theme.spacing[8],
    paddingBottom: theme.spacing[10],
  },
  
  // Primary button with gradient
  primaryButtonContainer: {
    marginBottom: theme.spacing[4],
    borderRadius: theme.radius.xl,
    ...theme.shadows.button,
  },
  primaryButton: {
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[8],
    borderRadius: theme.radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.semibold,
    color: 'white',
    marginRight: theme.spacing[2],
  },

  // Demo button with blur effect
  demoButtonContainer: {
    marginBottom: theme.spacing[8],
    borderRadius: theme.radius.xl,
  },
  demoButton: {
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[8],
    borderRadius: theme.radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    overflow: 'hidden',
  },
  demoButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.primary,
    marginRight: theme.spacing[1],
  },

  // Legal text
  legalContainer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
  },
  legalText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.normal,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: theme.typography.fontSize.sm * 1.5,
  },
  legalLink: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.medium,
  },
});
