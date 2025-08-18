/**
 * Search Bar Component
 * Input field with search icon and clear functionality
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeProvider';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: (text: string) => void;
  style?: ViewStyle;
  autoFocus?: boolean;
  accessibilityLabel?: string;
  rightIcon?: string; // Ionicons name
  onPressRight?: () => void;
}

export function SearchBar({
  placeholder = 'Search...',
  value,
  onChangeText,
  onSubmit,
  style,
  autoFocus = false,
  accessibilityLabel = 'Search jobs',
  rightIcon,
  onPressRight,
}: SearchBarProps) {
  const { colors, typography, spacing, radius } = useTheme();
  const [internalValue, setInternalValue] = useState('');
  
  const currentValue = value !== undefined ? value : internalValue;
  const handleChangeText = onChangeText || setInternalValue;

  const handleClear = () => {
    handleChangeText('');
  };

  const handleSubmitEditing = () => {
    if (onSubmit) {
      onSubmit(currentValue);
    }
  };

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.stroke,
      },
      style
    ]}>
      <Ionicons
        name="search"
        size={18}
        color={colors.muted}
        style={styles.searchIcon}
      />

      <TextInput
        style={[
          styles.input,
          {
            color: colors.onSurface,
            fontFamily: typography.fontFamily.medium,
            fontSize: typography.fontSize.base,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor="#FFFFFF"
        value={currentValue}
        onChangeText={handleChangeText}
        onSubmitEditing={handleSubmitEditing}
        returnKeyType="search"
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel={accessibilityLabel}
      />

      {currentValue.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <Ionicons
            name="close-circle"
            size={18}
            color={colors.muted}
          />
        </TouchableOpacity>
      )}

      {!!rightIcon && (
        <TouchableOpacity
          style={styles.rightButton}
          onPress={onPressRight}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Open filters"
        >
          <Ionicons name={rightIcon as any} size={20} color={colors.onSurface} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    minHeight: 24,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  rightButton: {
    marginLeft: 8,
    padding: 4,
  },
});
