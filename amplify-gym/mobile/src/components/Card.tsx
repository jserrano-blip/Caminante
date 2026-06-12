import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, shadow, spacing } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Card con fondo azul hielo en lugar de blanco. */
  tinted?: boolean;
  /** "hero": gradiente navy → primary con texto blanco. */
  variant?: 'default' | 'hero';
}

export function Card({ children, style, tinted, variant = 'default' }: Props) {
  if (variant === 'hero') {
    return (
      <LinearGradient
        colors={[colors.navy800, colors.primary]}
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.iceBorder,
    padding: spacing.md,
    ...shadow.soft,
  },
  tinted: {
    backgroundColor: colors.ice,
  },
  hero: {
    borderWidth: 0,
  },
});
