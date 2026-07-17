// Amplify Gym — tokens de diseño. Paleta estricta familia azul + blanco.
export const colors = {
  // Azules profundos (fondos hero / oscuros)
  navy900: '#081131',
  navy800: '#0C1D4D',
  navy700: '#132B70',

  primary: '#1D4ED8',
  accent: '#3B82F6',
  sky: '#60A5FA',
  primaryDark: '#132B70',

  // Superficies
  background: '#F4F7FF',
  surface: '#FFFFFF',
  ice: '#EFF6FF',
  iceBorder: '#DBEAFE',
  surfaceBorder: '#DBEAFE',

  textPrimary: '#0C1D4D',
  textMuted: '#5B7BB8',
  white: '#FFFFFF',
} as const;

export type ThemeColors = { readonly [K in keyof typeof colors]: string };

/** Paleta clara (idéntica a `colors`). */
export const lightColors: ThemeColors = colors;

/** Paleta oscura — familia azul marino, sin grises puros ni negro. */
export const darkColors: ThemeColors = {
  navy900: '#050B20',
  navy800: '#0A1330',
  navy700: '#142B66',

  primary: '#3B82F6',
  accent: '#60A5FA',
  sky: '#7FB5F7',
  primaryDark: '#93C5FD',

  background: '#0A1330',
  surface: '#13224E',
  ice: '#1B2F66',
  iceBorder: '#28407D',
  surfaceBorder: '#28407D',

  textPrimary: '#E8EFFF',
  textMuted: '#8FA9DC',
  white: '#FFFFFF',
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

/** Espacio inferior para que el contenido no quede oculto tras la tab bar flotante. */
export const TAB_BAR_SPACE = 110;

export const shadow = {
  soft: {
    shadowColor: colors.navy900,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

/** Tipografía dependiente del tema. */
export const makeTypography = (c: ThemeColors) =>
  ({
    title: { fontSize: 30, fontWeight: '800' as const, color: c.textPrimary },
    subtitle: { fontSize: 17, fontWeight: '600' as const, color: c.textPrimary },
    body: { fontSize: 15, fontWeight: '400' as const, color: c.textPrimary },
    muted: { fontSize: 13, fontWeight: '400' as const, color: c.textMuted },
    stat: { fontSize: 26, fontWeight: '700' as const, color: c.primary },
    eyebrow: {
      fontSize: 11,
      fontWeight: '700' as const,
      letterSpacing: 1.5,
      textTransform: 'uppercase' as const,
      color: c.sky,
    },
  }) as const;

/** Fallback claro estático para archivos aún no migrados al ThemeContext. */
export const typography = makeTypography(colors);
