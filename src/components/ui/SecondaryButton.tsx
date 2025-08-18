/**
 * Secondary Button Component - V0 Design System
 * Secondary action button with blue background or outline
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

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'filled' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function SecondaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'filled',
  size = 'md',
  fullWidth = false,
  style,
  textStyle,
}: SecondaryButtonProps) {
  const { colors, typography, radius, sizes, shadows } = useTheme();

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const buttonSize = sizes.button[size];
  const isDisabled = disabled || loading;
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: isOutline 
            ? 'transparent' 
            : isDisabled 
              ? colors.muted 
              : colors.secondary,
          borderRadius: radius.md,
          height: buttonSize.height,
          paddingHorizontal: buttonSize.paddingHorizontal,
          borderWidth: isOutline ? 1 : 0,
          borderColor: isOutline 
            ? isDisabled 
              ? colors.muted 
              : colors.secondary 
            : 'transparent',
          ...(isOutline ? {} : shadows.sm),
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
          color={isOutline ? colors.secondary : colors.textPrimary}
        />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: isOutline 
                ? isDisabled 
                  ? colors.muted 
                  : colors.secondary
                : colors.textPrimary,
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
