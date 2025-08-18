/**
 * EZ Clear Design System - V0 Theme
 * Pixel-perfect recreation of the web version design tokens
 */

export const theme = {
  colors: {
    // Background colors - exact match from web version
    background: '#0B0F1A',        // bg-slate-950
    surface: 'rgba(255,255,255,0.05)',  // bg-white/5
    card: 'rgba(255,255,255,0.08)',     // bg-white/8
    
    // Text colors
    onSurface: 'rgba(255,255,255,0.85)', // text-white
    textPrimary: 'rgba(255,255,255,0.85)',
    textSecondary: 'rgba(255,255,255,0.7)',
    muted: 'rgba(255,255,255,0.6)',      // text-slate-400
    textDisabled: 'rgba(255,255,255,0.4)',
    
    // Brand colors - exact hex values from web
    primary: '#00E6CF',           // bg-teal-500
    secondary: '#3B82F6',         // bg-blue-500
    accent: '#7C5DFA',            // bg-purple-500
    
    // Semantic colors
    success: '#10B981',           // bg-emerald-500
    warning: '#F59E0B',           // bg-amber-500
    error: '#EF4444',             // bg-red-500
    info: '#3B82F6',              // bg-blue-500
    
    // Border and stroke colors
    stroke: 'rgba(255,255,255,0.1)',     // border-white/10
    strokeHover: 'rgba(255,255,255,0.2)', // border-white/20
    divider: 'rgba(255,255,255,0.08)',
  },
  
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      semibold: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 12,    // text-xs
      sm: 14,    // text-sm
      base: 16,  // text-base
      lg: 18,    // text-lg
      xl: 20,    // text-xl
      '2xl': 24, // text-2xl
      '3xl': 30, // text-3xl
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  spacing: [0, 2, 4, 8, 12, 16, 24, 32, 48, 64, 80, 96], // 0-11 index
  
  radius: {
    none: 0,
    sm: 8,     // rounded-sm
    md: 12,    // rounded-md  
    lg: 16,    // rounded-lg
    xl: 20,    // rounded-xl
    '2xl': 24, // rounded-2xl
    full: 9999, // rounded-full
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 15,
      elevation: 5,
    },
  },
  
  sizes: {
    button: {
      sm: { height: 36, paddingHorizontal: 16 },
      md: { height: 44, paddingHorizontal: 20 },
      lg: { height: 52, paddingHorizontal: 24 },
    },
    input: {
      sm: { height: 36, paddingHorizontal: 12 },
      md: { height: 44, paddingHorizontal: 16 },
      lg: { height: 52, paddingHorizontal: 20 },
    },
  },
} as const;

export type Theme = typeof theme;
