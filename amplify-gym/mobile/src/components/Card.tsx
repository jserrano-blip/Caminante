import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { radius, shadow, spacing, type ThemeColors } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Card con fondo azul hielo en lugar de blanco. */
  tinted?: boolean;
  /** "hero": gradiente navy → primary con texto blanco. */
  variant?: 'default' | 'hero';
}

export function Card({ children, style, tinted, variant = 'default' }: Props) {
  const { colors: c } = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  if (variant === 'hero') {
    return (
      <LinearGradient
        colors={[c.navy800, c.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1.2 }}
        style={[styles.card, styles.hero, style]}
      >
        {children}
      </LinearGradient>
    );
  }
  return <View style={[styles.card, tinted && styles.tinted, style]}>{children}</View>;
}

const createStyles = (c: ThemeColors) => {
  return StyleSheet.create({
  card: {
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.iceBorder,
    padding: spacing.md,
    ...shadow.soft,
  },
  tinted: {
    backgroundColor: c.ice,
  },
  hero: {
    borderWidth: 0,
  },
});
}
