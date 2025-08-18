// Stable theme tokens export with fallback to prevent runtime undefined
import v0Default, * as v0 from './tokens_v0';

const baseTheme: any = (v0 as any).theme || v0Default || {};

const fallbackTheme = {
  colors: {
    background: '#0A0A0B',
    surface: '#111113',
    card: '#1A1A1D',
    stroke: '#2A2A2E',
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1AA',
    primary: '#3B82F6',
    secondary: '#10B981',
    error: '#EF4444',
  },
  spacing: (v0 as any).spacing || { 0:0, 1:4, 2:8, 3:12, 4:16, 6:24, 8:32 },
  spacingSystem: (v0 as any).spacingSystem || { section:24, card:16, element:12, header:20, headerSide:24 },
  radius: (v0 as any).radius || { sm:6, md:8, lg:12, xl:16, '2xl':20, full:9999 },
  typography: (v0 as any).typography || { fontSize: { sm:14, base:16, lg:18, title:24 }, fontFamily: { sans: 'System', semibold: 'System', bold: 'System' } },
  shadows: (v0 as any).shadows || { none: {}, button: {}, card: {} },
  sizes: (v0 as any).sizes || {},
};

export const theme = (baseTheme && (baseTheme as any).colors) ? baseTheme : fallbackTheme;

// Re-export token groups for convenience
export const colors = (v0 as any).colors || theme.colors;
export const spacing = (v0 as any).spacing || theme.spacing;
export const spacingSystem = (v0 as any).spacingSystem || theme.spacingSystem;
export const radius = (v0 as any).radius || theme.radius;
export const typography = (v0 as any).typography || theme.typography;
export const shadows = (v0 as any).shadows || theme.shadows;
export const sizes = (v0 as any).sizes || theme.sizes;

export default theme;

