import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { radius, shadow, spacing, type ThemeColors } from '../theme';
import { useTheme } from '../context/ThemeContext';

type Variant = 'primary' | 'secondary' | 'ghost';

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ title, onPress, variant = 'primary', disabled, loading, small, style }: Props) {
  const { colors: c } = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        small && styles.small,
        isPrimary && !small && styles.primary,
        isSecondary && styles.secondary,
        variant === 'ghost' && styles.ghost,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {isPrimary ? (
        <LinearGradient
          colors={[c.primary, c.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {loading ? (
        <ActivityIndicator color={isPrimary ? c.white : c.primary} />
      ) : (
        <Text
          style={[
            styles.label,
            small && styles.labelSmall,
            { color: isPrimary ? c.white : c.primary },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const createStyles = (c: ThemeColors) => {
  return StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  primary: {
    height: 52,
    paddingVertical: 0,
    ...shadow.soft,
  },
  secondary: {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.iceBorder,
  },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.8 },
  label: { fontSize: 16, fontWeight: '700' },
  labelSmall: { fontSize: 14, fontWeight: '600' },
});
}
