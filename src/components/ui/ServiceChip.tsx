/**
 * ServiceChip Component - V0 Design System
 * Small rounded chip for service categories
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeProvider';

interface ServiceChipProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function ServiceChip({
  title,
  icon,
  selected = false,
  onPress,
  style,
}: ServiceChipProps) {
  const { colors, typography, radius, spacing } = useTheme();

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.surface,
          borderRadius: radius.full,
          borderWidth: 1,
          borderColor: selected ? colors.primary : colors.stroke,
          paddingHorizontal: spacing[4],
          paddingVertical: spacing[2],
        },
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ selected }}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={16}
          color={selected ? colors.background : colors.muted}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: selected ? colors.background : colors.onSurface,
            fontFamily: typography.fontFamily.medium,
            fontSize: typography.fontSize.sm,
          },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    textAlign: 'center',
  },
});
