/**
 * AppBar Component - V0 Design System
 * Top navigation bar with logo, title, and actions
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeProvider';

interface AppBarProps {
  title?: string;
  showLogo?: boolean;
  showBack?: boolean;
  onBackPress?: () => void;
  actions?: React.ReactNode;
  style?: ViewStyle;
}

export function AppBar({
  title,
  showLogo = false,
  showBack = false,
  onBackPress,
  actions,
  style,
}: AppBarProps) {
  const { colors, typography, spacing, radius } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.content, { paddingHorizontal: spacing[4] }, style]}>
        {/* Left side */}
        <View style={styles.left}>
          {showBack && (
            <TouchableOpacity
              style={[
                styles.backButton,
                {
                  backgroundColor: colors.surface,
                  borderRadius: radius.md,
                },
              ]}
              onPress={onBackPress}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
          
          {showLogo && (
            <View style={styles.logoContainer}>
              <View style={[styles.logoIcon, { backgroundColor: 'transparent' }]}> 
                <Ionicons name="construct-outline" size={20} color={colors.primary} />
              </View>
              <Text
                style={[
                  styles.logoText,
                  {
                    color: colors.textPrimary,
                    fontFamily: typography.fontFamily.bold,
                    fontSize: typography.fontSize.lg,
                  },
                ]}
              >
                EZ Clear
              </Text>
            </View>
          )}
          
          {title && !showLogo && (
            <Text
              style={[
                styles.title,
                {
                  color: colors.textPrimary,
                  fontFamily: typography.fontFamily.semibold,
                  fontSize: typography.fontSize.xl,
                },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
          )}
        </View>

        {/* Right side */}
        <View style={styles.right}>
          {actions}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor applied inline
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoText: {
    // styles applied inline
  },
  title: {
    flex: 1,
    marginLeft: 0,
  },
});
