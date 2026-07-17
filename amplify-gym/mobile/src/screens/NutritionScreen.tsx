import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState, useMemo } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deleteMeal, listMeals } from '../api/endpoints';
import type { MealPrep } from '../api/types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorBanner } from '../components/ErrorBanner';
import { NumberInput } from '../components/NumberInput';
import { ScreenHeader } from '../components/ScreenHeader';
import { SegmentedControl } from '../components/SegmentedControl';
import { useApp } from '../context/AppContext';
import { useLoad } from '../lib/useLoad';
import type { MasStackParamList } from '../navigation/types';
import { TAB_BAR_SPACE, radius, spacing, makeTypography, type ThemeColors } from '../theme';
import { useTheme } from '../context/ThemeContext';

type Props = NativeStackScreenProps<MasStackParamList, 'Nutrition'>;

const ACTIVITY = ['Ligera', 'Moderada', 'Alta'] as const;
const ACTIVITY_FACTOR: Record<(typeof ACTIVITY)[number], number> = {
  Ligera: 1.375,
  Moderada: 1.55,
  Alta: 1.725,
};
const GOALS = ['Definición', 'Mantener', 'Volumen'] as const;
const GOAL_FACTOR: Record<(typeof GOALS)[number], number> = {
  'Definición': 0.85,
  Mantener: 1,
  Volumen: 1.1,
};

/** TDEE Mifflin-St Jeor + reparto: proteína 2 g/kg, grasa 0.9 g/kg, resto carbohidratos. */
function macroTargets(opts: {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: 'M' | 'F';
  activity: (typeof ACTIVITY)[number];
  goal: (typeof GOALS)[number];
}) {
  const { weightKg, heightCm, age, sex, activity, goal } = opts;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'M' ? 5 : -161);
  const calories = Math.round(bmr * ACTIVITY_FACTOR[activity] * GOAL_FACTOR[goal]);
  const proteinG = Math.round(weightKg * 2);
  const fatG = Math.round(weightKg * 0.9);
  const carbsG = Math.max(0, Math.round((calories - proteinG * 4 - fatG * 9) / 4));
  return { calories, proteinG, fatG, carbsG };
}

