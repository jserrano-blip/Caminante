import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, shadow, spacing } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Card con fondo azul claro en lugar de blanco. */
  tinted?: boolean;
}

export function Card({ children, style, tinted }: Props) {
  return <View style={[styles.card, tinted && styles.tinted, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.md,
    ...shadow.soft,
  },
  tinted: {
    backgroundColor: colors.surface,
  },
});
