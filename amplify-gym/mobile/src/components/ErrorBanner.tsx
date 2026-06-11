import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

interface Props {
  message: string;
  onRetry?: () => void;
}

/** Banner azul amable para errores de red / servidor. */
export function ErrorBanner({ message, onRetry }: Props) {
  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline-outline" size={20} color={colors.white} />
      <Text style={styles.text}>{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} hitSlop={8} style={styles.retry}>
          <Ionicons name="refresh" size={18} color={colors.white} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryDark,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  text: { flex: 1, color: colors.white, fontSize: 13, fontWeight: '500' },
  retry: { padding: 2 },
});
