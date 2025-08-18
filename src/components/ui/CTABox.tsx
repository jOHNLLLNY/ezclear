/**
 * CTABox Component - V0 Design System
 * Call-to-action promotional banner
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeProvider';

interface CTABoxProps {
  title: string;
  subtitle?: string;
  buttonText: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  gradient?: boolean;
  compact?: boolean; // reduce vertical padding
  style?: ViewStyle;
}

export function CTABox({
  title,
  subtitle,
  buttonText,
  onPress,
  icon,
  gradient = true,
  compact = false,
  style,
}: CTABoxProps) {
  const { colors, typography, radius, spacing, shadows } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const content = (
    <View style={[styles.content, { paddingHorizontal: spacing[6], paddingVertical: compact ? spacing[3] : spacing[6] }]}>
      <View style={styles.textSection}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons name={icon} size={24} color="white" />
          </View>
        )}
        
        <Text
          style={[
            styles.title,
            {
              color: 'white',
              fontFamily: typography.fontFamily.bold,
              fontSize: typography.fontSize.xl,
              marginBottom: spacing[2],
            },
          ]}
        >
          {title}
        </Text>
        
        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              {
                color: 'rgba(255,255,255,0.9)',
                fontFamily: typography.fontFamily.medium,
                fontSize: typography.fontSize.base,
                marginBottom: spacing[4],
              },
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: 'white',
            borderRadius: radius.md,
            paddingHorizontal: spacing[5],
            paddingVertical: spacing[3],
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={buttonText}
      >
        <Text
          style={[
            styles.buttonText,
            {
              color: colors.primary,
              fontFamily: typography.fontFamily.semibold,
              fontSize: typography.fontSize.base,
            },
          ]}
        >
          {buttonText}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (gradient) {
    return (
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.container,
          {
            borderRadius: radius.lg,
            ...shadows.md,
          },
          style,
        ]}
      >
        {content}
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.primary,
          borderRadius: radius.lg,
          ...shadows.md,
        },
        style,
      ]}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textSection: {
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    lineHeight: 28,
  },
  subtitle: {
    lineHeight: 22,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  buttonText: {
    textAlign: 'center',
  },
});
