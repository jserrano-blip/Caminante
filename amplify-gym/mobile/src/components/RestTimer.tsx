import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, spacing } from '../theme';

interface Props {
  /** Segundos iniciales; cambia la key del componente para reiniciar. */
  seconds: number;
  onDone?: () => void;
  onDismiss: () => void;
}

function fmt(total: number): string {
  const m = Math.floor(Math.max(0, total) / 60);
  const s = Math.max(0, total) % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Cronómetro de descanso flotante: cuenta regresiva con +30s / −30s. */
export function RestTimer({ seconds, onDone, onDismiss }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const doneRef = useRef(false);

  useEffect(() => {
    setRemaining(seconds);
    doneRef.current = false;
  }, [seconds]);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (!doneRef.current) {
            doneRef.current = true;
            onDone?.();
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finished = remaining <= 0;

  return (
    <View style={[styles.container, finished && styles.finished]}>
      <Pressable onPress={() => setRemaining((r) => Math.max(0, r - 30))} hitSlop={8} style={styles.adjust}>
        <Text style={styles.adjustText}>−30s</Text>
      </Pressable>
      <View style={styles.center}>
        <Ionicons name="timer-outline" size={18} color={colors.white} />
        <Text style={styles.time}>{finished ? '¡Listo!' : fmt(remaining)}</Text>
      </View>
      <Pressable onPress={() => setRemaining((r) => r + 30)} hitSlop={8} style={styles.adjust}>
        <Text style={styles.adjustText}>+30s</Text>
      </Pressable>
      <Pressable onPress={onDismiss} hitSlop={8} style={styles.close}>
        <Ionicons name="close" size={20} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    ...shadow.soft,
  },
  finished: { backgroundColor: colors.primaryDark },
  adjust: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  adjustText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  center: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  time: { color: colors.white, fontSize: 20, fontWeight: '700', fontVariant: ['tabular-nums'] },
  close: { marginLeft: 6 },
});
