/**
 * Visual Effects Components - V0 Design System
 * Gradients, animations, and visual effects
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Theme
import theme from './index';

const { width, height } = Dimensions.get('window');

// Gradient Button Component
interface GradientButtonProps {
  children: React.ReactNode;
  colors?: string[];
  style?: any;
}

export function GradientButton({ 
  children, 
  colors = [theme.colors.primary, theme.colors.primaryHover],
  style 
}: GradientButtonProps) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.gradientButton, style]}
    >
      {children}
    </LinearGradient>
  );
}

// Gradient Card Background
interface GradientCardProps {
  children: React.ReactNode;
  style?: any;
}

export function GradientCard({ children, style }: GradientCardProps) {
  return (
    <LinearGradient
      colors={[
        theme.colors.card,
        theme.colors.cardHover,
        theme.colors.card,
      ]}
      locations={[0, 0.5, 1]}
      style={[styles.gradientCard, style]}
    >
      {children}
    </LinearGradient>
  );
}

// Animated Gradient Background
export function AnimatedGradientBackground() {
  return (
    <View style={styles.animatedBackground}>
      <LinearGradient
        colors={[
          theme.colors.background,
          theme.colors.card + '40',
          theme.colors.background,
        ]}
        locations={[0, 0.5, 1]}
        style={styles.backgroundGradient}
      />
      
      {/* Floating orbs */}
      <View style={[styles.floatingOrb, styles.orb1]} />
      <View style={[styles.floatingOrb, styles.orb2]} />
      <View style={[styles.floatingOrb, styles.orb3]} />
    </View>
  );
}

// Glassmorphism Effect
interface GlassCardProps {
  children: React.ReactNode;
  intensity?: number;
  style?: any;
}

export function GlassCard({ 
  children, 
  intensity = 20,
  style 
}: GlassCardProps) {
  return (
    <BlurView 
      intensity={intensity} 
      tint="dark" 
      style={[styles.glassCard, style]}
    >
      <View style={styles.glassCardContent}>
        {children}
      </View>
    </BlurView>
  );
}

// Shimmer Loading Effect
interface ShimmerProps {
  width?: number;
  height?: number;
  borderRadius?: number;
}

export function Shimmer({ 
  width = 100, 
  height = 20, 
  borderRadius = theme.radius.md 
}: ShimmerProps) {
  const shimmerAnimation = new Animated.Value(0);

  React.useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]).start(() => animate());
    };
    animate();
  }, []);

  const translateX = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={[styles.shimmerContainer, { width, height, borderRadius }]}>
      <Animated.View
        style={[
          styles.shimmerGradient,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'transparent',
            theme.colors.textMuted + '40',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerGradientInner}
        />
      </Animated.View>
    </View>
  );
}

// Glow Effect
interface GlowProps {
  children: React.ReactNode;
  color?: string;
  intensity?: number;
  style?: any;
}

export function Glow({ 
  children, 
  color = theme.colors.primary,
  intensity = 0.3,
  style 
}: GlowProps) {
  return (
    <View style={[styles.glowContainer, style]}>
      <View 
        style={[
          styles.glowEffect,
          {
            shadowColor: color,
            shadowOpacity: intensity,
          }
        ]}
      />
      {children}
    </View>
  );
}

// Pulse Animation
interface PulseProps {
  children: React.ReactNode;
  duration?: number;
  style?: any;
}

export function Pulse({ 
  children, 
  duration = 2000,
  style 
}: PulseProps) {
  const pulseAnimation = new Animated.Value(1);

  React.useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.05,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };
    animate();
  }, [duration]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: pulseAnimation }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Gradient Button
  gradientButton: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.button,
  },

  // Gradient Card
  gradientCard: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },

  // Animated Background
  animatedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundGradient: {
    flex: 1,
  },
  floatingOrb: {
    position: 'absolute',
    borderRadius: 50,
    opacity: 0.1,
  },
  orb1: {
    width: 120,
    height: 120,
    backgroundColor: theme.colors.primary,
    top: height * 0.2,
    right: -60,
  },
  orb2: {
    width: 180,
    height: 180,
    backgroundColor: theme.colors.secondary,
    top: height * 0.6,
    left: -90,
  },
  orb3: {
    width: 100,
    height: 100,
    backgroundColor: theme.colors.accent,
    top: height * 0.4,
    right: width * 0.2,
  },

  // Glass Card
  glassCard: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.stroke + '40',
  },
  glassCardContent: {
    padding: theme.spacing[4],
  },

  // Shimmer
  shimmerContainer: {
    backgroundColor: theme.colors.card,
    overflow: 'hidden',
  },
  shimmerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shimmerGradientInner: {
    flex: 1,
  },

  // Glow
  glowContainer: {
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 10,
  },
});
