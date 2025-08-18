/**
 * EZ Clear Design System Tokens - V0 Exact Match
 * Colors extracted directly from v0-ez-clear-design.vercel.app
 */

import { Platform } from 'react-native';

// Color tokens - exact match to v0-ez-clear-design.vercel.app
export const colors = {
  // Dark theme - exact v0 colors from Vercel site
  background: '#0B0F1A',     // Deep dark blue background from v0
  surface: 'rgba(255,255,255,0.05)', // Semi-transparent white for cards
  card: 'rgba(255,255,255,0.08)',    // Slightly more opaque for elevated cards
  cardHover: 'rgba(255,255,255,0.12)', // Card hover state
  stroke: 'rgba(255,255,255,0.1)',   // Subtle borders
  strokeHover: 'rgba(255,255,255,0.2)', // Border hover

  // Text hierarchy - v0 exact colors
  textPrimary: '#FFFFFF',    // Pure white for headings
  onSurface: 'rgba(255,255,255,0.85)', // Main text on surfaces
  textSecondary: 'rgba(255,255,255,0.7)', // Secondary text
  muted: 'rgba(255,255,255,0.6)',     // Muted text
  textDisabled: 'rgba(255,255,255,0.4)', // Disabled text

  // Brand colors - v0 exact palette
  primary: '#00E6CF',        // Teal/mint - main brand color
  primaryHover: '#00D4BC',   // Darker teal hover
  primaryLight: '#33EBDA',   // Lighter teal

  secondary: '#3B82F6',      // Blue-500 secondary
  secondaryHover: '#2563EB', // Blue-600 hover
  secondaryLight: '#60A5FA', // Blue-400 light

  accent: '#7C5DFA',         // Purple accent - matches onboarding
  accentHover: '#6B4CE6',    // Purple hover
  accentLight: '#9B7EFB',    // Light purple
  
  // Status colors - consistent with v0
  success: '#10B981',        // Emerald-500
  warning: '#F59E0B',        // Amber-500
  error: '#EF4444',          // Red-500
  info: '#3B82F6',           // Blue-500
  
  // Legacy compatibility
  mint: '#10B981',           // Maps to secondary
  purple: '#8B5CF6',         // Maps to accent
  
  // Component specific colors
  foreground: '#FFFFFF',
  cardBackground: '#1A1A1D',
  cardForeground: '#FFFFFF',
  
  popover: {
    DEFAULT: '#1A1A1D',
    foreground: '#FFFFFF',
  },
  
  muted: {
    DEFAULT: '#111113',
    foreground: '#A1A1AA',
  },
  
  destructive: {
    DEFAULT: '#EF4444',
    foreground: '#FFFFFF',
  },
  
  border: '#2A2A2E',
  input: '#111113',
  ring: '#3B82F6',
  
  // Dark theme object for compatibility
  dark: {
    background: '#0A0A0B',
    foreground: '#FFFFFF',
    card: '#1A1A1D',
    cardForeground: '#FFFFFF',
    popover: '#1A1A1D',
    popoverForeground: '#FFFFFF',
    primary: '#3B82F6',
    primaryForeground: '#FFFFFF',
    secondary: '#111113',
    secondaryForeground: '#FFFFFF',
    muted: '#111113',
    mutedForeground: '#A1A1AA',
    accent: '#3B82F6',
    accentForeground: '#FFFFFF',
    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',
    border: '#2A2A2E',
    input: '#111113',
    ring: '#3B82F6',
    text: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
  },
};

// Spacing tokens - v0 design system
export const spacing = {
  0: 0,
  1: 4,   // 0.25rem
  2: 8,   // 0.5rem
  3: 12,  // 0.75rem
  4: 16,  // 1rem
  5: 20,  // 1.25rem
  6: 24,  // 1.5rem
  7: 28,  // 1.75rem
  8: 32,  // 2rem
  9: 36,  // 2.25rem
  10: 40, // 2.5rem
  12: 48, // 3rem
  16: 64, // 4rem
  20: 80, // 5rem
  24: 96, // 6rem
};

// Border radius - v0 style
export const radius = {
  sm: 6,   // Small radius
  md: 8,   // Medium radius
  lg: 12,  // Large radius - main radius for cards
  xl: 16,  // Extra large radius
  '2xl': 20, // 2X large radius
  full: 9999, // Circular
};

// Typography - v0 design system
export const typography = {
  fontFamily: {
    sans: Platform.select({
      ios: 'SF Pro Display',
      android: 'Inter',
      default: 'Inter',
    }),
    medium: Platform.select({
      ios: 'SF Pro Display',
      android: 'Inter-Medium',
      default: 'Inter-Medium',
    }),
    semibold: Platform.select({
      ios: 'SF Pro Display',
      android: 'Inter-SemiBold',
      default: 'Inter-SemiBold',
    }),
    bold: Platform.select({
      ios: 'SF Pro Display',
      android: 'Inter-Bold',
      default: 'Inter-Bold',
    }),
  },
  
  fontSize: {
    xs: 12,       // Extra small
    sm: 14,       // Small
    base: 16,     // Base/body
    lg: 18,       // Large
    xl: 20,       // Extra large
    '2xl': 24,    // 2X large
    '3xl': 30,    // 3X large
    '4xl': 36,    // 4X large
    '5xl': 48,    // 5X large
    
    // Semantic sizes
    caption: 12,  // Captions
    body: 16,     // Body text
    subtitle: 18, // Subtitles
    title: 24,    // Titles
    heading: 30,  // Headings
    display: 36,  // Display text
  },

  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Shadows - modern shadow system
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  
  // Semantic shadows
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  button: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
};

// Component sizes
export const sizes = {
  button: {
    sm: { height: 36, paddingHorizontal: 16 },
    default: { height: 44, paddingHorizontal: 24 },
    lg: { height: 52, paddingHorizontal: 32 },
    icon: { height: 44, width: 44 },
  },
  input: {
    default: { height: 44, paddingHorizontal: 16 },
    sm: { height: 36, paddingHorizontal: 12 },
    lg: { height: 52, paddingHorizontal: 20 },
  },
};

// Spacing system
export const spacingSystem = {
  section: 24,
  card: 16,
  element: 12,
  header: 20,
  headerSide: 24,
};

// Export theme
export const theme = {
  colors,
  spacing,
  spacingSystem,
  radius,
  typography,
  shadows,
  sizes,
};

export default theme;
