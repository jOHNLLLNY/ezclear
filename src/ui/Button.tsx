/**
 * Button Component - V0 Design System
 * Modern button with variants, sizes, and effects
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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Theme
import { useTheme } from '../context/ThemeProvider';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'right',
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const buttonStyles = [
    styles.base,
    styles[size],
    styles[variant],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${size}`],
    styles[`text_${variant}`],
    disabled && styles.textDisabled,
    textStyle,
  ];

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;
  const iconColor = variant === 'outline' || variant === 'ghost' 
    ? theme.colors.primary 
    : 'white';

  const renderContent = () => (
    <>
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={iconColor} 
          style={styles.loader}
        />
      )}
      {!loading && icon && iconPosition === 'left' && (
        <Ionicons 
          name={icon} 
          size={iconSize} 
          color={iconColor} 
          style={styles.iconLeft}
        />
      )}
      <Text style={textStyles}>{title}</Text>
      {!loading && icon && iconPosition === 'right' && (
        <Ionicons 
          name={icon} 
          size={iconSize} 
          color={iconColor} 
          style={styles.iconRight}
        />
      )}
    </>
  );

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        style={[styles.base, styles[size], fullWidth && styles.fullWidth]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryHover]}
          style={[styles.gradient, disabled && styles.gradientDisabled]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

function getStyles(theme: any) {
  return StyleSheet.create({
  // Base styles
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.lg,
    ...theme.shadows.button,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },

  // Sizes
  sm: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    minHeight: 36,
  },
  md: {
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[3],
    minHeight: 44,
  },
  lg: {
    paddingHorizontal: theme.spacing[8],
    paddingVertical: theme.spacing[4],
    minHeight: 52,
  },

  // Variants
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  gradient: {
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  gradientDisabled: {
    opacity: 0.5,
  },

  // Text styles
  text: {
    fontFamily: theme.typography.fontFamily.semibold,
    textAlign: 'center',
  },
  text_sm: {
    fontSize: theme.typography.fontSize.sm,
  },
  text_md: {
    fontSize: theme.typography.fontSize.base,
  },
  text_lg: {
    fontSize: theme.typography.fontSize.lg,
  },
  text_primary: {
    color: 'white',
  },
  text_secondary: {
    color: 'white',
  },
  text_outline: {
    color: theme.colors.textPrimary,
  },
  text_ghost: {
    color: theme.colors.primary,
  },
  text_gradient: {
    color: 'white',
  },
  textDisabled: {
    color: theme.colors.textMuted,
  },

  // Icons
  iconLeft: {
    marginRight: theme.spacing[2],
  },
  iconRight: {
    marginLeft: theme.spacing[2],
  },
  loader: {
    marginRight: theme.spacing[2],
  },
  });
}
