import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, makeTypography, type ThemeColors } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface Props {
  title: string;
  subtitle?: string;
  /** Label corto en mayúsculas sobre el título. */
  eyebrow?: string;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, eyebrow, right }: Props) {
  const { colors: c } = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
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

const createStyles = (c: ThemeColors) => {
  const typography = makeTypography(c);
  return StyleSheet.create({
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
  subtitle: { ...typography.muted, marginTop: 2, color: c.textMuted },
});
}
