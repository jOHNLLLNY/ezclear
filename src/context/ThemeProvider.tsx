/**
 * Theme Provider for EZ Clear Native App
 * Provides theme tokens and utilities throughout the app
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { theme } from '../theme/theme';

interface ThemeContextType {
  theme: typeof theme;
  colors: typeof theme.colors;
  spacing: typeof theme.spacing;
  typography: typeof theme.typography;
  shadows: typeof theme.shadows;
  radius: typeof theme.radius;
  sizes: typeof theme.sizes;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const value: ThemeContextType = {
    theme,
    colors: theme.colors,
    spacing: theme.spacing,
    typography: theme.typography,
    shadows: theme.shadows,
    radius: theme.radius,
    sizes: theme.sizes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Export theme directly for convenience
export { theme };
