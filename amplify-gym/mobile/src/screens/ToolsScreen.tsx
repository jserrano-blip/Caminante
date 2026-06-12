import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NumberInput } from '../components/NumberInput';
import { Card } from '../components/Card';
import { PlateCalcView } from '../components/PlateCalc';
import { ScreenHeader } from '../components/ScreenHeader';
import { SegmentedControl } from '../components/SegmentedControl';
import { useApp } from '../context/AppContext';
import {
  dots,
  epley1RM,
  formatWeight,
  fromDisplayWeight,
  rmAtReps,
  toDisplayWeight,
  wilks,
  type Sex,
} from '../lib/formulas';
import { TAB_BAR_SPACE, colors, radius, spacing, typography } from '../theme';

export function ToolsScreen() {
  const { user, unit, gym } = useApp();
  const unitLabel = unit === 'LB' ? 'lb' : 'kg';

  // ── Calculadora RM ──
  const [rmWeight, setRmWeight] = useState(unit === 'LB' ? 225 : 100);
  const [rmReps, setRmReps] = useState(5);
  const oneRmKg = epley1RM(fromDisplayWeight(rmWeight, unit), rmReps);

  // ── Wilks / DOTS ──
  const [sex, setSex] = useState<Sex>(user?.sex ?? 'M');
  const [bodyW, setBodyW] = useState(unit === 'LB' ? 175 : 80);
  const [total, setTotal] = useState(unit === 'LB' ? 660 : 300);
  const bodyKg = fromDisplayWeight(bodyW, unit);
  const totalKg = fromDisplayWeight(total, unit);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="Herramientas" subtitle="Calculadoras rápidas" />

        <View style={styles.body}>
          <Card style={{ gap: spacing.sm }}>
            <Text style={styles.sectionTitle}>Calculadora de RM (Epley)</Text>
            <View style={styles.row}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Peso ({unitLabel})</Text>
                <NumberInput value={rmWeight} onChange={setRmWeight} step={unit === 'LB' ? 5 : 2.5} min={0} compact />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Reps</Text>
                <NumberInput value={rmReps} onChange={setRmReps} step={1} min={1} max={20} decimals={false} compact />
              </View>
            </View>
            <View style={styles.rmTable}>
              {[1, 3, 5, 8].map((reps) => (
                <View key={reps} style={styles.rmCell}>
                  <Text style={styles.rmLabel}>{reps}RM</Text>
                  <Text style={styles.rmValue}>
                    {oneRmKg > 0 ? toDisplayWeight(rmAtReps(oneRmKg, reps), unit) : '—'}
                  </Text>
                  <Text style={styles.rmUnit}>{unitLabel}</Text>
                </View>
              ))}
            </View>
          </Card>

          <Card style={{ gap: spacing.sm }}>
            <Text style={styles.sectionTitle}>Calculadora de discos</Text>
            <PlateCalcView initialTargetKg={60} gym={gym} unit={unit} />
          </Card>

          <Card style={{ gap: spacing.sm }}>
            <Text style={styles.sectionTitle}>Wilks y DOTS rápido</Text>
            <SegmentedControl
              options={['M', 'F'] as const}
              labels={{ M: 'Hombre', F: 'Mujer' }}
              value={sex}
              onChange={setSex}
            />
            <View style={styles.row}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Peso corporal ({unitLabel})</Text>
                <NumberInput value={bodyW} onChange={setBodyW} step={unit === 'LB' ? 1 : 0.5} min={0} compact />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Total levantado ({unitLabel})</Text>
                <NumberInput value={total} onChange={setTotal} step={unit === 'LB' ? 5 : 2.5} min={0} compact />
              </View>
            </View>
            <View style={styles.scoreRow}>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreValue}>{wilks(sex, bodyKg, totalKg)}</Text>
                <Text style={styles.scoreLabel}>Wilks (2020)</Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreValue}>{dots(sex, bodyKg, totalKg)}</Text>
                <Text style={styles.scoreLabel}>DOTS</Text>
              </View>
            </View>
            <Text style={styles.hint}>
              Total de {formatWeight(totalKg, unit)} con {formatWeight(bodyKg, unit)} de peso corporal.
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: TAB_BAR_SPACE },
  body: { paddingHorizontal: spacing.md, gap: spacing.md },
  sectionTitle: { ...typography.subtitle },
  row: { flexDirection: 'row', gap: spacing.md },
  field: { flex: 1 },
  fieldLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  rmTable: { flexDirection: 'row', gap: spacing.sm, marginTop: 4 },
  rmCell: {
    flex: 1,
    backgroundColor: colors.ice,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.sm,
    alignItems: 'center',
    paddingVertical: 10,
  },
  rmLabel: { fontSize: 11, fontWeight: '700', color: colors.accent },
  rmValue: { fontSize: 18, fontWeight: '700', color: colors.primary, marginTop: 2 },
  rmUnit: { fontSize: 10, color: colors.textMuted },
  scoreRow: { flexDirection: 'row', gap: spacing.sm },
  scoreBox: {
    flex: 1,
    backgroundColor: colors.ice,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.sm,
    alignItems: 'center',
    paddingVertical: 12,
  },
  scoreValue: { fontSize: 22, fontWeight: '700', color: colors.primary },
  scoreLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  hint: { fontSize: 11, color: colors.textMuted },
});
