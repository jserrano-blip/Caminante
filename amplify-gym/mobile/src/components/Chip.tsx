import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { radius, spacing, type ThemeColors } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Chip({ label, selected, onPress, style }: Props) {
  const { colors: c } = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selected,
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (c: ThemeColors) => {
  return StyleSheet.create({
  chip: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: c.ice,
    borderWidth: 1,
    borderColor: c.surfaceBorder,
    alignSelf: 'flex-start',
  },
  selected: {
    backgroundColor: c.primary,
    borderColor: c.primary,
  },
  label: { color: c.textPrimary, fontSize: 13, fontWeight: '500' },
  labelSelected: { color: c.white },
});
}
