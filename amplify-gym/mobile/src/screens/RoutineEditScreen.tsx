import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createRoutine, listExercises, updateRoutine } from '../api/endpoints';
import type { Exercise } from '../api/types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorBanner } from '../components/ErrorBanner';
import { ExercisePickerModal } from '../components/ExercisePickerModal';
import { NumberInput } from '../components/NumberInput';
import { useApp } from '../context/AppContext';
import { errorMessage } from '../lib/useLoad';
import type { RutinasStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RutinasStackParamList, 'RoutineEdit'>;

interface EditableExercise {
  key: string;
  exercise: Exercise;
  targetSets: number;
  targetReps: string;
  targetRpe: number | null;
  restSeconds: number;
}

let rowKey = 0;

export function RoutineEditScreen({ navigation, route }: Props) {
  const routine = route.params?.routine;
  const { user } = useApp();
  const userId = user?.id ?? '';

  const [name, setName] = useState(routine?.name ?? '');
  const [description, setDescription] = useState(routine?.description ?? '');
  const [rows, setRows] = useState<EditableExercise[]>(() =>
    (routine?.exercises ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((re) => ({
        key: `row-${++rowKey}`,
        exercise: re.exercise,
        targetSets: re.targetSets,
        targetReps: re.targetReps,
        targetRpe: re.targetRpe,
        restSeconds: re.restSeconds,
      }))
  );
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listExercises(userId)
      .then(setExercises)
      .catch(() => undefined);
  }, [userId]);

  const move = (index: number, dir: -1 | 1) => {
    setRows((prev) => {
      const next = prev.slice();
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      const [item] = next.splice(index, 1);
      if (!item) return prev;
      next.splice(target, 0, item);
      return next;
    });
  };

  const save = async () => {
    if (!name.trim()) {
      setError('Ponle nombre a la rutina');
      return;
    }
    if (rows.length === 0) {
      setError('Agrega al menos un ejercicio');
      return;
    }
    setSaving(true);
    setError(null);
    const body = {
      userId,
      name: name.trim(),
      description: description.trim() || undefined,
      exercises: rows.map((row, i) => ({
        exerciseId: row.exercise.id,
        order: i + 1,
        targetSets: row.targetSets,
        targetReps: row.targetReps.trim() || '8-12',
        targetRpe: row.targetRpe ?? undefined,
        restSeconds: row.restSeconds,
      })),
    };
    try {
      if (routine) await updateRoutine(routine.id, body);
      else await createRoutine(body);
      navigation.goBack();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{routine ? 'Editar rutina' : 'Nueva rutina'}</Text>
        {error ? <ErrorBanner message={error} /> : null}

        <Card style={{ gap: spacing.sm }}>
          <TextInput
            style={styles.input}
            placeholder="Nombre de la rutina"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Descripción (opcional)"
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
          />
        </Card>

        <Text style={styles.sectionTitle}>Ejercicios ({rows.length})</Text>

        {rows.map((row, index) => (
          <Card key={row.key} style={{ gap: spacing.sm }}>
            <View style={styles.rowHeader}>
              <Text style={styles.order}>{index + 1}</Text>
              <Text style={styles.exerciseName} numberOfLines={1}>
                {row.exercise.name}
              </Text>
              <Pressable onPress={() => move(index, -1)} hitSlop={6} disabled={index === 0}>
                <Ionicons name="chevron-up" size={20} color={index === 0 ? colors.surfaceBorder : colors.accent} />
              </Pressable>
              <Pressable onPress={() => move(index, 1)} hitSlop={6} disabled={index === rows.length - 1}>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={index === rows.length - 1 ? colors.surfaceBorder : colors.accent}
                />
              </Pressable>
              <Pressable
                onPress={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
                hitSlop={6}
              >
                <Ionicons name="trash-outline" size={19} color={colors.textMuted} />
              </Pressable>
            </View>

            <View style={styles.fieldsRow}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Series</Text>
                <NumberInput
                  value={row.targetSets}
                  onChange={(v) =>
                    setRows((prev) => prev.map((r) => (r.key === row.key ? { ...r, targetSets: v } : r)))
                  }
                  step={1}
                  min={1}
                  max={12}
                  decimals={false}
                  compact
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Reps (ej. 8-12)</Text>
                <TextInput
                  style={[styles.input, styles.smallInput]}
                  value={row.targetReps}
                  onChangeText={(t) =>
                    setRows((prev) => prev.map((r) => (r.key === row.key ? { ...r, targetReps: t } : r)))
                  }
                  placeholder="8-12"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
            <View style={styles.fieldsRow}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>RPE objetivo (0 = sin RPE)</Text>
                <NumberInput
                  value={row.targetRpe ?? 0}
                  onChange={(v) =>
                    setRows((prev) =>
                      prev.map((r) => (r.key === row.key ? { ...r, targetRpe: v === 0 ? null : v } : r))
                    )
                  }
                  step={0.5}
                  min={0}
                  max={10}
                  compact
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Descanso (s)</Text>
                <NumberInput
                  value={row.restSeconds}
                  onChange={(v) =>
                    setRows((prev) => prev.map((r) => (r.key === row.key ? { ...r, restSeconds: v } : r)))
                  }
                  step={15}
                  min={15}
                  max={600}
                  decimals={false}
                  compact
                />
              </View>
            </View>
          </Card>
        ))}

        <Button title="＋ Agregar ejercicio" variant="secondary" onPress={() => setPickerVisible(true)} />
        <Button title="Guardar rutina" onPress={save} loading={saving} />
      </ScrollView>

      <ExercisePickerModal
        visible={pickerVisible}
        exercises={exercises}
        onSelect={(exercise) => {
          setPickerVisible(false);
          setRows((prev) => [
            ...prev,
            {
              key: `row-${++rowKey}`,
              exercise,
              targetSets: 3,
              targetReps: '8-12',
              targetRpe: null,
              restSeconds: 120,
            },
          ]);
        }}
        onClose={() => setPickerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  title: { ...typography.title, fontSize: 24 },
  sectionTitle: { ...typography.subtitle },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
  },
  smallInput: { paddingVertical: 8, fontSize: 14 },
  rowHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  order: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 13,
    fontWeight: '700',
    overflow: 'hidden',
  },
  exerciseName: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  fieldsRow: { flexDirection: 'row', gap: spacing.md },
  field: { flex: 1 },
  fieldLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
});
