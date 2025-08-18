/**
 * Empty State Component
 * Shows when there's no content to display
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeProvider';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export function EmptyState({
  icon = 'document-outline',
  title,
  description,
  action,
  style,
}: EmptyStateProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
        <Ionicons name={icon} size={48} color={colors.textMuted} />
      </View>
      
      <Text
        style={[
          styles.title,
          {
            color: colors.textPrimary,
            fontFamily: typography.fontFamily.semibold,
            fontSize: typography.fontSize.lg,
          },
        ]}
      >
        {title}
      </Text>
      
      {description && (
        <Text
          style={[
            styles.description,
            {
              color: '#FFFFFF',
              fontFamily: typography.fontFamily.medium,
              fontSize: typography.fontSize.base,
            },
          ]}
        >
          {description}
        </Text>
      )}
      
      {action && (
        <View style={styles.actionContainer}>
          {action}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  actionContainer: {
    width: '100%',
    maxWidth: 280,
  },
});
