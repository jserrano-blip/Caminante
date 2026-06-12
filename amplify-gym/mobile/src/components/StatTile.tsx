import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme';

interface Props {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** "hero": versión glassy para usar sobre fondos de gradiente oscuro. */
  variant?: 'light' | 'hero';
  style?: StyleProp<ViewStyle>;
}

export function StatTile({ label, value, icon, variant = 'light', style }: Props) {
  const hero = variant === 'hero';
  return (
    <View style={[styles.tile, hero && styles.tileHero, style]}>
      {icon ? (
        <View style={[styles.bubble, hero && styles.bubbleHero]}>
          <Ionicons name={icon} size={16} color={hero ? colors.white : colors.primary} />
        </View>
      ) : null}
      <Text style={[styles.value, hero && styles.valueHero]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={[styles.label, hero && styles.labelHero]} numberOfLines={2}>
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
    borderColor: colors.iceBorder,
    padding: spacing.md,
    alignItems: 'flex-start',
  },
  tileHero: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.25)',
  },
  bubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.ice,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  bubbleHero: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  value: { fontSize: 26, fontWeight: '700', color: colors.primary },
  valueHero: { color: colors.white },
  label: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  labelHero: { color: 'rgba(255,255,255,0.75)' },
});
