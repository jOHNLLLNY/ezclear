/**
 * Layout Components - V0 Design System
 * Consistent spacing and layout utilities
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Theme
import theme from './index';

// Container Component
interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof theme.spacing;
  paddingHorizontal?: keyof typeof theme.spacing;
  paddingVertical?: keyof typeof theme.spacing;
  maxWidth?: number;
  center?: boolean;
}

export function Container({
  children,
  style,
  padding,
  paddingHorizontal,
  paddingVertical,
  maxWidth,
  center = false,
}: ContainerProps) {
  const containerStyle = [
    styles.container,
    padding && { padding: theme.spacing[padding] },
    paddingHorizontal && { paddingHorizontal: theme.spacing[paddingHorizontal] },
    paddingVertical && { paddingVertical: theme.spacing[paddingVertical] },
    maxWidth && { maxWidth },
    center && styles.center,
    style,
  ];

  return <View style={containerStyle}>{children}</View>;
}

// Screen Component
interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  safe?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function Screen({
  children,
  style,
  safe = true,
  edges = ['top', 'bottom'],
}: ScreenProps) {
  const screenStyle = [styles.screen, style];

  if (safe) {
    return (
      <SafeAreaView style={screenStyle} edges={edges}>
        {children}
      </SafeAreaView>
    );
  }

  return <View style={screenStyle}>{children}</View>;
}

// ScrollableScreen Component
interface ScrollableScreenProps extends ScrollViewProps {
  children: React.ReactNode;
  safe?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  contentContainerStyle?: ViewStyle;
}

export function ScrollableScreen({
  children,
  safe = true,
  edges = ['top', 'bottom'],
  contentContainerStyle,
  ...scrollViewProps
}: ScrollableScreenProps) {
  const content = (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      {...scrollViewProps}
    >
      {children}
    </ScrollView>
  );

  if (safe) {
    return (
      <SafeAreaView style={styles.screen} edges={edges}>
        {content}
      </SafeAreaView>
    );
  }

  return <View style={styles.screen}>{content}</View>;
}

// Stack Component (Vertical spacing)
interface StackProps {
  children: React.ReactNode;
  spacing?: keyof typeof theme.spacing;
  style?: ViewStyle;
}

export function Stack({
  children,
  spacing = 4,
  style,
}: StackProps) {
  const stackStyle = [styles.stack, style];
  const gap = theme.spacing[spacing];

  return (
    <View style={stackStyle}>
      {React.Children.map(children, (child, index) => (
        <View key={index} style={index > 0 ? { marginTop: gap } : undefined}>
          {child}
        </View>
      ))}
    </View>
  );
}

// Row Component (Horizontal spacing)
interface RowProps {
  children: React.ReactNode;
  spacing?: keyof typeof theme.spacing;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: boolean;
  style?: ViewStyle;
}

export function Row({
  children,
  spacing = 4,
  align = 'center',
  justify = 'flex-start',
  wrap = false,
  style,
}: RowProps) {
  const rowStyle = [
    styles.row,
    { alignItems: align, justifyContent: justify },
    wrap && styles.wrap,
    style,
  ];
  const gap = theme.spacing[spacing];

  return (
    <View style={rowStyle}>
      {React.Children.map(children, (child, index) => (
        <View key={index} style={index > 0 ? { marginLeft: gap } : undefined}>
          {child}
        </View>
      ))}
    </View>
  );
}

// Grid Component
interface GridProps {
  children: React.ReactNode;
  columns?: number;
  spacing?: keyof typeof theme.spacing;
  style?: ViewStyle;
}

export function Grid({
  children,
  columns = 2,
  spacing = 4,
  style,
}: GridProps) {
  const gap = theme.spacing[spacing];
  const gridStyle = [styles.grid, { gap }, style];

  return (
    <View style={gridStyle}>
      {React.Children.map(children, (child, index) => (
        <View
          key={index}
          style={[
            styles.gridItem,
            { width: `${100 / columns}%` },
          ]}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

// Section Component
interface SectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  spacing?: keyof typeof theme.spacing;
  style?: ViewStyle;
}

export function Section({
  children,
  title,
  subtitle,
  spacing = 6,
  style,
}: SectionProps) {
  const sectionStyle = [
    styles.section,
    { marginBottom: theme.spacing[spacing] },
    style,
  ];

  return (
    <View style={sectionStyle}>
      {title && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
        </View>
      )}
      {children}
    </View>
  );
}

// Spacer Component
interface SpacerProps {
  size?: keyof typeof theme.spacing;
  horizontal?: boolean;
}

export function Spacer({ size = 4, horizontal = false }: SpacerProps) {
  const spacerStyle = horizontal
    ? { width: theme.spacing[size] }
    : { height: theme.spacing[size] };

  return <View style={spacerStyle} />;
}

// Divider Component
interface DividerProps {
  style?: ViewStyle;
  color?: string;
  thickness?: number;
  spacing?: keyof typeof theme.spacing;
}

export function Divider({
  style,
  color = theme.colors.stroke,
  thickness = 1,
  spacing = 4,
}: DividerProps) {
  const dividerStyle = [
    styles.divider,
    {
      backgroundColor: color,
      height: thickness,
      marginVertical: theme.spacing[spacing],
    },
    style,
  ];

  return <View style={dividerStyle} />;
}

const styles = StyleSheet.create({
  // Container
  container: {
    width: '100%',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Screen
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Stack
  stack: {
    flexDirection: 'column',
  },

  // Row
  row: {
    flexDirection: 'row',
  },
  wrap: {
    flexWrap: 'wrap',
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    paddingHorizontal: theme.spacing[1],
  },

  // Section
  section: {
    width: '100%',
  },
  sectionHeader: {
    marginBottom: theme.spacing[4],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.title,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing[1],
  },
  sectionSubtitle: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.normal,
    color: theme.colors.textMuted,
  },

  // Divider
  divider: {
    width: '100%',
  },
});
