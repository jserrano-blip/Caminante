import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createExercise, deleteExercise, listExercises, updateExercise } from '../api/endpoints';
import type { Exercise, ExerciseCategory, MuscleGroup } from '../api/types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { ErrorBanner } from '../components/ErrorBanner';
import { ExercisePickerModal } from '../components/ExercisePickerModal';
import { useApp } from '../context/AppContext';
import { errorMessage } from '../lib/useLoad';
import type { RutinasStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RutinasStackParamList, 'ExerciseEdit'>;

const GROUPS: MuscleGroup[] = ['PECHO', 'ESPALDA', 'PIERNA', 'HOMBRO', 'BRAZO', 'CORE', 'OTRO'];
const CATEGORIES: ExerciseCategory[] = ['BARBELL', 'DUMBBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'];

export function ExerciseEditScreen({ navigation, route }: Props) {
  const existing = route.params?.exercise;
  const { user } = useApp();
  const userId = user?.id ?? '';
  const isGlobal = !!existing && existing.userId === null;
  const readOnly = isGlobal;

  const [name, setName] = useState(existing?.name ?? '');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>(existing?.muscleGroup ?? 'PECHO');
  const [category, setCategory] = useState<ExerciseCategory>(existing?.category ?? 'BARBELL');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [isPowerlift, setIsPowerlift] = useState(existing?.isPowerlift ?? false);
  const [variantOf, setVariantOf] = useState<Exercise | null>(null);
  const [variantOfId, setVariantOfId] = useState<string | null>(existing?.variantOfId ?? null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listExercises(userId)
      .then((list) => {
        setExercises(list.filter((e) => e.id !== existing?.id));
        if (existing?.variantOfId) {
          const all: Exercise[] = [];
          for (const e of list) {
            all.push(e);
            all.push(...(e.variants ?? []));
          }
          setVariantOf(all.find((e) => e.id === existing.variantOfId) ?? null);
        }
      })
      .catch(() => undefined);
  }, [userId, existing?.id, existing?.variantOfId]);

  const save = async () => {
    if (!name.trim()) {
      setError('Escribe el nombre del ejercicio');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (existing && !isGlobal) {
        await updateExercise(existing.id, {
          name: name.trim(),
          muscleGroup,
          category,
          variantOfId,
          notes: notes.trim(),
          isPowerlift,
        });
      } else if (!existing) {
        await createExercise({
          userId,
          name: name.trim(),
          muscleGroup,
          category,
          variantOfId: variantOfId ?? undefined,
          notes: notes.trim() || undefined,
          isPowerlift,
        });
      }
      navigation.goBack();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!existing) return;
    Alert.alert('Eliminar ejercicio', `¿Eliminar "${existing.name}"? Se borrarán sus series históricas.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteExercise(existing.id);
            navigation.goBack();
          } catch (err) {
            setError(errorMessage(err));
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>
          {existing ? (readOnly ? existing.name : 'Editar ejercicio') : 'Nuevo ejercicio'}
        </Text>
        {readOnly ? (
          <Card tinted>
            <Text style={styles.readOnlyNote}>
              Este ejercicio es del catálogo global y no se puede editar. Puedes crear una variante
              propia basada en él.
            </Text>
            <Button
              title="Crear variante propia"
              variant="secondary"
              onPress={() => {
                navigation.replace('ExerciseEdit', {});
              }}
              style={{ marginTop: spacing.sm }}
            />
          </Card>
        ) : null}
        {error ? <ErrorBanner message={error} /> : null}

        <Card style={{ gap: spacing.sm }}>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            editable={!readOnly}
          />

          <Text style={styles.fieldLabel}>Grupo muscular</Text>
          <View style={styles.chips}>
            {GROUPS.map((g) => (
              <Chip key={g} label={g} selected={muscleGroup === g} onPress={readOnly ? undefined : () => setMuscleGroup(g)} />
            ))}
          </View>

          <Text style={styles.fieldLabel}>Categoría</Text>
          <View style={styles.chips}>
            {CATEGORIES.map((c) => (
              <Chip key={c} label={c} selected={category === c} onPress={readOnly ? undefined : () => setCategory(c)} />
            ))}
          </View>

          <Text style={styles.fieldLabel}>Variante de</Text>
          <Pressable onPress={readOnly ? undefined : () => setPickerVisible(true)}>
            <View style={styles.variantBox}>
              <Text style={variantOfId ? styles.variantText : styles.variantPlaceholder}>
                {variantOf?.name ?? (variantOfId ? 'Ejercicio seleccionado' : 'Ninguno (ejercicio raíz)')}
              </Text>
              {variantOfId && !readOnly ? (
                <Pressable
                  onPress={() => {
                    setVariantOf(null);
                    setVariantOfId(null);
                  }}
                  hitSlop={8}
                >
                  <Text style={styles.clearVariant}>Quitar</Text>
                </Pressable>
              ) : null}
            </View>
          </Pressable>

          <TextInput
            style={[styles.input, { minHeight: 60 }]}
            placeholder="Notas (opcional)"
            placeholderTextColor={colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            editable={!readOnly}
          />

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Levantamiento de powerlifting</Text>
              <Text style={styles.switchHint}>Cuenta para Wilks y DOTS</Text>
            </View>
            <Switch
              value={isPowerlift}
              onValueChange={readOnly ? undefined : setIsPowerlift}
              trackColor={{ true: colors.accent, false: colors.surfaceBorder }}
              thumbColor={colors.white}
              disabled={readOnly}
            />
          </View>
        </Card>

        {!readOnly ? <Button title="Guardar" onPress={save} loading={saving} /> : null}
        {existing && !readOnly ? (
          <Button title="Eliminar ejercicio" variant="ghost" onPress={confirmDelete} />
        ) : null}
      </ScrollView>

      <ExercisePickerModal
        visible={pickerVisible}
        exercises={exercises}
        title="Variante de…"
        onSelect={(ex) => {
          setVariantOf(ex);
          setVariantOfId(ex.id);
          setPickerVisible(false);
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
  readOnlyNote: { fontSize: 13, color: colors.textPrimary, lineHeight: 19 },
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
  fieldLabel: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  variantBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  variantText: { fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  variantPlaceholder: { fontSize: 14, color: colors.textMuted },
  clearVariant: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  switchLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  switchHint: { fontSize: 11, color: colors.textMuted },
});
