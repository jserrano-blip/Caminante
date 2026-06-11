import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deleteMeal, listMeals } from '../api/endpoints';
import type { MealPrep } from '../api/types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorBanner } from '../components/ErrorBanner';
import { ScreenHeader } from '../components/ScreenHeader';
import { useApp } from '../context/AppContext';
import { useLoad } from '../lib/useLoad';
import type { MasStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<MasStackParamList, 'Nutrition'>;

function MacroPill({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.macroPill}>
      <Text style={styles.macroValue}>{Math.round(value)}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

export function NutritionScreen({ navigation }: Props) {
  const { user } = useApp();
  const userId = user?.id ?? '';
  const { data, loading, error, reload } = useLoad(() => listMeals(userId), [userId]);

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
            <Ionicons name="copy-outline" size={18} color={colors.primary} />
            <Text style={styles.actionText}>Duplicar</Text>
          </Pressable>
        ) : (
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Pressable onPress={() => navigation.navigate('MealEdit', { meal })} hitSlop={8}>
              <Ionicons name="create-outline" size={20} color={colors.primary} />
            </Pressable>
            <Pressable onPress={() => confirmDelete(meal)} hitSlop={8}>
              <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
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
          <Ionicons name="timer-outline" size={15} color={colors.accent} />
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
        {loading ? <ActivityIndicator color={colors.primary} style={{ margin: spacing.lg }} /> : null}

        <View style={styles.body}>
          <Button title="＋ Nueva receta" onPress={() => navigation.navigate('MealEdit', {})} />

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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xl },
  body: { paddingHorizontal: spacing.md, gap: spacing.md },
  sectionTitle: { ...typography.subtitle },
  mealHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  mealName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  mealMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  macros: { flexDirection: 'row', gap: spacing.sm },
  macroPill: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    paddingVertical: 8,
  },
  macroValue: { fontSize: 16, fontWeight: '700', color: colors.primary },
  macroLabel: { fontSize: 10, color: colors.textMuted, marginTop: 1 },
  perServing: { fontSize: 10, color: colors.textMuted, marginTop: -4 },
  applianceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  applianceText: { flex: 1, fontSize: 12, color: colors.accent, fontWeight: '500' },
  instructions: { fontSize: 12, color: colors.textMuted, lineHeight: 18 },
});
