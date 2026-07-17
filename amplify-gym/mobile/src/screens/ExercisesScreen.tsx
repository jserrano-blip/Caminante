import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listExercises } from '../api/endpoints';
import type { Exercise } from '../api/types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorBanner } from '../components/ErrorBanner';
import { flattenExercises } from '../components/ExercisePickerModal';
import { ScreenHeader } from '../components/ScreenHeader';
import { useApp } from '../context/AppContext';
import { normalize } from '../lib/text';
import { useLoad } from '../lib/useLoad';
import type { RutinasStackParamList } from '../navigation/types';
import { TAB_BAR_SPACE, radius, spacing, makeTypography, type ThemeColors } from '../theme';
import { useTheme } from '../context/ThemeContext';

type Props = NativeStackScreenProps<RutinasStackParamList, 'Exercises'>;

const GROUP_ORDER = ['PECHO', 'ESPALDA', 'PIERNA', 'HOMBRO', 'BRAZO', 'CORE', 'OTRO'];

export function ExercisesScreen({ navigation }: Props) {
  const { colors: c } = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  const { user } = useApp();
  const userId = user?.id ?? '';
  const { data, loading, error, reload } = useLoad(() => listExercises(userId), [userId]);
  const [query, setQuery] = useState('');

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

  // búsqueda: lista plana de coincidencias (padres + variantes sin duplicar)
  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return null;
    return flattenExercises(data ?? []).filter(
      (e) => normalize(e.name).includes(q) || normalize(e.muscleGroup).includes(q)
    );
  }, [data, query]);

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
          {ex.isPowerlift ? <Text style={styles.sbdTag}>  SBD</Text> : null}
        </Text>
        <Text style={styles.meta}>
          {ex.category}
          {ex.userId ? ' · propio' : ' · catálogo'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Ejercicios" subtitle="Catálogo y variantes" />
        {error ? <ErrorBanner message={error} onRetry={reload} /> : null}
        {loading ? <ActivityIndicator color={c.primary} style={{ margin: spacing.lg }} /> : null}

        <View style={styles.body}>
          <View style={styles.searchCard}>
            <Ionicons name="search-outline" size={18} color={c.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar ejercicio…"
              placeholderTextColor={c.textMuted}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query.length > 0 ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={c.textMuted} />
              </Pressable>
            ) : null}
          </View>

          <Button title="＋ Crear ejercicio propio" onPress={() => navigation.navigate('ExerciseEdit', {})} />

          {results ? (
            <Card>
              <Text style={styles.groupTitle}>
                {results.length === 0
                  ? 'Sin resultados'
                  : `${results.length} ${results.length === 1 ? 'resultado' : 'resultados'}`}
              </Text>
              {results.map((ex) => renderExercise(ex, !!ex.variantOfId))}
            </Card>
          ) : (
            grouped.map(({ group, exercises }) => (
              <Card key={group}>
                <Text style={styles.groupTitle}>{group}</Text>
                {exercises.map((ex) => (
                  <View key={ex.id}>
                    {renderExercise(ex)}
                    {(ex.variants ?? []).map((v) => renderExercise(v, true))}
                  </View>
                ))}
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) => {
  const typography = makeTypography(c);
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  content: { paddingBottom: TAB_BAR_SPACE },
  body: { paddingHorizontal: spacing.md, gap: spacing.md },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: c.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.surfaceBorder,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: c.textPrimary,
  },
  groupTitle: { ...typography.subtitle, fontSize: 14, color: c.accent, marginBottom: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: c.ice,
  },
  variantRow: { paddingLeft: spacing.lg },
  name: { fontSize: 14, fontWeight: '600', color: c.textPrimary },
  sbdTag: { fontSize: 10, fontWeight: '800', color: c.accent, letterSpacing: 0.5 },
  meta: { fontSize: 11, color: c.textMuted, marginTop: 1 },
});
}
