import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface Props {
  title: string;
  subtitle?: string;
  /** Label corto en mayúsculas sobre el título. */
  eyebrow?: string;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, eyebrow, right }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.texts}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  texts: { flex: 1 },
  eyebrow: { ...typography.eyebrow, marginBottom: 4 },
  title: typography.title,
  subtitle: { ...typography.muted, marginTop: 2, color: colors.textMuted },
});
