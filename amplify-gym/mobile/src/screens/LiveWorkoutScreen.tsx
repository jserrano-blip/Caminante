import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApiError } from '../api/client';
import { addSet, deleteSet, finishSession, getSuggestion, listExercises } from '../api/endpoints';
import type { Exercise, SuggestionResponse } from '../api/types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorBanner } from '../components/ErrorBanner';
import { ExercisePickerModal } from '../components/ExercisePickerModal';
import { NumberInput } from '../components/NumberInput';
import { PlateCalcModal, platesFromGym } from '../components/PlateCalc';
import { RestTimer } from '../components/RestTimer';
import { SegmentedControl } from '../components/SegmentedControl';
import { useApp } from '../context/AppContext';
import { formatWeight, fromDisplayWeight, toDisplayWeight } from '../lib/formulas';
import * as offlineQueue from '../lib/offlineQueue';
import { generateWarmup } from '../lib/warmup';
import { errorMessage } from '../lib/useLoad';
import type { EntrenarStackParamList } from '../navigation/types';
import { TAB_BAR_SPACE, radius, spacing, type ThemeColors } from '../theme';
import { useTheme } from '../context/ThemeContext';

type Props = NativeStackScreenProps<EntrenarStackParamList, 'LiveWorkout'>;

interface LocalSet {
  key: string;
  serverId: string | null;
  reps: number;
  weightKg: number;
  rpe: number | null;
  rir: number | null;
  isWarmup: boolean;
  completed: boolean;
  /** true: completada localmente pero sin sincronizar (en cola offline). */
  pending: boolean;
}

interface ExerciseBlock {
  exercise: Exercise;
  targetReps?: string;
  targetRpe?: number | null;
  restSeconds: number;
  effortMode: 'RPE' | 'RIR';
  sets: LocalSet[];
  suggestion: SuggestionResponse | null | 'loading';
}

let keyCounter = 0;
const nextKey = () => `set-${++keyCounter}`;

function parseTargetReps(target?: string): number {
  if (!target) return 8;
  const first = parseInt(target.split(/[-–]/)[0] ?? '', 10);
  return Number.isFinite(first) && first > 0 ? first : 8;
}

function makeSet(partial?: Partial<LocalSet>): LocalSet {
  return {
    key: nextKey(),
    serverId: null,
    reps: 8,
    weightKg: 0,
    rpe: null,
    rir: null,
    isWarmup: false,
    completed: false,
    pending: false,
    ...partial,
  };
}

