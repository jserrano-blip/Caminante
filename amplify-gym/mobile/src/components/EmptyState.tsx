import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, type ThemeColors } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon = 'cloud-outline', title, subtitle }: Props) {
  const { colors: c } = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={44} color={c.textMuted} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const createStyles = (c: ThemeColors) => {
  return StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: spacing.xl, paddingHorizontal: spacing.lg },
  title: {
    marginTop: spacing.sm,
    fontSize: 16,
    fontWeight: '600',
    color: c.textPrimary,
    textAlign: 'center',
  },
  subtitle: { marginTop: 4, fontSize: 13, color: c.textMuted, textAlign: 'center' },
});
}
