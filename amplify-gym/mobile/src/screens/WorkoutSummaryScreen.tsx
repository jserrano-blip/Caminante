import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { StatTile } from '../components/StatTile';
import { useApp } from '../context/AppContext';
import { formatWeight } from '../lib/formulas';
import type { EntrenarStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<EntrenarStackParamList, 'WorkoutSummary'>;

const RECORD_LABEL: Record<string, string> = {
  WEIGHT: 'Peso máximo',
  E1RM: '1RM estimado',
  VOLUME: 'Volumen de sesión',
  REPS: 'Reps máximas',
};

export function WorkoutSummaryScreen({ navigation, route }: Props) {
  const { summary, sessionName } = route.params;
  const { unit } = useApp();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Ionicons name="checkmark-circle" size={56} color={colors.primary} />
          <Text style={styles.title}>¡Entrenamiento completado!</Text>
          <Text style={styles.subtitle}>{sessionName}</Text>
        </View>

        <View style={styles.tiles}>
          <StatTile icon="time-outline" label="Duración" value={`${summary.durationMin} min`} />
          <StatTile
            icon="barbell-outline"
            label="Volumen total"
            value={formatWeight(summary.totalVolumeKg, unit)}
          />
          <StatTile icon="layers-outline" label="Series" value={String(summary.totalSets)} />
        </View>

        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.sectionTitle}>
            {summary.newRecords.length > 0 ? '🏆 ¡Nuevos récords personales!' : 'Récords personales'}
          </Text>
          {summary.newRecords.length === 0 ? (
            <Text style={styles.muted}>
              Hoy no hubo PRs nuevos — la constancia también construye fuerza.
            </Text>
          ) : (
            summary.newRecords.map((rec) => (
              <View key={rec.id} style={styles.recordRow}>
                <Text style={styles.trophy}>🏆</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recordName}>{rec.exercise?.name ?? 'Ejercicio'}</Text>
                  <Text style={styles.recordType}>{RECORD_LABEL[rec.type] ?? rec.type}</Text>
                </View>
                <Text style={styles.recordValue}>
                  {rec.type === 'REPS'
                    ? `${rec.value} reps`
                    : `${formatWeight(rec.value, unit)}${rec.reps ? ` × ${rec.reps}` : ''}`}
                </Text>
              </View>
            ))
          )}
        </Card>

        <Button
          title="Volver a Entrenar"
          onPress={() => navigation.popToTop()}
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  hero: { alignItems: 'center', marginVertical: spacing.xl },
  title: { ...typography.title, fontSize: 24, marginTop: spacing.sm, textAlign: 'center' },
  subtitle: { ...typography.muted, fontSize: 15, marginTop: 4 },
  tiles: { flexDirection: 'row', gap: spacing.sm },
  sectionTitle: { ...typography.subtitle, marginBottom: spacing.sm },
  muted: typography.muted,
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  trophy: { fontSize: 22 },
  recordName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  recordType: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  recordValue: { fontSize: 16, fontWeight: '700', color: colors.primary },
});