function MacroPill({ label, value }: { label: string; value: number }) {
  const { colors: c } = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  return (
    <View style={styles.macroPill}>
      <Text style={styles.macroValue}>{Math.round(value)}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

export function NutritionScreen({ navigation }: Props) {
  const { colors: c } = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  const { user } = useApp();
  const userId = user?.id ?? '';
  const { data, loading, error, reload } = useLoad(() => listMeals(userId), [userId]);

  // calculadora de macros (solo cliente)
  const [calcOpen, setCalcOpen] = useState(false);
  const [weightKg, setWeightKg] = useState(80);
  const [heightCm, setHeightCm] = useState(175);
  const [age, setAge] = useState(30);
  const [activity, setActivity] = useState<(typeof ACTIVITY)[number]>('Moderada');
  const [goal, setGoal] = useState<(typeof GOALS)[number]>('Mantener');
  const targets = macroTargets({
    weightKg,
    heightCm,
    age,
    sex: user?.sex === 'F' ? 'F' : 'M',
    activity,
    goal,
  });

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const globals = (data ?? []).filter((m) => m.userId === null);
  const own = (data ?? []).filter((m) => m.userId !== null);

  const confirmDelete = (meal: MealPrep) => {
    Alert.alert('Eliminar receta', `¿Eliminar "${meal.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMeal(meal.id);
            reload();
          } catch {
            // visible al recargar
          }
        },
      },
    ]);
  };

  const renderMeal = (meal: MealPrep, isTemplate: boolean) => (
    <Card key={meal.id} style={{ gap: spacing.sm }}>
      <View style={styles.mealHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.mealName}>{meal.name}</Text>
          <Text style={styles.mealMeta}>
            {meal.servings} porciones
            {meal.cookMinutes ? ` · ${meal.cookMinutes} min` : ''}
            {isTemplate ? ' · plantilla' : ''}
          </Text>
        </View>
        {isTemplate ? (
          <Pressable
            onPress={() => navigation.navigate('MealEdit', { duplicateFrom: meal })}
            hitSlop={8}
            style={styles.actionBtn}
          >
            <Ionicons name="copy-outline" size={18} color={c.primary} />
            <Text style={styles.actionText}>Duplicar</Text>
          </Pressable>
        ) : (
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Pressable onPress={() => navigation.navigate('MealEdit', { meal })} hitSlop={8}>
              <Ionicons name="create-outline" size={20} color={c.primary} />
            </Pressable>
            <Pressable onPress={() => confirmDelete(meal)} hitSlop={8}>
              <Ionicons name="trash-outline" size={20} color={c.textMuted} />
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.macros}>
        <MacroPill label="P (g)" value={meal.proteinG} />
        <MacroPill label="C (g)" value={meal.carbsG} />
        <MacroPill label="G (g)" value={meal.fatG} />
        <MacroPill label="kcal" value={meal.calories} />
      </View>
      <Text style={styles.perServing}>Macros por porción</Text>

      {meal.applianceNote ? (
        <View style={styles.applianceRow}>
          <Ionicons name="timer-outline" size={15} color={c.accent} />
          <Text style={styles.applianceText}>{meal.applianceNote}</Text>
        </View>
      ) : null}
      {meal.instructions ? <Text style={styles.instructions}>{meal.instructions}</Text> : null}
    </Card>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Meal Prep" subtitle="Recetas con macros y olla de presión" />
        {error ? <ErrorBanner message={error} onRetry={reload} /> : null}
        {loading ? <ActivityIndicator color={c.primary} style={{ margin: spacing.lg }} /> : null}

        <View style={styles.body}>
          <Button title="＋ Nueva receta" onPress={() => navigation.navigate('MealEdit', {})} />

          <Card tinted style={{ gap: spacing.sm }}>
            <Pressable onPress={() => setCalcOpen((v) => !v)} style={styles.calcHeader}>
              <View style={styles.calcBubble}>
                <Ionicons name="calculator-outline" size={18} color={c.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.mealName}>Calculadora de macros</Text>
                <Text style={styles.mealMeta}>TDEE Mifflin-St Jeor según tu objetivo</Text>
              </View>
              <Ionicons name={calcOpen ? 'chevron-up' : 'chevron-down'} size={18} color={c.textMuted} />
            </Pressable>

            {calcOpen ? (
              <>
                <View style={styles.calcInputs}>
                  <View style={styles.calcField}>
                    <Text style={styles.calcLabel}>Peso (kg)</Text>
                    <NumberInput value={weightKg} onChange={setWeightKg} min={30} max={250} step={1} compact />
                  </View>
                  <View style={styles.calcField}>
                    <Text style={styles.calcLabel}>Altura (cm)</Text>
                    <NumberInput value={heightCm} onChange={setHeightCm} min={120} max={230} step={1} compact />
                  </View>
                  <View style={styles.calcField}>
                    <Text style={styles.calcLabel}>Edad</Text>
                    <NumberInput value={age} onChange={setAge} min={14} max={99} step={1} decimals={false} compact />
                  </View>
                </View>
                <Text style={styles.calcLabel}>Actividad</Text>
                <SegmentedControl options={ACTIVITY} value={activity} onChange={setActivity} />
                <Text style={styles.calcLabel}>Objetivo</Text>
                <SegmentedControl options={GOALS} value={goal} onChange={setGoal} />

                <View style={[styles.macros, { marginTop: spacing.sm }]}>
                  <MacroPill label="P (g)" value={targets.proteinG} />
                  <MacroPill label="C (g)" value={targets.carbsG} />
                  <MacroPill label="G (g)" value={targets.fatG} />
                  <MacroPill label="kcal" value={targets.calories} />
                </View>
                <Text style={styles.perServing}>Objetivo diario · proteína 2 g/kg, grasa 0.9 g/kg</Text>
              </>
            ) : null}
          </Card>

          {own.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Mis recetas</Text>
              {own.map((m) => renderMeal(m, false))}
            </>
          ) : null}

          {globals.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Plantillas</Text>
              {globals.map((m) => renderMeal(m, true))}
            </>
          ) : null}
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
  sectionTitle: { ...typography.subtitle },
  mealHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  mealName: { fontSize: 16, fontWeight: '700', color: c.textPrimary },
  mealMeta: { fontSize: 12, color: c.textMuted, marginTop: 2 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { color: c.primary, fontWeight: '600', fontSize: 13 },
  macros: { flexDirection: 'row', gap: spacing.sm },
  macroPill: {
    flex: 1,
    backgroundColor: c.ice,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: c.surfaceBorder,
    alignItems: 'center',
    paddingVertical: 8,
  },
  macroValue: { fontSize: 16, fontWeight: '700', color: c.primary },
  macroLabel: { fontSize: 10, color: c.textMuted, marginTop: 1 },
  perServing: { fontSize: 10, color: c.textMuted, marginTop: -4 },
  calcHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  calcBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcInputs: { flexDirection: 'row', gap: spacing.sm },
  calcField: { flex: 1 },
  calcLabel: { fontSize: 12, fontWeight: '600', color: c.textMuted, marginTop: 4, marginBottom: 2 },
  applianceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  applianceText: { flex: 1, fontSize: 12, color: c.accent, fontWeight: '500' },
  instructions: { fontSize: 12, color: c.textMuted, lineHeight: 18 },
});
}
