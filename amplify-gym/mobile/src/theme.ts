// Amplify Gym — tokens de diseño. Paleta estricta azul y blanco.
export const colors = {
  primary: '#1D4ED8',
  accent: '#2563EB',
  primaryDark: '#1E3A8A',
  surface: '#EFF6FF',
  surfaceBorder: '#BFDBFE',
  background: '#FFFFFF',
  textPrimary: '#1E3A8A',
  textMuted: '#60A5FA',
  white: '#FFFFFF',
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  full: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const shadow = {
  soft: {
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
} as const;

export const typography = {
  title: { fontSize: 28, fontWeight: '700' as const, color: colors.textPrimary },
  subtitle: { fontSize: 17, fontWeight: '600' as const, color: colors.textPrimary },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.textPrimary },
  muted: { fontSize: 13, fontWeight: '400' as const, color: colors.textMuted },
  stat: { fontSize: 24, fontWeight: '700' as const, color: colors.primary },
} as const;
