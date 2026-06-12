import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createRoutine, deleteRoutine, listExercises, listRoutines } from '../api/endpoints';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { ScreenHeader } from '../components/ScreenHeader';
import { useApp } from '../context/AppContext';
import { useLoad } from '../lib/useLoad';
import type { RutinasStackParamList } from '../navigation/types';
import { TAB_BAR_SPACE, colors, spacing } from '../theme';

type Props = NativeStackScreenProps<RutinasStackParamList, 'Routines'>;

type TemplateExercise = { name: string; sets: number; reps: string; rest: number };

interface SuggestedTemplate {
  key: string;
  title: string;
  description: string;
  icon: 'flash-outline' | 'repeat-outline' | 'swap-vertical-outline';
  routines: { name: string; exercises: TemplateExercise[] }[];
}

const SUGGESTED_TEMPLATES: SuggestedTemplate[] = [
  {
    key: 'ppl',
    title: 'Push / Pull / Legs',
    description: '3 rutinas clásicas de empuje, jalón y pierna',
    icon: 'repeat-outline',
    routines: [
      {
        name: 'Push — Empuje',
        exercises: [
          { name: 'Press de Banca', sets: 4, reps: '5-8', rest: 180 },
          { name: 'Press Militar', sets: 3, reps: '8-10', rest: 150 },
          { name: 'Press Inclinado', sets: 3, reps: '8-12', rest: 120 },
          { name: 'Elevaciones Laterales', sets: 3, reps: '12-15', rest: 90 },
          { name: 'Extensión de Tríceps en Polea', sets: 3, reps: '10-15', rest: 90 },
        ],
      },
      {
        name: 'Pull — Jalón',
        exercises: [
          { name: 'Peso Muerto', sets: 3, reps: '3-5', rest: 240 },
          { name: 'Remo con Barra', sets: 4, reps: '6-10', rest: 150 },
          { name: 'Jalón al Pecho', sets: 3, reps: '8-12', rest: 120 },
          { name: 'Face Pull', sets: 3, reps: '12-15', rest: 90 },
          { name: 'Curl con Barra', sets: 3, reps: '8-12', rest: 90 },
        ],
      },
      {
        name: 'Legs — Pierna',
        exercises: [
          { name: 'Sentadilla', sets: 4, reps: '5-8', rest: 210 },
          { name: 'Peso Muerto Rumano', sets: 3, reps: '8-10', rest: 150 },
          { name: 'Prensa de Pierna', sets: 3, reps: '10-12', rest: 120 },
          { name: 'Curl Femoral', sets: 3, reps: '10-15', rest: 90 },
          { name: 'Pantorrillas de Pie', sets: 4, reps: '10-15', rest: 60 },
        ],
      },
    ],
  },
  {
    key: 'fullbody',
    title: 'Full Body 3x',
    description: 'Una rutina de cuerpo completo para 3 días por semana',
    icon: 'flash-outline',
    routines: [
      {
        name: 'Full Body',
        exercises: [
          { name: 'Sentadilla', sets: 3, reps: '5-8', rest: 180 },
          { name: 'Press de Banca', sets: 3, reps: '5-8', rest: 180 },
          { name: 'Remo con Barra', sets: 3, reps: '6-10', rest: 150 },
          { name: 'Press Militar', sets: 2, reps: '8-10', rest: 120 },
          { name: 'Curl Femoral', sets: 2, reps: '10-15', rest: 90 },
          { name: 'Plancha', sets: 3, reps: '30-60', rest: 60 },
        ],
      },
    ],
  },
  {
    key: 'upperlower',
    title: 'Torso / Pierna',
    description: '2 rutinas para alternar 4 días por semana',
    icon: 'swap-vertical-outline',
    routines: [
      {
        name: 'Torso',
        exercises: [
          { name: 'Press de Banca', sets: 4, reps: '5-8', rest: 180 },
          { name: 'Remo con Barra', sets: 4, reps: '6-10', rest: 150 },
          { name: 'Press de Hombro con Mancuernas', sets: 3, reps: '8-12', rest: 120 },
          { name: 'Jalón al Pecho', sets: 3, reps: '8-12', rest: 120 },
          { name: 'Curl Martillo', sets: 2, reps: '10-15', rest: 90 },
        ],
      },
      {
        name: 'Pierna',
        exercises: [
          { name: 'Sentadilla', sets: 4, reps: '5-8', rest: 210 },
          { name: 'Peso Muerto Rumano', sets: 3, reps: '8-10', rest: 150 },
          { name: 'Zancadas', sets: 3, reps: '10-12', rest: 120 },
          { name: 'Extensión de Cuádriceps', sets: 3, reps: '12-15', rest: 90 },
          { name: 'Pantorrillas de Pie', sets: 4, reps: '10-15', rest: 60 },
        ],
      },
    ],
  },
];

