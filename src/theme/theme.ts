/**
 * EZ Clear Design System - Native Theme
 * Exact match to v0.dev/chat/fork-of-ez-clear-app-aYd5AUtauuo
 */

// Colors - extracted from Vercel web version
export const colors = {
  // Background colors - dark theme
  background: '#0B0F1A',                    // Deep dark blue background
  surface: 'rgba(255,255,255,0.05)',       // Semi-transparent white for cards
  card: 'rgba(255,255,255,0.08)',          // Slightly more opaque for elevated cards
  cardHover: 'rgba(255,255,255,0.12)',     // Card hover state
  
  // Border colors
  stroke: 'rgba(255,255,255,0.1)',         // Subtle borders
  strokeHover: 'rgba(255,255,255,0.2)',    // Border hover
  
  // Text colors
  textPrimary: '#FFFFFF',                   // Pure white for headings
  onSurface: 'rgba(255,255,255,0.85)',     // Main text on surfaces
  textSecondary: 'rgba(255,255,255,0.7)',  // Secondary text
  muted: 'rgba(255,255,255,0.6)',          // Muted text
  textDisabled: 'rgba(255,255,255,0.4)',   // Disabled text
  
  // Brand colors - EZ Clear palette
  primary: '#00E6CF',                       // Teal/mint - main brand color
  primaryHover: '#00D4BC',                  // Darker teal hover
  primaryLight: '#33EBDA',                  // Lighter teal
  
  secondary: '#3B82F6',                     // Blue secondary
  secondaryHover: '#2563EB',                // Blue hover
  secondaryLight: '#60A5FA',                // Light blue
  
  accent: '#7C5DFA',                        // Purple accent
  accentHover: '#6B4CE6',                   // Purple hover
  accentLight: '#9B7EFB',                   // Light purple
  
  // Status colors
  success: '#10B981',                       // Green success
  warning: '#F59E0B',                       // Amber warning
  error: '#EF4444',                         // Red error
  info: '#3B82F6',                          // Blue info
} as const;

// Spacing scale - consistent with web version
export const spacing = {
  0: 0,
  1: 2,
  2: 4,
  3: 8,
  4: 12,
  5: 16,
  6: 20,
  7: 24,
  8: 28,
  9: 32,
  10: 36,
  11: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

// Border radius scale
export const radius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

// Typography - System fonts
export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 22,
    '2xl': 28,
    '3xl': 34,
    '4xl': 40,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 28,
    xl: 32,
    '2xl': 36,
    '3xl': 42,
    '4xl': 48,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
} as const;

// Shadows - elevation system
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  // Aliases used by components
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// Component sizes
export const sizes = {
  button: {
    sm: { height: 36, paddingHorizontal: 16 },
    md: { height: 44, paddingHorizontal: 20 },
    lg: { height: 52, paddingHorizontal: 24 },
    xl: { height: 60, paddingHorizontal: 28 },
  },
  input: {
    sm: { height: 36, paddingHorizontal: 12 },
    md: { height: 44, paddingHorizontal: 16 },
    lg: { height: 52, paddingHorizontal: 20 },
  },
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    '2xl': 80,
  },
} as const;

// Animation durations
export const animation = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

// Z-index scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Complete theme object
export const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadows,
  sizes,
  animation,
  zIndex,
} as const;

export type Theme = typeof theme;
export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type Radius = typeof radius;
export type Typography = typeof typography;
export type Shadows = typeof shadows;
export type Sizes = typeof sizes;
