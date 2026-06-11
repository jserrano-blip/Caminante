import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listExercises } from '../api/endpoints';
import type { Exercise } from '../api/types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorBanner } from '../components/ErrorBanner';
import { ScreenHeader } from '../components/ScreenHeader';
import { useApp } from '../context/AppContext';
import { useLoad } from '../lib/useLoad';
import type { RutinasStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RutinasStackParamList, 'Exercises'>;

const GROUP_ORDER = ['PECHO', 'ESPALDA', 'PIERNA', 'HOMBRO', 'BRAZO', 'CORE', 'OTRO'];

export function ExercisesScreen({ navigation }: Props) {
  const { user } = useApp();
  const userId = user?.id ?? '';
  const { data, loading, error, reload } = useLoad(() => listExercises(userId), [userId]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  // agrupa por muscleGroup; solo padres en el primer nivel, variantes anidadas
  const grouped = useMemo(() => {
    const parents = (data ?? []).filter((e) => !e.variantOfId);
    const byGroup = new Map<string, Exercise[]>();
    for (const ex of parents) {
      const list = byGroup.get(ex.muscleGroup) ?? [];
      list.push(ex);
      byGroup.set(ex.muscleGroup, list);
    }
    // variantes cuyo padre no está en la lista: muéstralas como nivel raíz
    const parentIds = new Set(parents.map((p) => p.id));
    for (const ex of data ?? []) {
      if (ex.variantOfId && !parentIds.has(ex.variantOfId)) {
        const list = byGroup.get(ex.muscleGroup) ?? [];
        if (!list.some((e) => e.id === ex.id)) list.push(ex);
        byGroup.set(ex.muscleGroup, list);
      }
    }
    const keys = [...byGroup.keys()].sort(
      (a, b) => (GROUP_ORDER.indexOf(a) + 99) - (GROUP_ORDER.indexOf(b) + 99)
    );
    return keys.map((key) => ({
      group: key,
      exercises: (byGroup.get(key) ?? []).sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, [data]);

  const renderExercise = (ex: Exercise, isVariant = false) => (
    <Pressable
      key={ex.id}
      onPress={() => navigation.navigate('ExerciseEdit', { exercise: ex })}
      style={({ pressed }) => [styles.row, isVariant && styles.variantRow, pressed && { opacity: 0.7 }]}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>
          {isVariant ? '↳ ' : ''}
          {ex.name}
          {ex.isPowerlift ? '  🏆' : ''}
        </Text>
        <Text style={styles.meta}>
          {ex.category}
          {ex.userId ? ' · propio' : ' · catálogo'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Ejercicios" subtitle="Catálogo y variantes" />
        {error ? <ErrorBanner message={error} onRetry={reload} /> : null}
        {loading ? <ActivityIndicator color={colors.primary} style={{ margin: spacing.lg }} /> : null}

        <View style={styles.body}>
          <Button title="＋ Crear ejercicio propio" onPress={() => navigation.navigate('ExerciseEdit', {})} />

          {grouped.map(({ group, exercises }) => (
            <Card key={group}>
              <Text style={styles.groupTitle}>{group}</Text>
              {exercises.map((ex) => (
                <View key={ex.id}>
                  {renderExercise(ex)}
                  {(ex.variants ?? []).map((v) => renderExercise(v, true))}
                </View>
              ))}
            </Card>
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
  groupTitle: { ...typography.subtitle, fontSize: 14, color: colors.accent, marginBottom: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  variantRow: { paddingLeft: spacing.lg },
  name: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  meta: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
});
