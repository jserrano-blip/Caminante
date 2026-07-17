import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cancelRestNotification, scheduleRestEndNotification } from '../lib/restNotifications';
import { radius, shadow, spacing, type ThemeColors } from '../theme';
import { useTheme } from '../context/ThemeContext';

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
  const { colors: c } = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  const [remaining, setRemaining] = useState(seconds);
  const doneRef = useRef(false);
  const notifId = useRef<string | null>(null);

  useEffect(() => {
    setRemaining(seconds);
    doneRef.current = false;
  }, [seconds]);

  // notificación local "Descanso terminado": programa al montar, cancela al cerrar
  useEffect(() => {
    void scheduleRestEndNotification(seconds).then((id) => {
      notifId.current = id;
    });
    return () => {
      void cancelRestNotification(notifId.current);
      notifId.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const adjust = (delta: number) => {
    const next = Math.max(0, remaining + delta);
    setRemaining(next);
    const prev = notifId.current;
    notifId.current = null;
    void (async () => {
      await cancelRestNotification(prev);
      if (next > 0) notifId.current = await scheduleRestEndNotification(next);
    })();
  };

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
    <LinearGradient
      colors={finished ? [c.navy900, c.navy700] : [c.navy800, c.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Pressable onPress={() => adjust(-30)} hitSlop={8} style={styles.adjust}>
        <Text style={styles.adjustText}>−30s</Text>
      </Pressable>
      <View style={styles.center}>
        <Ionicons name="timer-outline" size={20} color={c.sky} />
        <Text style={styles.time}>{finished ? '¡Listo!' : fmt(remaining)}</Text>
      </View>
      <Pressable onPress={() => adjust(30)} hitSlop={8} style={styles.adjust}>
        <Text style={styles.adjustText}>+30s</Text>
      </Pressable>
      <Pressable onPress={onDismiss} hitSlop={8} style={styles.close}>
        <Ionicons name="close" size={20} color={c.white} />
      </Pressable>
    </LinearGradient>
  );
}

const createStyles = (c: ThemeColors) => {
  return StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: c.navy800,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    ...shadow.soft,
    shadowOpacity: 0.25,
  },
  adjust: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  adjustText: { color: c.white, fontWeight: '700', fontSize: 13 },
  center: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  time: { color: c.white, fontSize: 28, fontWeight: '800', fontVariant: ['tabular-nums'] },
  close: { marginLeft: 6 },
});
}
