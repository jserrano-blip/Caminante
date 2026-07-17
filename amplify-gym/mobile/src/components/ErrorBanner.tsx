import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing, type ThemeColors } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface Props {
  message: string;
  onRetry?: () => void;
}

/** Banner azul amable para errores de red / servidor. */
export function ErrorBanner({ message, onRetry }: Props) {
  const { colors: c } = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline-outline" size={20} color={c.white} />
      <Text style={styles.text}>{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} hitSlop={8} style={styles.retry}>
          <Ionicons name="refresh" size={18} color={c.white} />
        </Pressable>
      ) : null}
    </View>
  );
}

const createStyles = (c: ThemeColors) => {
  return StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: c.navy700,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  text: { flex: 1, color: c.white, fontSize: 13, fontWeight: '500' },
  retry: { padding: 2 },
});
}
