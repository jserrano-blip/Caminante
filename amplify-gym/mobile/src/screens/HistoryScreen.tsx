import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listSessions } from '../api/endpoints';
import type { WorkoutSession } from '../api/types';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { ScreenHeader } from '../components/ScreenHeader';
import { useApp } from '../context/AppContext';
import { formatWeight } from '../lib/formulas';
import { useLoad } from '../lib/useLoad';
import type { EntrenarStackParamList } from '../navigation/types';
import { colors, radius, spacing, TAB_BAR_SPACE } from '../theme';

type Props = NativeStackScreenProps<EntrenarStackParamList, 'History'>;

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(d, today)) return 'Hoy';
  if (sameDay(d, yesterday)) return 'Ayer';
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function sessionStats(session: WorkoutSession): { sets: number; volumeKg: number } {
  const effective = (session.sets ?? []).filter((s) => !s.isWarmup);
  return {
    sets: effective.length,
    volumeKg: Math.round(effective.reduce((acc, s) => acc + s.reps * s.weightKg, 0)),
  };
}

export function HistoryScreen({ navigation }: Props) {
  const { user, unit } = useApp();
  const userId = user?.id ?? '';
  const { data, loading, error, reload } = useLoad(() => listSessions(userId), [userId]);

  const finished = (data ?? []).filter((s) => s.finishedAt);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          eyebrow="ENTRENAR"
          title="Historial"
          subtitle="Todas tus sesiones terminadas"
          right={
            <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
              <View style={styles.headerLink}>
                <Ionicons name="close" size={22} color={colors.primary} />
              </View>
            </Pressable>
          }
        />

        {error ? <ErrorBanner message={error} onRetry={reload} /> : null}
        {loading ? <ActivityIndicator color={colors.primary} style={{ margin: spacing.lg }} /> : null}

        <View style={styles.body}>
          {!loading && finished.length === 0 ? (
            <EmptyState
              icon="time-outline"
              title="Aún no hay sesiones"
              subtitle="Cuando termines un entrenamiento aparecerá aquí"
            />
          ) : null}

          {finished.map((session) => {
            const stats = sessionStats(session);
            return (
              <Pressable
                key={session.id}
                onPress={() =>
                  navigation.navigate('WorkoutSummary', { sessionId: session.id, sessionName: session.name })
                }
              >
                <Card style={styles.row}>
                  <View style={styles.dateBubble}>
                    <Text style={styles.dateText}>{formatDate(session.startedAt)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{session.name}</Text>
                    <Text style={styles.meta}>
                      {stats.sets} series · {formatWeight(stats.volumeKg, unit)}
                      {session.gym ? ` · ${session.gym.name}` : ''}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </Card>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: TAB_BAR_SPACE },
  body: { paddingHorizontal: spacing.md, gap: spacing.sm },
  headerLink: { flexDirection: 'row', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 14 },
  dateBubble: {
    minWidth: 56,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.ice,
    alignItems: 'center',
  },
  dateText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  name: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
