import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createRecovery, getDashboard, getStrengthAnalytics } from '../api/endpoints';
import type { DashboardResponse } from '../api/types';
import { BarChart } from '../components/BarChart';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { LineChart } from '../components/LineChart';
import { SimpleSlider } from '../components/SimpleSlider';
import { StatTile } from '../components/StatTile';
import { useApp } from '../context/AppContext';
import { formatWeight, toDisplayWeight } from '../lib/formulas';
import { errorMessage, useLoad } from '../lib/useLoad';
import { colors, radius, spacing, TAB_BAR_SPACE, typography } from '../theme';

function shortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function greeting(): { text: string; icon: keyof typeof Ionicons.glyphMap } {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Buenos días', icon: 'sunny' };
  if (h < 19) return { text: 'Buenas tardes', icon: 'partly-sunny' };
  return { text: 'Buenas noches', icon: 'moon' };
}

/** Semanas consecutivas con al menos una sesión, terminando en la semana actual o la anterior. */
function weeklyStreak(weeks: { weekStart: string; sessions: number }[]): number {
  const WEEK = 7 * 24 * 3600 * 1000;
  const active = weeks
    .filter((w) => w.sessions > 0)
    .map((w) => new Date(w.weekStart).getTime())
    .sort((a, b) => b - a);
  if (active.length === 0) return 0;
  if (Date.now() - active[0] > 2 * WEEK) return 0;
  let streak = 1;
  for (let i = 1; i < active.length; i++) {
    // tolerancia de un día por husos horarios / alineación de semana
    if (active[i - 1] - active[i] <= WEEK + 24 * 3600 * 1000) streak += 1;
    else break;
  }
  return streak;
}

const RECORD_LABEL: Record<string, string> = {
  WEIGHT: 'Peso máximo',
  E1RM: '1RM estimado',
  VOLUME: 'Volumen',
  REPS: 'Reps',
};

/** Ejercicio "favorito": el más usado en la última sesión, o el del PR más reciente. */
function favoriteExerciseId(data: DashboardResponse): { id: string; name: string } | null {
  const sets = data.lastSession?.sets ?? [];
  if (sets.length > 0) {
    const counts = new Map<string, { count: number; name: string }>();
    for (const s of sets) {
      const entry = counts.get(s.exerciseId) ?? { count: 0, name: s.exercise?.name ?? 'Ejercicio' };
      entry.count += 1;
      counts.set(s.exerciseId, entry);
    }
    let best: { id: string; name: string; count: number } | null = null;
    for (const [id, v] of counts) {
      if (!best || v.count > best.count) best = { id, name: v.name, count: v.count };
    }
    if (best) return { id: best.id, name: best.name };
  }
  const rec = data.recentRecords[0];
  if (rec?.exercise) return { id: rec.exerciseId, name: rec.exercise.name };
  return null;
}

