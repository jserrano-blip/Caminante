import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createMeal, updateMeal } from '../api/endpoints';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorBanner } from '../components/ErrorBanner';
import { NumberInput } from '../components/NumberInput';
import { useApp } from '../context/AppContext';
import { errorMessage } from '../lib/useLoad';
import type { MasStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<MasStackParamList, 'MealEdit'>;

export function MealEditScreen({ navigation, route }: Props) {
  const existing = route.params?.meal;
  const template = route.params?.duplicateFrom;
  const base = existing ?? template;
  const { user } = useApp();
  const userId = user?.id ?? '';

  const [name, setName] = useState(base ? (template ? `${base.name} (copia)` : base.name) : '');
  const [servings, setServings] = useState(base?.servings ?? 4);
  const [proteinG, setProteinG] = useState(base?.proteinG ?? 0);
  const [carbsG, setCarbsG] = useState(base?.carbsG ?? 0);
  const [fatG, setFatG] = useState(base?.fatG ?? 0);
  const [calories, setCalories] = useState(base?.calories ?? 0);
  const [cookMinutes, setCookMinutes] = useState(base?.cookMinutes ?? 0);
  const [applianceNote, setApplianceNote] = useState(base?.applianceNote ?? '');
  const [instructions, setInstructions] = useState(base?.instructions ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!name.trim()) {
      setError('Escribe el nombre de la receta');
      return;
    }
    setSaving(true);
    setError(null);
    const body = {
      userId,
      name: name.trim(),
      servings,
      proteinG,
      carbsG,
      fatG,
      calories,
      cookMinutes: cookMinutes > 0 ? cookMinutes : undefined,
      applianceNote: applianceNote.trim() || undefined,
      instructions: instructions.trim() || undefined,
    };
    try {
      if (existing) await updateMeal(existing.id, body);
      else await createMeal(body);
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
        <Text style={styles.title}>
          {existing ? 'Editar receta' : template ? 'Duplicar plantilla' : 'Nueva receta'}
        </Text>
        {error ? <ErrorBanner message={error} /> : null}

        <Card style={{ gap: spacing.sm }}>
          <TextInput
            style={styles.input}
            placeholder="Nombre (ej. Pechuga de pollo)"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Porciones</Text>
              <NumberInput value={servings} onChange={setServings} step={1} min={1} max={30} decimals={false} compact />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Tiempo de olla (min)</Text>
              <NumberInput value={cookMinutes} onChange={setCookMinutes} step={1} min={0} max={240} decimals={false} compact />
            </View>
          </View>
        </Card>

        <Card style={{ gap: spacing.sm }}>
          <Text style={styles.sectionTitle}>Macros por porción</Text>
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Proteína (g)</Text>
              <NumberInput value={proteinG} onChange={setProteinG} step={1} min={0} compact />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Carbohidratos (g)</Text>
              <NumberInput value={carbsG} onChange={setCarbsG} step={1} min={0} compact />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Grasa (g)</Text>
              <NumberInput value={fatG} onChange={setFatG} step={1} min={0} compact />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Calorías (kcal)</Text>
              <NumberInput value={calories} onChange={setCalories} step={10} min={0} compact />
            </View>
          </View>
        </Card>

        <Card style={{ gap: spacing.sm }}>
          <Text style={styles.sectionTitle}>Preparación</Text>
          <TextInput
            style={styles.input}
            placeholder="Nota de olla de presión (ej. 10 min alta presión + 5 NPR)"
            placeholderTextColor={colors.textMuted}
            value={applianceNote}
            onChangeText={setApplianceNote}
          />
          <TextInput
            style={[styles.input, { minHeight: 90 }]}
            placeholder="Instrucciones y notas"
            placeholderTextColor={colors.textMuted}
            value={instructions}
            onChangeText={setInstructions}
            multiline
          />
        </Card>

        <Button title="Guardar receta" onPress={save} loading={saving} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  title: { ...typography.title, fontSize: 24 },
  sectionTitle: { ...typography.subtitle, fontSize: 15 },
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
  row: { flexDirection: 'row', gap: spacing.md },
  field: { flex: 1 },
  fieldLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
});
