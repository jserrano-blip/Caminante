import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createMetric, getRelativeStrength, listMetrics } from '../api/endpoints';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorBanner } from '../components/ErrorBanner';
import { LineChart } from '../components/LineChart';
import { NumberInput } from '../components/NumberInput';
import { ScreenHeader } from '../components/ScreenHeader';
import { useApp } from '../context/AppContext';
import { formatWeight, fromDisplayWeight, toDisplayWeight } from '../lib/formulas';
import { errorMessage, useLoad } from '../lib/useLoad';
import type { CuerpoStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<CuerpoStackParamList, 'Body'>;

function shortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export function BodyScreen({ navigation }: Props) {
  const { user, unit } = useApp();
  const userId = user?.id ?? '';
  const metrics = useLoad(() => listMetrics(userId), [userId]);
  const relative = useLoad(() => getRelativeStrength(userId), [userId]);

  useFocusEffect(
    useCallback(() => {
      metrics.reload();
      relative.reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const sorted = (metrics.data ?? [])
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const last = sorted[sorted.length - 1];

  const [weightDisplay, setWeightDisplay] = useState(0);
  const [heightCm, setHeightCm] = useState(0);
  const [bodyFat, setBodyFat] = useState(0);
  const [initializedForm, setInitializedForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!initializedForm && last) {
    setWeightDisplay(toDisplayWeight(last.weightKg, unit));
    setHeightCm(last.heightCm ?? 0);
    setBodyFat(last.bodyFatPct ?? 0);
    setInitializedForm(true);
  }

  const save = async () => {
    if (weightDisplay <= 0) {
      setSaveError('El peso debe ser mayor a 0');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await createMetric({
        userId,
        weightKg: fromDisplayWeight(weightDisplay, unit),
        heightCm: heightCm > 0 ? heightCm : undefined,
        bodyFatPct: bodyFat > 0 ? bodyFat : undefined,
      });
      metrics.reload();
      relative.reload();
    } catch (err) {
      setSaveError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Cuerpo"
          subtitle="Métricas y fuerza relativa"
          right={
            <Pressable onPress={() => navigation.navigate('Recovery')} hitSlop={8}>
              <View style={styles.headerLink}>
                <Ionicons name="moon-outline" size={17} color={colors.primary} />
                <Text style={styles.headerLinkText}>Recuperación</Text>
              </View>
            </Pressable>
          }
        />

        {metrics.error ? <ErrorBanner message={metrics.error} onRetry={metrics.reload} /> : null}

        <View style={styles.body}>
          <Card style={{ gap: spacing.sm }}>
            <Text style={styles.sectionTitle}>Registrar medición</Text>
            <View style={styles.fieldsRow}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Peso ({unit === 'LB' ? 'lb' : 'kg'})</Text>
                <NumberInput value={weightDisplay} onChange={setWeightDisplay} step={unit === 'LB' ? 1 : 0.5} min={0} compact />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Altura (cm)</Text>
                <NumberInput value={heightCm} onChange={setHeightCm} step={1} min={0} max={250} compact />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>% grasa</Text>
                <NumberInput value={bodyFat} onChange={setBodyFat} step={0.5} min={0} max={70} compact />
              </View>
            </View>
            {saveError ? <Text style={styles.formError}>{saveError}</Text> : null}
            <Button title="Guardar medición" onPress={save} loading={saving} />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Evolución del peso corporal</Text>
            {metrics.loading ? <ActivityIndicator color={colors.primary} /> : null}
            {sorted.length > 0 ? (
              <LineChart
                data={sorted.map((m) => ({ label: shortDate(m.date), value: toDisplayWeight(m.weightKg, unit) }))}
                formatValue={(v) => `${v} ${unit === 'LB' ? 'lb' : 'kg'}`}
              />
            ) : !metrics.loading ? (
              <Text style={typography.muted}>Registra tu primera medición para ver la tendencia.</Text>
            ) : null}
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Fuerza relativa</Text>
            <Text style={styles.explainer}>
              Levantar 100 kg no significa lo mismo para todos: el mérito depende de tu peso
              corporal. Wilks y DOTS normalizan tu fuerza para poder compararla.
            </Text>
            {relative.loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.sm }} /> : null}
            {relative.error ? <Text style={typography.muted}>No se pudo cargar la fuerza relativa.</Text> : null}
            {relative.data ? (
              relative.data.lifts.length === 0 ? (
                <Text style={[typography.muted, { marginTop: spacing.sm }]}>
                  Registra series en los básicos (sentadilla, press banca, peso muerto) y tu peso
                  corporal para calcular Wilks y DOTS.
                </Text>
              ) : (
                <View style={{ marginTop: spacing.sm }}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.th, { flex: 1.6 }]}>Ejercicio</Text>
                    <Text style={styles.th}>e1RM</Text>
                    <Text style={styles.th}>Wilks</Text>
                    <Text style={styles.th}>DOTS</Text>
                  </View>
                  {relative.data.lifts.map((lift) => (
                    <View key={lift.exerciseId} style={styles.tr}>
                      <Text style={[styles.td, { flex: 1.6, fontWeight: '600' }]} numberOfLines={1}>
                        {lift.name}
                      </Text>
                      <Text style={styles.td}>{formatWeight(lift.bestE1rmKg, unit)}</Text>
                      <Text style={styles.td}>{lift.wilks}</Text>
                      <Text style={styles.td}>{lift.dots}</Text>
                    </View>
                  ))}
                  {relative.data.totalWilks !== undefined ? (
                    <View style={[styles.tr, styles.totalRow]}>
                      <Text style={[styles.td, { flex: 1.6, fontWeight: '700' }]}>Total</Text>
                      <Text style={styles.td}> </Text>
                      <Text style={[styles.td, { fontWeight: '700' }]}>{relative.data.totalWilks}</Text>
                      <Text style={[styles.td, { fontWeight: '700' }]}>{relative.data.totalDots ?? ''}</Text>
                    </View>
                  ) : null}
                  <Text style={styles.bw}>
                    Peso corporal usado: {formatWeight(relative.data.bodyWeightKg, unit)}
                  </Text>
                </View>
              )
            ) : null}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xl },
  body: { paddingHorizontal: spacing.md, gap: spacing.md },
  headerLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerLinkText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  sectionTitle: { ...typography.subtitle, marginBottom: 4 },
  fieldsRow: { flexDirection: 'row', gap: spacing.sm },
  field: { flex: 1 },
  fieldLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  formError: { color: colors.primaryDark, fontSize: 13, fontWeight: '600' },
  explainer: { fontSize: 12, color: colors.textMuted, lineHeight: 18 },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
    paddingBottom: 6,
  },
  th: { flex: 1, fontSize: 11, fontWeight: '700', color: colors.accent, textTransform: 'uppercase' },
  tr: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
    alignItems: 'center',
  },
  td: { flex: 1, fontSize: 13, color: colors.textPrimary },
  totalRow: { backgroundColor: colors.surface, borderRadius: 8, paddingHorizontal: 4 },
  bw: { fontSize: 11, color: colors.textMuted, marginTop: spacing.sm },
});
