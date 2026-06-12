import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSession, listRecords } from '../api/endpoints';
import type { FinishSummary, PersonalRecord, WorkoutSession } from '../api/types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorBanner } from '../components/ErrorBanner';
import { StatTile } from '../components/StatTile';
import { useApp } from '../context/AppContext';
import { formatWeight } from '../lib/formulas';
import { errorMessage } from '../lib/useLoad';
import type { EntrenarStackParamList } from '../navigation/types';
import { colors, radius, spacing, TAB_BAR_SPACE, typography } from '../theme';

type Props = NativeStackScreenProps<EntrenarStackParamList, 'WorkoutSummary'>;

const RECORD_LABEL: Record<string, string> = {
  WEIGHT: 'Peso máximo',
  E1RM: '1RM estimado',
  VOLUME: 'Volumen de sesión',
  REPS: 'Reps máximas',
};

const RECORD_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  WEIGHT: 'barbell',
  E1RM: 'trending-up',
  VOLUME: 'layers',
  REPS: 'repeat',
};

/** Reconstruye el resumen de una sesión pasada a partir de sus series. */
function summaryFromSession(session: WorkoutSession, records: PersonalRecord[]): FinishSummary {
  const effective = (session.sets ?? []).filter((s) => !s.isWarmup);
  const durationMin =
    session.finishedAt && session.startedAt
      ? Math.max(1, Math.round((new Date(session.finishedAt).getTime() - new Date(session.startedAt).getTime()) / 60000))
      : 0;
  return {
    durationMin,
    totalVolumeKg: Math.round(effective.reduce((acc, s) => acc + s.reps * s.weightKg, 0)),
    totalSets: effective.length,
    newRecords: records,
  };
}

export function WorkoutSummaryScreen({ navigation, route }: Props) {
  const { summary: liveSummary, sessionName, sessionId } = route.params;
  const { user, unit } = useApp();
  const readOnly = !liveSummary && !!sessionId;

  const [summary, setSummary] = useState<FinishSummary | null>(liveSummary ?? null);
  const [name, setName] = useState(sessionName ?? '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!readOnly || !sessionId || !user) return;
    let active = true;
    (async () => {
      try {
        const [session, records] = await Promise.all([getSession(sessionId), listRecords(user.id)]);
        if (!active) return;
        setName(session.name);
        setSummary(summaryFromSession(session, records.filter((r) => r.sessionId === sessionId)));
      } catch (err) {
        if (active) setError(errorMessage(err));
      }
    })();
    return () => {
      active = false;
    };
  }, [readOnly, sessionId, user]);

  const hasRecords = (summary?.newRecords.length ?? 0) > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card variant="hero" style={styles.hero}>
          <View style={styles.trophyBubble}>
            <Ionicons name={hasRecords ? 'trophy' : 'checkmark-done'} size={40} color={colors.white} />
          </View>
          <Text style={styles.heroEyebrow}>{readOnly ? 'SESIÓN PASADA' : 'SESIÓN COMPLETADA'}</Text>
          <Text style={styles.heroTitle}>{readOnly ? name : '¡Buen trabajo!'}</Text>
          {!readOnly ? <Text style={styles.heroSub}>{name}</Text> : null}

          {summary ? (
            <View style={styles.tiles}>
              <StatTile variant="hero" icon="time-outline" label="Duración" value={`${summary.durationMin} min`} />
              <StatTile
                variant="hero"
                icon="barbell-outline"
                label="Volumen"
                value={formatWeight(summary.totalVolumeKg, unit)}
              />
              <StatTile variant="hero" icon="layers-outline" label="Series" value={String(summary.totalSets)} />
            </View>
          ) : null}
        </Card>

        {error ? <ErrorBanner message={error} /> : null}
        {!summary && !error ? <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.xl }} /> : null}

        {summary ? (
          <Card style={{ marginTop: spacing.md }}>
            <Text style={typography.eyebrow}>RÉCORDS PERSONALES</Text>
            <Text style={styles.sectionTitle}>
              {hasRecords ? '¡Nuevos récords!' : 'Sin PRs nuevos'}
            </Text>
            {!hasRecords ? (
              <Text style={styles.muted}>La constancia también construye fuerza. El próximo PR está cerca.</Text>
            ) : (
              summary.newRecords.map((rec) => (
                <View key={rec.id} style={styles.recordRow}>
                  <View style={styles.recordBubble}>
                    <Ionicons name={RECORD_ICON[rec.type] ?? 'trophy'} size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recordName}>{rec.exercise?.name ?? 'Ejercicio'}</Text>
                    <Text style={styles.recordType}>{RECORD_LABEL[rec.type] ?? rec.type}</Text>
                  </View>
                  <Text style={styles.recordValue}>
                    {rec.type === 'REPS'
                      ? `${rec.value} reps`
                      : `${formatWeight(rec.value, unit)}${rec.reps ? ` × ${rec.reps}` : ''}`}
                  </Text>
                </View>
              ))
            )}
          </Card>
        ) : null}

        <Button
          title={readOnly ? 'Volver al historial' : 'Volver a Entrenar'}
          onPress={() => (readOnly ? navigation.goBack() : navigation.popToTop())}
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: TAB_BAR_SPACE },
  hero: { alignItems: 'center', paddingVertical: spacing.xl },
  trophyBubble: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroEyebrow: { ...typography.eyebrow, color: 'rgba(255,255,255,0.7)' },
  heroTitle: { fontSize: 26, fontWeight: '800', color: colors.white, marginTop: 4, textAlign: 'center' },
  heroSub: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  tiles: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, alignSelf: 'stretch' },
  sectionTitle: { ...typography.subtitle, fontSize: 19, marginTop: 4, marginBottom: spacing.sm },
  muted: typography.muted,
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.ice,
  },
  recordBubble: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.ice,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  recordType: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  recordValue: { fontSize: 16, fontWeight: '700', color: colors.primary },
});
