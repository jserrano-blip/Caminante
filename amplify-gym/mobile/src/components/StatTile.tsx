import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

interface Props {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function StatTile({ label, value, icon }: Props) {
  return (
    <View style={styles.tile}>
      {icon ? <Ionicons name={icon} size={18} color={colors.accent} style={styles.icon} /> : null}
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.md,
    alignItems: 'flex-start',
  },
  icon: { marginBottom: 6 },
  value: { fontSize: 21, fontWeight: '700', color: colors.primary },
  label: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
