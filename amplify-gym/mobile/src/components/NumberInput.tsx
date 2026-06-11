import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius } from '../theme';

interface Props {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  /** Permite decimales en el teclado (por defecto sí). */
  decimals?: boolean;
  suffix?: string;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}

function clamp(v: number, min?: number, max?: number): number {
  let out = v;
  if (min !== undefined) out = Math.max(min, out);
  if (max !== undefined) out = Math.min(max, out);
  return Math.round(out * 100) / 100;
}

/** Stepper numérico: − [valor editable] + */
export function NumberInput({ value, onChange, step = 1, min, max, decimals = true, suffix, style, compact }: Props) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(value === 0 ? '0' : String(value));
  }, [value]);

  const commit = (raw: string) => {
    const normalized = raw.replace(',', '.');
    const parsed = decimals ? parseFloat(normalized) : parseInt(normalized, 10);
    if (!Number.isFinite(parsed)) {
      setText(String(value));
      return;
    }
    const next = clamp(parsed, min, max);
    setText(String(next));
    onChange(next);
  };

  return (
    <View style={[styles.container, compact && styles.compact, style]}>
      <Pressable
        style={styles.button}
        onPress={() => onChange(clamp(value - step, min, max))}
        hitSlop={8}
      >
        <Text style={styles.buttonText}>−</Text>
      </Pressable>
      <View style={styles.valueWrap}>
        <TextInput
          style={[styles.input, compact && styles.inputCompact]}
          value={text}
          onChangeText={setText}
          onBlur={() => commit(text)}
          onSubmitEditing={() => commit(text)}
          keyboardType={decimals ? 'decimal-pad' : 'number-pad'}
          selectTextOnFocus
          returnKeyType="done"
        />
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>
      <Pressable
        style={styles.button}
        onPress={() => onChange(clamp(value + step, min, max))}
        hitSlop={8}
      >
        <Text style={styles.buttonText}>＋</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
  },
  compact: { borderRadius: radius.sm },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: 18, fontWeight: '700', color: colors.primary },
  valueWrap: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' },
  input: {
    minWidth: 44,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingVertical: 6,
  },
  inputCompact: { fontSize: 15, minWidth: 36, paddingVertical: 4 },
  suffix: { fontSize: 12, color: colors.textMuted, marginLeft: 2 },
});
