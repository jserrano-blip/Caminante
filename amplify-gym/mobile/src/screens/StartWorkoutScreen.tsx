import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createSession, listGyms, listRoutines } from '../api/endpoints';
import type { Routine } from '../api/types';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { ScreenHeader } from '../components/ScreenHeader';
import { useApp } from '../context/AppContext';
import { errorMessage, useLoad } from '../lib/useLoad';
import type { EntrenarStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<EntrenarStackParamList, 'StartWorkout'>;

export function StartWorkoutScreen({ navigation }: Props) {
  const { user, gym, setGym } = useApp();
  const userId = user?.id ?? '';
  const routines = useLoad(() => listRoutines(userId), [userId]);
  const gyms = useLoad(() => listGyms(userId), [userId]);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      routines.reload();
      gyms.reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const start = async (routine?: Routine) => {
    if (starting) return;
    setStarting(true);
    setStartError(null);
    const name = routine?.name ?? 'Entrenamiento libre';
    try {
      const session = await createSession({
        userId,
        name,
        gymId: gym?.id,
        routineId: routine?.id,
      });
      navigation.navigate('LiveWorkout', { sessionId: session.id, sessionName: name, routine });
    } catch (err) {
      setStartError(errorMessage(err));
    } finally {
      setStarting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Entrenar" subtitle="Elige una rutina o empieza en vacío" />

        {startError ? <ErrorBanner message={startError} /> : null}
        {routines.error ? <ErrorBanner message={routines.error} onRetry={routines.reload} /> : null}

        <View style={styles.body}>
          <Card tinted>
            <Text style={styles.sectionTitle}>Gimnasio activo</Text>
            <Text style={styles.gymHint}>Define la barra y los discos de la calculadora.</Text>
            <View style={styles.chips}>
              <Chip label="Sin gimnasio" selected={!gym} onPress={() => setGym(null)} />
              {(gyms.data ?? []).map((g) => (
                <Chip key={g.id} label={g.name} selected={gym?.id === g.id} onPress={() => setGym(g)} />
              ))}
            </View>
          </Card>

          <Pressable onPress={() => start(undefined)} disabled={starting}>
            <Card style={styles.emptyWorkout}>
              <Ionicons name="flash-outline" size={26} color={colors.white} />
              <View style={{ flex: 1 }}>
                <Text style={styles.emptyWorkoutTitle}>Entrenamiento vacío</Text>
                <Text style={styles.emptyWorkoutSub}>Agrega ejercicios sobre la marcha</Text>
              </View>
              {starting ? <ActivityIndicator color={colors.white} /> : <Ionicons name="chevron-forward" size={20} color={colors.white} />}
            </Card>
          </Pressable>

          <Text style={[styles.sectionTitle, { marginTop: spacing.sm }]}>Mis rutinas</Text>
          {routines.loading ? <ActivityIndicator color={colors.primary} /> : null}
          {routines.data && routines.data.length === 0 ? (
            <EmptyState
              icon="list-outline"
              title="Sin rutinas todavía"
              subtitle="Crea plantillas en la pestaña Rutinas"
            />
          ) : null}
          {(routines.data ?? []).map((routine) => (
            <Pressable key={routine.id} onPress={() => start(routine)} disabled={starting}>
              <Card style={styles.routineCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.routineName}>{routine.name}</Text>
                  <Text style={styles.routineMeta}>
                    {routine.exercises.length} ejercicios
                    {routine.description ? ` · ${routine.description}` : ''}
                  </Text>
                  <Text style={styles.routineExercises} numberOfLines={2}>
                    {routine.exercises
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((e) => e.exercise.name)
                      .join(' · ')}
                  </Text>
                </View>
                <Ionicons name="play-circle" size={32} color={colors.primary} />
              </Card>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xl },
  body: { paddingHorizontal: spacing.md, gap: spacing.md },
  sectionTitle: { ...typography.subtitle },
  gymHint: { ...typography.muted, marginTop: 2, marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  emptyWorkout: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.md,
  },
  emptyWorkoutTitle: { color: colors.white, fontSize: 17, fontWeight: '700' },
  emptyWorkoutSub: { color: colors.surfaceBorder, fontSize: 13, marginTop: 2 },
  routineCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  routineName: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  routineMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  routineExercises: { fontSize: 12, color: colors.accent, marginTop: 4 },
});