export function RoutinesScreen({ navigation }: Props) {
  const { user } = useApp();
  const userId = user?.id ?? '';
  const { data, loading, error, reload } = useLoad(() => listRoutines(userId), [userId]);
  const exercises = useLoad(() => listExercises(userId), [userId]);
  const [creatingTemplate, setCreatingTemplate] = useState<string | null>(null);
  const [templateError, setTemplateError] = useState<string | null>(null);

  const createTemplate = async (template: SuggestedTemplate) => {
    if (creatingTemplate || !exercises.data) return;
    setCreatingTemplate(template.key);
    setTemplateError(null);
    const byName = new Map(exercises.data.map((e) => [e.name, e.id]));
    try {
      for (const routine of template.routines) {
        const mapped = routine.exercises
          .filter((e) => byName.has(e.name))
          .map((e, i) => ({
            exerciseId: byName.get(e.name) as string,
            order: i + 1,
            targetSets: e.sets,
            targetReps: e.reps,
            restSeconds: e.rest,
          }));
        if (mapped.length === 0) continue;
        await createRoutine({ userId, name: routine.name, description: template.title, exercises: mapped });
      }
      reload();
    } catch {
      setTemplateError('No se pudieron crear las rutinas. Revisa la conexión.');
    } finally {
      setCreatingTemplate(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const confirmDelete = (id: string, name: string) => {
    Alert.alert('Eliminar rutina', `¿Eliminar "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRoutine(id);
            reload();
          } catch {
            // el banner de error general lo mostrará al recargar
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Rutinas"
          subtitle="Tus plantillas de entrenamiento"
          right={
            <Pressable onPress={() => navigation.navigate('Exercises')} hitSlop={8}>
              <View style={styles.headerLink}>
                <Ionicons name="library-outline" size={18} color={colors.primary} />
                <Text style={styles.headerLinkText}>Ejercicios</Text>
              </View>
            </Pressable>
          }
        />

        {error ? <ErrorBanner message={error} onRetry={reload} /> : null}
        {loading ? <ActivityIndicator color={colors.primary} style={{ margin: spacing.lg }} /> : null}

        <View style={styles.body}>
          {data && data.length === 0 ? (
            <>
              <EmptyState
                icon="list-outline"
                title="Sin rutinas"
                subtitle="Empieza con una plantilla probada o crea la tuya"
              />
              {templateError ? <ErrorBanner message={templateError} /> : null}
              <Text style={styles.templatesEyebrow}>PLANTILLAS SUGERIDAS</Text>
              {SUGGESTED_TEMPLATES.map((template) => (
                <Pressable key={template.key} onPress={() => createTemplate(template)} disabled={!!creatingTemplate}>
                  <Card tinted style={styles.templateCard}>
                    <View style={styles.templateBubble}>
                      <Ionicons name={template.icon} size={20} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.name}>{template.title}</Text>
                      <Text style={styles.desc}>{template.description}</Text>
                    </View>
                    {creatingTemplate === template.key ? (
                      <ActivityIndicator color={colors.primary} />
                    ) : (
                      <Ionicons name="add-circle" size={28} color={colors.primary} />
                    )}
                  </Card>
                </Pressable>
              ))}
            </>
          ) : null}

          {(data ?? []).map((routine) => (
            <Pressable key={routine.id} onPress={() => navigation.navigate('RoutineEdit', { routine })}>
              <Card style={styles.routineCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{routine.name}</Text>
                  {routine.description ? <Text style={styles.desc}>{routine.description}</Text> : null}
                  <Text style={styles.exercises} numberOfLines={2}>
                    {routine.exercises
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((e) => `${e.exercise.name} ${e.targetSets}×${e.targetReps}`)
                      .join(' · ')}
                  </Text>
                </View>
                <Pressable onPress={() => confirmDelete(routine.id, routine.name)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
                </Pressable>
              </Card>
            </Pressable>
          ))}

          <Button title="＋ Nueva rutina" onPress={() => navigation.navigate('RoutineEdit', {})} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: TAB_BAR_SPACE },
  body: { paddingHorizontal: spacing.md, gap: spacing.md },
  headerLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerLinkText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  routineCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  templatesEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.sky,
    marginTop: spacing.sm,
  },
  templateCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  templateBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  desc: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  exercises: { fontSize: 12, color: colors.accent, marginTop: 6 },
});
