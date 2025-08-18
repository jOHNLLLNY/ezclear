/**
 * Primary Button Component - V0 Design System
 * Main action button with teal background
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeProvider';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  size = 'md',
  fullWidth = false,
  style,
  textStyle,
}: PrimaryButtonProps) {
  const { colors, typography, radius, sizes, shadows } = useTheme();

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const buttonSize = sizes.button[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: isDisabled ? colors.muted : colors.primary,
          borderRadius: radius.md,
          height: buttonSize.height,
          paddingHorizontal: buttonSize.paddingHorizontal,
          ...shadows.sm,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={colors.background}
        />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: colors.background,
              fontFamily: typography.fontFamily.semibold,
              fontSize: size === 'sm' ? typography.fontSize.sm : 
                       size === 'lg' ? typography.fontSize.lg : 
                       typography.fontSize.base,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    textAlign: 'center',
  },
});