export function LiveWorkoutScreen({ navigation, route }: Props) {
  const { colors: c } = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  const { sessionId, sessionName, routine } = route.params;
  const { user, unit, setUnit, gym } = useApp();
  const userId = user?.id ?? '';

  const [blocks, setBlocks] = useState<ExerciseBlock[]>(() =>
    (routine?.exercises ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((re) => ({
        exercise: re.exercise,
        targetReps: re.targetReps,
        targetRpe: re.targetRpe,
        restSeconds: re.restSeconds || 120,
        effortMode: 'RPE' as const,
        sets: Array.from({ length: re.targetSets || 3 }, () =>
          makeSet({ reps: parseTargetReps(re.targetReps) })
        ),
        suggestion: 'loading' as const,
      }))
  );
  const [banner, setBanner] = useState<string | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [plateTarget, setPlateTarget] = useState<number | null>(null);
  const [timer, setTimer] = useState<{ id: number; seconds: number } | null>(null);
  const [finishing, setFinishing] = useState(false);
  const startedAt = useRef(Date.now());
  const [, forceTick] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  // reconciliación con la cola offline: si un tempId ya no está en cola,
  // la serie quedó sincronizada → quitar la marca de pendiente
  const reconcile = useCallback(
    (list: offlineQueue.PendingSet[]) => {
      const ids = new Set(list.filter((p) => p.sessionId === sessionId).map((p) => p.tempId));
      setPendingCount(ids.size);
      setBlocks((prev) =>
        prev.map((b) =>
          b.sets.some((s) => s.pending && !ids.has(s.key))
            ? {
                ...b,
                sets: b.sets.map((s) =>
                  s.pending && !ids.has(s.key) ? { ...s, pending: false } : s
                ),
              }
            : b
        )
      );
    },
    [sessionId]
  );

  useEffect(() => {
    const unsubscribe = offlineQueue.subscribe(reconcile);
    void offlineQueue.getPending().then(reconcile);
    return unsubscribe;
  }, [reconcile]);

  // reintenta la cola al recuperar el foco
  useFocusEffect(
    useCallback(() => {
      void offlineQueue.flush();
    }, [])
  );

  // reloj de duración de la sesión
  useEffect(() => {
    const id = setInterval(() => forceTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  // catálogo para el picker
  useEffect(() => {
    listExercises(userId)
      .then(setExercises)
      .catch(() => undefined);
  }, [userId]);

  // sugerencias por ejercicio
  const fetchedSuggestions = useRef(new Set<string>());
  useEffect(() => {
    for (const block of blocks) {
      const exId = block.exercise.id;
      if (fetchedSuggestions.current.has(exId)) continue;
      fetchedSuggestions.current.add(exId);
      getSuggestion(userId, exId)
        .then((s) =>
          setBlocks((prev) =>
            prev.map((b) => (b.exercise.id === exId ? { ...b, suggestion: s } : b))
          )
        )
        .catch(() =>
          setBlocks((prev) =>
            prev.map((b) => (b.exercise.id === exId ? { ...b, suggestion: null } : b))
          )
        );
    }
  }, [blocks, userId]);

  const updateBlock = useCallback((index: number, mutate: (block: ExerciseBlock) => ExerciseBlock) => {
    setBlocks((prev) => prev.map((b, i) => (i === index ? mutate(b) : b)));
  }, []);

  const updateSet = (blockIndex: number, setKey: string, patch: Partial<LocalSet>) => {
    updateBlock(blockIndex, (block) => ({
      ...block,
      sets: block.sets.map((s) => (s.key === setKey ? { ...s, ...patch } : s)),
    }));
  };

  const addExercise = (exercise: Exercise) => {
    setPickerVisible(false);
    setBlocks((prev) => [
      ...prev,
      {
        exercise,
        restSeconds: 120,
        effortMode: 'RPE',
        sets: [makeSet(), makeSet(), makeSet()],
        suggestion: 'loading',
      },
    ]);
  };

  const addSetRow = (blockIndex: number) => {
    updateBlock(blockIndex, (block) => {
      const last = block.sets[block.sets.length - 1];
      return {
        ...block,
        sets: [
          ...block.sets,
          makeSet(last ? { reps: last.reps, weightKg: last.weightKg, rpe: last.rpe, rir: last.rir } : undefined),
        ],
      };
    });
  };

  const removeSetRow = (blockIndex: number, setKey: string) => {
    updateBlock(blockIndex, (block) => ({
      ...block,
      sets: block.sets.filter((s) => s.key !== setKey),
    }));
  };

  const insertWarmup = (blockIndex: number) => {
    const block = blocks[blockIndex];
    if (!block) return;
    const working = block.sets.find((s) => !s.isWarmup && s.weightKg > 0)?.weightKg
      ?? (block.suggestion && block.suggestion !== 'loading' ? block.suggestion.suggestion?.weightKg : undefined);
    if (!working || working <= 0) {
      Alert.alert('Calentamiento', 'Primero define el peso de trabajo de alguna serie.');
      return;
    }
    const { barKg, plates } = platesFromGym(gym);
    const isBarbell = block.exercise.category === 'BARBELL';
    const warmupSets = generateWarmup(working, isBarbell ? barKg : 0, {
      plates: isBarbell ? plates : undefined,
    });
    if (warmupSets.length === 0) {
      Alert.alert('Calentamiento', 'El peso de trabajo es demasiado bajo para generar aproximación.');
      return;
    }
    updateBlock(blockIndex, (b) => ({
      ...b,
      sets: [
        ...warmupSets.map((w) => makeSet({ reps: w.reps, weightKg: w.weightKg, isWarmup: true })),
        ...b.sets.filter((s) => !s.isWarmup),
      ],
    }));
  };

  const applySuggestion = (blockIndex: number) => {
    const block = blocks[blockIndex];
    if (!block || block.suggestion === 'loading' || !block.suggestion?.suggestion) return;
    const { weightKg, reps } = block.suggestion.suggestion;
    updateBlock(blockIndex, (b) => ({
      ...b,
      sets: b.sets.map((s) => (s.completed || s.isWarmup ? s : { ...s, weightKg, reps })),
    }));
  };

  const toggleComplete = async (blockIndex: number, set: LocalSet) => {
    const block = blocks[blockIndex];
    if (!block) return;
    setBanner(null);
    if (set.completed) {
      // descompletar: quita de la cola offline o borra del servidor
      updateSet(blockIndex, set.key, { completed: false, serverId: null, pending: false });
      if (set.pending) {
        await offlineQueue.remove(set.key);
      } else if (set.serverId) {
        try {
          await deleteSet(set.serverId);
        } catch (err) {
          setBanner(errorMessage(err));
        }
      }
      return;
    }
    if (set.reps <= 0) {
      Alert.alert('Serie', 'Las reps deben ser mayores a 0.');
      return;
    }
    const setNumber = block.sets.findIndex((s) => s.key === set.key) + 1;
    const body = {
      exerciseId: block.exercise.id,
      setNumber,
      reps: set.reps,
      weightKg: set.weightKg,
      unit,
      rpe: block.effortMode === 'RPE' && set.rpe !== null ? set.rpe : undefined,
      rir: block.effortMode === 'RIR' && set.rir !== null ? set.rir : undefined,
      isWarmup: set.isWarmup,
    };
    updateSet(blockIndex, set.key, { completed: true });
    try {
      const saved = await addSet(sessionId, body);
      updateSet(blockIndex, set.key, { serverId: saved.id });
      if (!set.isWarmup) {
        setTimer({ id: Date.now(), seconds: block.restSeconds });
      }
    } catch (err) {
      const isNetwork = err instanceof TypeError || (err instanceof ApiError && err.isNetwork);
      if (isNetwork) {
        // sin red: encola y sigue el flujo normal
        await offlineQueue.enqueue({ tempId: set.key, sessionId, body });
        updateSet(blockIndex, set.key, { pending: true });
        if (!set.isWarmup) {
          setTimer({ id: Date.now(), seconds: block.restSeconds });
        }
      } else {
        updateSet(blockIndex, set.key, { completed: false });
        setBanner(errorMessage(err));
      }
    }
  };

  const finish = async () => {
    // primero intenta sincronizar lo pendiente; si queda algo, no finaliza
    setFinishing(true);
    let remaining = 0;
    try {
      remaining = (await offlineQueue.flush()).filter((p) => p.sessionId === sessionId).length;
    } finally {
      setFinishing(false);
    }
    if (remaining > 0) {
      Alert.alert(
        'Series sin sincronizar',
        `Tienes ${remaining} ${remaining === 1 ? 'serie' : 'series'} sin sincronizar. Reintenta cuando vuelva la señal.`
      );
      return;
    }
    const completedCount = blocks.reduce(
      (sum, b) => sum + b.sets.filter((s) => s.completed).length,
      0
    );
    Alert.alert(
      'Finalizar entrenamiento',
      completedCount === 0
        ? 'No has completado ninguna serie. ¿Finalizar de todos modos?'
        : `Has completado ${completedCount} series. ¿Finalizar?`,
      [
        { text: 'Seguir entrenando', style: 'cancel' },
        {
          text: 'Finalizar',
          onPress: async () => {
            setFinishing(true);
            setBanner(null);
            try {
              const result = await finishSession(sessionId);
              navigation.replace('WorkoutSummary', {
                summary: result.summary,
                sessionName,
              });
            } catch (err) {
              setBanner(errorMessage(err));
            } finally {
              setFinishing(false);
            }
          },
        },
      ]
    );
  };

  const elapsedMin = Math.floor((Date.now() - startedAt.current) / 60000);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            {sessionName}
          </Text>
          <Text style={styles.subtitle}>
            {elapsedMin} min{gym ? ` · ${gym.name}` : ''}
          </Text>
        </View>
        <SegmentedControl
          options={['KG', 'LB'] as const}
          value={unit}
          onChange={setUnit}
          style={{ width: 110 }}
        />
      </View>

      {banner ? <ErrorBanner message={banner} /> : null}

      {pendingCount > 0 ? (
        <Pressable onPress={() => void offlineQueue.flush()} style={styles.pendingBanner}>
          <Ionicons name="cloud-offline-outline" size={15} color={c.primary} />
          <Text style={styles.pendingBannerText}>
            {pendingCount} {pendingCount === 1 ? 'serie pendiente' : 'series pendientes'} de
            sincronizar · Reintentar
          </Text>
        </Pressable>
      ) : null}

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {blocks.map((block, blockIndex) => {
          const suggestion = block.suggestion;
          return (
            <Card key={`${block.exercise.id}-${blockIndex}`} style={styles.block}>
              <View style={styles.blockHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.exerciseName}>{block.exercise.name}</Text>
                  <Text style={styles.exerciseMeta}>
                    {block.exercise.muscleGroup}
                    {block.targetReps ? ` · objetivo ${block.targetReps} reps` : ''}
                    {block.targetRpe ? ` @ RPE ${block.targetRpe}` : ''}
                  </Text>
                </View>
                <SegmentedControl
                  options={['RPE', 'RIR'] as const}
                  value={block.effortMode}
                  onChange={(mode) => updateBlock(blockIndex, (b) => ({ ...b, effortMode: mode }))}
                  style={{ width: 108 }}
                />
              </View>

              {suggestion !== 'loading' && suggestion ? (
                <Pressable onPress={() => applySuggestion(blockIndex)}>
                  <View style={styles.suggestionChip}>
                    <Ionicons name="trending-up" size={15} color={c.primary} />
                    <View style={{ flex: 1 }}>
                      {suggestion.last ? (
                        <Text style={styles.suggestionLast}>
                          Última vez:{' '}
                          {suggestion.last.sets
                            .map((s) => `${toDisplayWeight(s.weightKg, unit)}×${s.reps}`)
                            .join(', ')}{' '}
                          {unit === 'LB' ? 'lb' : 'kg'}
                        </Text>
                      ) : null}
                      {suggestion.suggestion ? (
                        <Text style={styles.suggestionText}>
                          Sugerencia: {formatWeight(suggestion.suggestion.weightKg, unit)} ×{' '}
                          {suggestion.suggestion.reps} — {suggestion.suggestion.rationale}
                        </Text>
                      ) : (
                        <Text style={styles.suggestionText}>
                          Primera vez con este ejercicio — establece tu marca
                        </Text>
                      )}
                    </View>
                    {suggestion.suggestion ? (
                      <Text style={styles.applyText}>Aplicar</Text>
                    ) : null}
                  </View>
                </Pressable>
              ) : null}

              <View style={styles.blockActions}>
                <Button
                  title="Calentamiento"
                  variant="secondary"
                  small
                  onPress={() => insertWarmup(blockIndex)}
                />
                <Button
                  title="Discos"
                  variant="secondary"
                  small
                  onPress={() => {
                    const w =
                      block.sets.find((s) => !s.isWarmup && s.weightKg > 0)?.weightKg ?? 60;
                    setPlateTarget(w);
                  }}
                />
                <View style={styles.restWrap}>
                  <Text style={styles.restLabel}>Descanso</Text>
                  <NumberInput
                    value={block.restSeconds}
                    onChange={(v) => updateBlock(blockIndex, (b) => ({ ...b, restSeconds: v }))}
                    step={15}
                    min={15}
                    max={600}
                    decimals={false}
                    compact
                    suffix="s"
                  />
                </View>
              </View>

              {/* encabezado de columnas */}
              <View style={styles.colHeader}>
                <Text style={[styles.colText, { width: 30 }]}>#</Text>
                <Text style={[styles.colText, { flex: 1 }]}>Reps</Text>
                <Text style={[styles.colText, { flex: 1.3 }]}>
                  Peso ({unit === 'LB' ? 'lb' : 'kg'})
                </Text>
                <Text style={[styles.colText, { flex: 1 }]}>{block.effortMode}</Text>
                <Text style={[styles.colText, { width: 64, textAlign: 'center' }]}> </Text>
              </View>

              {block.sets.map((set, setIndex) => (
                <View key={set.key} style={[styles.setRow, set.completed && styles.setRowDone]}>
                  <Text style={[styles.setNumber, { width: 30 }]}>
                    {set.isWarmup ? 'C' : setIndex + 1}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <NumberInput
                      value={set.reps}
                      onChange={(v) => updateSet(blockIndex, set.key, { reps: v })}
                      step={1}
                      min={0}
                      max={100}
                      decimals={false}
                      compact
                    />
                  </View>
                  <View style={{ flex: 1.3, marginLeft: 6 }}>
                    <NumberInput
                      value={toDisplayWeight(set.weightKg, unit)}
                      onChange={(v) =>
                        updateSet(blockIndex, set.key, { weightKg: fromDisplayWeight(v, unit) })
                      }
                      step={unit === 'LB' ? 5 : 2.5}
                      min={0}
                      compact
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 6 }}>
                    {block.effortMode === 'RPE' ? (
                      <NumberInput
                        value={set.rpe ?? 8}
                        onChange={(v) => updateSet(blockIndex, set.key, { rpe: v })}
                        step={0.5}
                        min={1}
                        max={10}
                        compact
                      />
                    ) : (
                      <NumberInput
                        value={set.rir ?? 2}
                        onChange={(v) => updateSet(blockIndex, set.key, { rir: v })}
                        step={1}
                        min={0}
                        max={9}
                        decimals={false}
                        compact
                      />
                    )}
                  </View>
                  <View style={styles.rowButtons}>
                    {!set.completed ? (
                      <Pressable onPress={() => removeSetRow(blockIndex, set.key)} hitSlop={6}>
                        <Ionicons name="remove-circle-outline" size={20} color={c.textMuted} />
                      </Pressable>
                    ) : (
                      <View style={{ width: 20 }} />
                    )}
                    <Pressable onPress={() => toggleComplete(blockIndex, set)} hitSlop={6}>
                      <Ionicons
                        name={
                          set.completed
                            ? set.pending
                              ? 'cloud-offline-outline'
                              : 'checkmark-circle'
                            : 'ellipse-outline'
                        }
                        size={26}
                        color={set.completed ? c.primary : c.surfaceBorder}
                      />
                    </Pressable>
                  </View>
                </View>
              ))}

              <Button title="＋ Agregar serie" variant="ghost" small onPress={() => addSetRow(blockIndex)} />
            </Card>
          );
        })}

        <Button title="＋ Agregar ejercicio" variant="secondary" onPress={() => setPickerVisible(true)} />
        <Button title="Finalizar entrenamiento" onPress={finish} loading={finishing} style={{ marginTop: spacing.sm }} />
        <View style={{ height: 90 }} />
      </ScrollView>

      {timer ? (
        <RestTimer key={timer.id} seconds={timer.seconds} onDismiss={() => setTimer(null)} />
      ) : null}

      <ExercisePickerModal
        visible={pickerVisible}
        exercises={exercises}
        onSelect={addExercise}
        onClose={() => setPickerVisible(false)}
      />

      <PlateCalcModal
        visible={plateTarget !== null}
        onClose={() => setPlateTarget(null)}
        initialTargetKg={plateTarget ?? 60}
        gym={gym}
        unit={unit}
      />
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) => {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: { fontSize: 20, fontWeight: '700', color: c.textPrimary },
  subtitle: { fontSize: 12, color: c.textMuted, marginTop: 2 },
  content: { paddingHorizontal: spacing.md, gap: spacing.md, paddingBottom: TAB_BAR_SPACE },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: c.ice,
    borderWidth: 1,
    borderColor: c.surfaceBorder,
    borderRadius: radius.sm,
  },
  pendingBannerText: { fontSize: 12, fontWeight: '600', color: c.primary, flex: 1 },
  block: { gap: spacing.sm },
  blockHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  exerciseName: { fontSize: 16, fontWeight: '700', color: c.textPrimary },
  exerciseMeta: { fontSize: 11, color: c.textMuted, marginTop: 1 },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: c.ice,
    borderWidth: 1,
    borderColor: c.surfaceBorder,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  suggestionLast: { fontSize: 11, color: c.textMuted },
  suggestionText: { fontSize: 12, color: c.textPrimary, fontWeight: '600', marginTop: 1 },
  applyText: { fontSize: 12, fontWeight: '700', color: c.primary },
  blockActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  restWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
  restLabel: { fontSize: 11, color: c.textMuted },
  colHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  colText: { fontSize: 10, color: c.textMuted, fontWeight: '600', textTransform: 'uppercase' },
  setRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  setRowDone: { opacity: 0.55 },
  setNumber: { fontSize: 13, fontWeight: '700', color: c.accent },
  rowButtons: {
    width: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    marginLeft: 4,
  },
});
}
