// UI barrel (UTF-8, no BOM)
// 1) Typography helpers
export { textStyles } from './textStyles';

// 2) Robust theme export with fallback
import * as tokens from '../theme/tokens';
const derivedTheme: any = (tokens as any).theme || (tokens as any).default || tokens;
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
  spacing: { 0:0, 1:4, 2:8, 3:12, 4:16, 6:24, 8:32 },
  radius: { sm:6, md:8, lg:12, xl:16, '2xl':20, full:9999 },
  typography: { fontSize: { sm:14, base:16, lg:18, title:24 }, fontFamily: { sans:'System', semibold:'System', bold:'System' } },
  shadows: { none:{}, button:{}, card:{} },
};
export const theme = (derivedTheme && (derivedTheme as any).colors) ? derivedTheme : fallbackTheme;
export default theme;
