import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createGym, replaceEquipment, updateGym } from '../api/endpoints';
import type { EquipmentItemInput } from '../api/types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorBanner } from '../components/ErrorBanner';
import { NumberInput } from '../components/NumberInput';
import { useApp } from '../context/AppContext';
import { errorMessage } from '../lib/useLoad';
import type { MasStackParamList } from '../navigation/types';
import { TAB_BAR_SPACE, radius, spacing, makeTypography, type ThemeColors } from '../theme';
import { useTheme } from '../context/ThemeContext';

type Props = NativeStackScreenProps<MasStackParamList, 'GymEdit'>;

interface PlateRow {
  key: string;
  weightKg: number;
  count: number;
}
interface DumbbellRow {
  key: string;
  weightKg: number;
}
interface MachineRow {
  key: string;
  name: string;
  stackStepKg: number;
}

let k = 0;
const nk = () => `eq-${++k}`;

export function GymEditScreen({ navigation, route }: Props) {
  const { colors: c } = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  const existing = route.params?.gym;
  const { user, gym: activeGym, setGym } = useApp();
  const userId = user?.id ?? '';

  const eq = existing?.equipment ?? [];
  const [name, setName] = useState(existing?.name ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [barKg, setBarKg] = useState(eq.find((e) => e.type === 'BARBELL')?.weightKg ?? 20);
  const [plates, setPlates] = useState<PlateRow[]>(
    eq
      .filter((e) => e.type === 'PLATE')
      .map((e) => ({ key: nk(), weightKg: e.weightKg ?? 0, count: e.count ?? 1 }))
  );
  const [dumbbells, setDumbbells] = useState<DumbbellRow[]>(
    eq.filter((e) => e.type === 'DUMBBELL').map((e) => ({ key: nk(), weightKg: e.weightKg ?? 0 }))
  );
  const [machines, setMachines] = useState<MachineRow[]>(
    eq
      .filter((e) => e.type === 'MACHINE')
      .map((e) => ({ key: nk(), name: e.name ?? '', stackStepKg: e.stackStepKg ?? 5 }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!name.trim()) {
      setError('Ponle nombre al gimnasio');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const gym = existing
        ? await updateGym(existing.id, { name: name.trim(), notes: notes.trim() })
        : await createGym({ userId, name: name.trim(), notes: notes.trim() || undefined });

      const equipment: EquipmentItemInput[] = [
        { type: 'BARBELL', weightKg: barKg },
        ...plates
          .filter((p) => p.weightKg > 0)
          .map((p): EquipmentItemInput => ({ type: 'PLATE', weightKg: p.weightKg, count: p.count })),
        ...dumbbells
          .filter((d) => d.weightKg > 0)
          .map((d): EquipmentItemInput => ({ type: 'DUMBBELL', weightKg: d.weightKg })),
        ...machines
          .filter((m) => m.name.trim())
          .map((m): EquipmentItemInput => ({ type: 'MACHINE', name: m.name.trim(), stackStepKg: m.stackStepKg })),
      ];
      const savedEquipment = await replaceEquipment(gym.id, equipment);

      // si es el gimnasio activo, refresca el contexto con el equipo nuevo
      if (activeGym?.id === gym.id) {
        setGym({ ...gym, equipment: savedEquipment });
      }
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
        <Text style={styles.title}>{existing ? 'Editar gimnasio' : 'Nuevo gimnasio'}</Text>
        {error ? <ErrorBanner message={error} /> : null}

        <Card style={{ gap: spacing.sm }}>
          <TextInput
            style={styles.input}
            placeholder="Nombre (ej. Smart Fit Centro)"
            placeholderTextColor={c.textMuted}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Notas (opcional)"
            placeholderTextColor={c.textMuted}
            value={notes}
            onChangeText={setNotes}
          />
        </Card>

        <Card style={{ gap: spacing.sm }}>
          <Text style={styles.sectionTitle}>Barra</Text>
          <View style={styles.inline}>
            <Text style={styles.rowLabel}>Peso de la barra (kg)</Text>
            <NumberInput value={barKg} onChange={setBarKg} step={2.5} min={0} compact style={{ width: 140 }} />
          </View>
        </Card>

        <Card style={{ gap: spacing.sm }}>
          <Text style={styles.sectionTitle}>Discos (pares disponibles)</Text>
          {plates.map((p) => (
            <View key={p.key} style={styles.inline}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Peso (kg)</Text>
                <NumberInput
                  value={p.weightKg}
                  onChange={(v) => setPlates((prev) => prev.map((x) => (x.key === p.key ? { ...x, weightKg: v } : x)))}
                  step={1.25}
                  min={0}
                  compact
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Pares</Text>
                <NumberInput
                  value={p.count}
                  onChange={(v) => setPlates((prev) => prev.map((x) => (x.key === p.key ? { ...x, count: v } : x)))}
                  step={1}
                  min={1}
                  max={20}
                  decimals={false}
                  compact
                />
              </View>
              <Pressable onPress={() => setPlates((prev) => prev.filter((x) => x.key !== p.key))} hitSlop={8}>
                <Ionicons name="remove-circle-outline" size={22} color={c.textMuted} />
              </Pressable>
            </View>
          ))}
          <Button
            title="＋ Agregar disco"
            variant="secondary"
            small
            onPress={() => setPlates((prev) => [...prev, { key: nk(), weightKg: 20, count: 2 }])}
          />
        </Card>

        <Card style={{ gap: spacing.sm }}>
          <Text style={styles.sectionTitle}>Mancuernas (un peso por fila)</Text>
          {dumbbells.map((d) => (
            <View key={d.key} style={styles.inline}>
              <View style={{ flex: 1 }}>
                <NumberInput
                  value={d.weightKg}
                  onChange={(v) =>
                    setDumbbells((prev) => prev.map((x) => (x.key === d.key ? { ...x, weightKg: v } : x)))
                  }
                  step={2.5}
                  min={0}
                  compact
                  suffix="kg"
                />
              </View>
              <Pressable onPress={() => setDumbbells((prev) => prev.filter((x) => x.key !== d.key))} hitSlop={8}>
                <Ionicons name="remove-circle-outline" size={22} color={c.textMuted} />
              </Pressable>
            </View>
          ))}
          <Button
            title="＋ Agregar mancuerna"
            variant="secondary"
            small
            onPress={() => setDumbbells((prev) => [...prev, { key: nk(), weightKg: 10 }])}
          />
        </Card>

        <Card style={{ gap: spacing.sm }}>
          <Text style={styles.sectionTitle}>Máquinas</Text>
          {machines.map((m) => (
            <View key={m.key} style={styles.inline}>
              <TextInput
                style={[styles.input, { flex: 1.6 }]}
                placeholder="Nombre de la máquina"
                placeholderTextColor={c.textMuted}
                value={m.name}
                onChangeText={(t) => setMachines((prev) => prev.map((x) => (x.key === m.key ? { ...x, name: t } : x)))}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Placa (kg)</Text>
                <NumberInput
                  value={m.stackStepKg}
                  onChange={(v) =>
                    setMachines((prev) => prev.map((x) => (x.key === m.key ? { ...x, stackStepKg: v } : x)))
                  }
                  step={0.5}
                  min={0.5}
                  compact
                />
              </View>
              <Pressable onPress={() => setMachines((prev) => prev.filter((x) => x.key !== m.key))} hitSlop={8}>
                <Ionicons name="remove-circle-outline" size={22} color={c.textMuted} />
              </Pressable>
            </View>
          ))}
          <Button
            title="＋ Agregar máquina"
            variant="secondary"
            small
            onPress={() => setMachines((prev) => [...prev, { key: nk(), name: '', stackStepKg: 5 }])}
          />
        </Card>

        <Button title="Guardar gimnasio" onPress={save} loading={saving} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) => {
  const typography = makeTypography(c);
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: TAB_BAR_SPACE },
  title: { ...typography.title, fontSize: 24 },
  sectionTitle: { ...typography.subtitle, fontSize: 15 },
  input: {
    backgroundColor: c.ice,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: c.surfaceBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    color: c.textPrimary,
  },
  inline: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  rowLabel: { flex: 1, fontSize: 14, color: c.textPrimary, alignSelf: 'center' },
  fieldLabel: { fontSize: 10, color: c.textMuted, marginBottom: 2 },
});
}