export function DashboardScreen() {
  const { user, unit } = useApp();
  const isFocused = useIsFocused();
  const userId = user?.id ?? '';
  const { data, loading, error, reload } = useLoad(() => getDashboard(userId), [userId]);

  const favorite = useMemo(() => (data ? favoriteExerciseId(data) : null), [data]);
  const strength = useLoad(
    () => (favorite ? getStrengthAnalytics(userId, favorite.id) : Promise.resolve(null)),
    [userId, favorite?.id]
  );

  // check-in rápido de recuperación
  const [sleep, setSleep] = useState(7.5);
  const [soreness, setSoreness] = useState(3);
  const [fatigue, setFatigue] = useState(3);
  const [savingCheckin, setSavingCheckin] = useState(false);
  const [checkinDone, setCheckinDone] = useState(false);
  const [checkinError, setCheckinError] = useState<string | null>(null);

  const hasTodayRecovery =
    checkinDone || (data?.recoveryTrend ?? []).some((r) => isToday(r.date));

  const saveCheckin = async () => {
    setSavingCheckin(true);
    setCheckinError(null);
    try {
      await createRecovery({ userId, sleepHours: sleep, soreness, fatigue });
      setCheckinDone(true);
    } catch (err) {
      setCheckinError(errorMessage(err));
    } finally {
      setSavingCheckin(false);
    }
  };

  const thisWeek = data?.weeklyVolume[data.weeklyVolume.length - 1];
  const lastWeight = data?.bodyWeightTrend[data.bodyWeightTrend.length - 1];
  const streak = data ? weeklyStreak(data.weeklyVolume) : 0;
  const hello = greeting();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {isFocused ? <StatusBar style="light" /> : null}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={false} onRefresh={reload} tintColor={colors.white} />}
      >
        <LinearGradient
          colors={[colors.navy800, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.9, y: 1.1 }}
          style={styles.hero}
        >
          <View style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroEyebrow}>{hello.text.toUpperCase()}</Text>
              <Text style={styles.heroTitle}>{user?.name ?? ''}</Text>
              <Text style={styles.heroSub}>Tu progreso de un vistazo</Text>
            </View>
            <View style={styles.heroBubble}>
              <Ionicons name={hello.icon} size={22} color={colors.white} />
            </View>
          </View>

          <View style={styles.tiles}>
            <StatTile
              variant="hero"
              icon="barbell-outline"
              label="Volumen semana"
              value={thisWeek ? formatWeight(thisWeek.volumeKg, unit) : '—'}
            />
            <StatTile
              variant="hero"
              icon="flame-outline"
              label="Racha"
              value={streak > 0 ? `${streak} sem` : '—'}
            />
            <StatTile
              variant="hero"
              icon="body-outline"
              label="Peso corporal"
              value={lastWeight ? formatWeight(lastWeight.weightKg, unit) : '—'}
            />
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {error ? <ErrorBanner message={error} onRetry={reload} /> : null}
          {loading ? <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.xl }} /> : null}

          {data ? (
            <>
              <Card>
                <Text style={typography.eyebrow}>PROGRESO</Text>
                <Text style={styles.sectionTitle}>Volumen semanal</Text>
                {data.weeklyVolume.length > 0 ? (
                  <BarChart
                    data={data.weeklyVolume.map((w) => ({
                      label: shortDate(w.weekStart),
                      value: toDisplayWeight(w.volumeKg, unit),
                    }))}
                  />
                ) : (
                  <EmptyState icon="bar-chart-outline" title="Sin entrenamientos todavía" subtitle="Tu volumen aparecerá aquí" />
                )}
              </Card>

              {favorite ? (
                <Card>
                  <Text style={typography.eyebrow}>FUERZA</Text>
                  <Text style={styles.sectionTitle}>e1RM · {favorite.name}</Text>
                  {strength.data && strength.data.points.length > 0 ? (
                    <LineChart
                      data={strength.data.points.map((p) => ({
                        label: shortDate(p.date),
                        value: toDisplayWeight(p.e1rmKg, unit),
                      }))}
                      formatValue={(v) => `${v} ${unit === 'LB' ? 'lb' : 'kg'}`}
                    />
                  ) : strength.loading ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Text style={styles.mutedText}>Aún no hay datos de fuerza para este ejercicio.</Text>
                  )}
                </Card>
              ) : null}

              <Card>
                <Text style={typography.eyebrow}>LOGROS</Text>
                <Text style={styles.sectionTitle}>PRs recientes</Text>
                {data.recentRecords.length === 0 ? (
                  <Text style={styles.mutedText}>Tus récords aparecerán aquí al finalizar sesiones.</Text>
                ) : (
                  data.recentRecords.slice(0, 5).map((rec) => (
                    <View key={rec.id} style={styles.recordRow}>
                      <View style={styles.recordBubble}>
                        <Ionicons name="trophy" size={16} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.recordName}>{rec.exercise?.name ?? 'Ejercicio'}</Text>
                        <Text style={styles.recordMeta}>
                          {RECORD_LABEL[rec.type] ?? rec.type} · {shortDate(rec.date)}
                        </Text>
                      </View>
                      <Text style={styles.recordValue}>
                        {rec.type === 'REPS' ? `${rec.value} reps` : formatWeight(rec.value, unit)}
                      </Text>
                    </View>
                  ))
                )}
              </Card>

              {!hasTodayRecovery ? (
                <Card tinted>
                  <Text style={typography.eyebrow}>RECUPERACIÓN</Text>
                  <Text style={styles.sectionTitle}>Check-in de hoy</Text>
                  <Text style={styles.mutedText}>Hoy aún no registras cómo te sientes.</Text>
                  <SimpleSlider label="Horas de sueño" value={sleep} onChange={setSleep} min={0} max={12} step={0.5} format={(v) => `${v} h`} />
                  <SimpleSlider label="Dolor muscular" value={soreness} onChange={setSoreness} min={1} max={10} />
                  <SimpleSlider label="Fatiga" value={fatigue} onChange={setFatigue} min={1} max={10} />
                  {checkinError ? <Text style={styles.checkinError}>{checkinError}</Text> : null}
                  <Button title="Guardar check-in" onPress={saveCheckin} loading={savingCheckin} style={{ marginTop: spacing.sm }} />
                </Card>
              ) : null}
            </>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // el área segura comparte el color superior del hero para un look full-bleed
  safe: { flex: 1, backgroundColor: colors.navy800 },
  scroll: { backgroundColor: colors.background },
  content: { paddingBottom: TAB_BAR_SPACE },
  hero: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  heroEyebrow: { ...typography.eyebrow, color: 'rgba(255,255,255,0.65)' },
  heroTitle: { fontSize: 30, fontWeight: '800', color: colors.white, marginTop: 2 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  heroBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tiles: { flexDirection: 'row', gap: spacing.sm },
  body: { paddingHorizontal: spacing.md, paddingTop: spacing.md, gap: spacing.md },
  sectionTitle: { ...typography.subtitle, fontSize: 19, marginTop: 2, marginBottom: spacing.sm },
  mutedText: { ...typography.muted, marginBottom: spacing.sm },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.ice,
  },
  recordBubble: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: colors.ice,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  recordMeta: { fontSize: 11, color: colors.textMuted },
  recordValue: { fontSize: 15, fontWeight: '700', color: colors.primary },
  checkinError: { color: colors.primaryDark, fontSize: 13, fontWeight: '600', marginTop: 4 },
});
