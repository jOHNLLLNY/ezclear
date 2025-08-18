/**
 * SurfaceCard Component - V0 Design System
 * Dark surface container with subtle border and elevation
 */

import React, { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeProvider';

interface SurfaceCardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export function SurfaceCard({
  children,
  variant = 'default',
  padding = 'md',
  style,
}: SurfaceCardProps) {
  const { colors, radius, shadows, spacing } = useTheme();

  const cardStyles = [
    styles.base,
    {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.stroke,
    },
    variant === 'elevated' && {
      ...shadows.md,
    },
    variant === 'outlined' && {
      borderColor: colors.strokeHover,
    },
    padding === 'sm' && { padding: spacing[3] },
    padding === 'md' && { padding: spacing[4] },
    padding === 'lg' && { padding: spacing[6] },
    style,
  ];

  return (
    <View style={cardStyles}>
      {children}
    </View>
  );
}

// Legacy Card export for compatibility
export const Card = SurfaceCard;

const styles = StyleSheet.create({
  base: {
    // Base card styles
  },
});
