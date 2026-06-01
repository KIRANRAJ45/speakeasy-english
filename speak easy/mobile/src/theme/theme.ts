export const theme = {
  light: {
    primary: '#0284C7',       // Soft Sky Blue
    primaryLight: '#E0F2FE',  // Light Blue backdrop
    secondary: '#16A34A',     // Peace Sage Green
    secondaryLight: '#DCFCE7',// Light Green backdrop
    background: '#F8FAFC',    // Peaceful Off-White
    card: '#FFFFFF',
    text: '#0F172A',          // Dark Slate
    textLight: '#475569',     // Slate gray
    border: '#E2E8F0',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    warning: '#F59E0B',
    success: '#10B981',
    white: '#FFFFFF',
  },
  dark: {
    primary: '#38BDF8',
    primaryLight: '#0369A1',
    secondary: '#22C55E',
    secondaryLight: '#14532D',
    background: '#0F172A',    // Dark Navy
    card: '#1E293B',          // Slate Dark Card
    text: '#F8FAFC',          // Soft White Text
    textLight: '#94A3B8',     // Light slate
    border: '#334155',
    error: '#F87171',
    errorLight: '#450A0A',
    warning: '#FBBF24',
    success: '#34D399',
    white: '#FFFFFF',
  },
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  roundness: {
    sm: 4,
    md: 12,
    lg: 20,
    full: 9999,
  }
};

export type ThemeType = typeof theme.light;
