import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import type { EquipmentItem, Gym } from '../api/types';
import { formatWeight, fromDisplayWeight, toDisplayWeight } from '../lib/formulas';
import {
  calculatePlates,
  STANDARD_PLATES,
  type PlateResult,
  type PlateStock,
} from '../lib/plateCalculator';
import { colors, radius, spacing, typography } from '../theme';
import { Button } from './Button';
import { NumberInput } from './NumberInput';

export function platesFromGym(gym: Gym | null): { barKg: number; plates: PlateStock[] } {
  const equipment: EquipmentItem[] = gym?.equipment ?? [];
  const bar = equipment.find((e) => e.type === 'BARBELL' && e.weightKg);
  const plateItems = equipment.filter((e) => e.type === 'PLATE' && e.weightKg);
  const plates: PlateStock[] =
    plateItems.length > 0
      ? plateItems.map((e) => ({ weightKg: e.weightKg ?? 0, count: e.count ?? 1 }))
      : STANDARD_PLATES;
  return { barKg: bar?.weightKg ?? 20, plates };
}

/** Visualización SVG de la barra cargada: discos como rectángulos azules proporcionales. */
export function BarVisualization({ barKg, result }: { barKg: number; result: PlateResult }) {
  const width = 320;
  const height = 120;
  const midY = height / 2;
  const maxPlate = 25;

  // discos de un lado, del más pesado (interior) al más ligero (exterior)
  const side: { weightKg: number }[] = [];
  for (const item of result.perSide) {
    for (let i = 0; i < item.qty; i++) side.push({ weightKg: item.weightKg });
  }
  side.sort((a, b) => b.weightKg - a.weightKg);

  const plateW = 13;
  const gap = 3;
  const sleeveStart = width / 2 + 60; // inicio del manguito derecho
  const plateH = (w: number) => 24 + (Math.min(w, maxPlate) / maxPlate) * 64;

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={width} height={height}>
        {/* barra */}
        <Line x1={8} y1={midY} x2={width - 8} y2={midY} stroke={colors.textMuted} strokeWidth={6} strokeLinecap="round" />
        {/* tope del manguito */}
        <Rect x={sleeveStart - 8} y={midY - 16} width={6} height={32} rx={2} fill={colors.textMuted} />
        {/* discos (lado derecho, espejo del izquierdo) */}
        {side.map((p, i) => {
          const h = plateH(p.weightKg);
          const x = sleeveStart + i * (plateW + gap);
          return (
            <React.Fragment key={i}>
              <Rect
                x={x}
                y={midY - h / 2}
                width={plateW}
                height={h}
                rx={3}
                fill={p.weightKg >= 15 ? colors.primary : colors.accent}
              />
              <SvgText
                x={x + plateW / 2}
                y={midY + h / 2 + 12}
                fontSize={8}
                fill={colors.textPrimary}
                textAnchor="middle"
              >
                {String(p.weightKg)}
              </SvgText>
            </React.Fragment>
          );
        })}
        {/* etiqueta de barra */}
        <SvgText x={width / 2 - 40} y={midY - 12} fontSize={10} fill={colors.textMuted} textAnchor="middle">
          {`barra ${barKg} kg`}
        </SvgText>
      </Svg>
    </View>
  );
}

interface PlateCalcViewProps {
  initialTargetKg?: number;
  gym: Gym | null;
  unit: 'KG' | 'LB';
}

/** Calculadora de discos embebible (se usa en el modal del entrenamiento y en Herramientas). */
export function PlateCalcView({ initialTargetKg = 60, gym, unit }: PlateCalcViewProps) {
  const { barKg: gymBar, plates } = useMemo(() => platesFromGym(gym), [gym]);
  const [targetDisplay, setTargetDisplay] = useState(toDisplayWeight(initialTargetKg, unit));
  const [barKg, setBarKg] = useState(gymBar);

  const targetKg = fromDisplayWeight(targetDisplay, unit);
  const result = useMemo(() => calculatePlates(targetKg, barKg, plates), [targetKg, barKg, plates]);

  return (
    <View>
      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Peso objetivo ({unit === 'LB' ? 'lb' : 'kg'})</Text>
          <NumberInput value={targetDisplay} onChange={setTargetDisplay} step={unit === 'LB' ? 5 : 2.5} min={0} />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Barra (kg)</Text>
          <NumberInput value={barKg} onChange={setBarKg} step={2.5} min={0} />
        </View>
      </View>

      <BarVisualization barKg={barKg} result={result} />

      <View style={styles.resultBox}>
        {result.perSide.length === 0 ? (
          <Text style={styles.resultText}>
            {targetKg <= barKg ? 'El objetivo no supera el peso de la barra.' : 'No hay discos que alcancen ese peso.'}
          </Text>
        ) : (
          <Text style={styles.resultText}>
            Por lado:{' '}
            {result.perSide.map((p) => `${p.qty} × ${p.weightKg} kg`).join('  ·  ')}
          </Text>
        )}
        <Text style={styles.achieved}>
          Cargado: {formatWeight(result.achievedKg, unit)}
          {Math.abs(result.residualKg) > 0.01
            ? `  (faltan ${formatWeight(Math.abs(result.residualKg), unit)})`
            : '  ✓ exacto'}
        </Text>
        {gym?.equipment?.some((e) => e.type === 'PLATE') ? (
          <Text style={styles.source}>Usando los discos de {gym.name}</Text>
        ) : (
          <Text style={styles.source}>Usando discos estándar (25/20/15/10/5/2.5/1.25)</Text>
        )}
      </View>
    </View>
  );
}

interface PlateCalcModalProps {
  visible: boolean;
  onClose: () => void;
  initialTargetKg: number;
  gym: Gym | null;
  unit: 'KG' | 'LB';
}

export function PlateCalcModal({ visible, onClose, initialTargetKg, gym, unit }: PlateCalcModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Calculadora de discos</Text>
          <PlateCalcView key={visible ? initialTargetKg : 'closed'} initialTargetKg={initialTargetKg} gym={gym} unit={unit} />
          <Button title="Cerrar" variant="secondary" onPress={onClose} style={{ marginTop: spacing.md }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(30, 58, 138, 0.35)' },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '85%',
  },
  title: { ...typography.subtitle, fontSize: 20, marginBottom: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  field: { flex: 1 },
  fieldLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  resultBox: {
    backgroundColor: colors.ice,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  resultText: { fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  achieved: { fontSize: 13, color: colors.primary, marginTop: 6, fontWeight: '600' },
  source: { fontSize: 11, color: colors.textMuted, marginTop: 6 },
});
