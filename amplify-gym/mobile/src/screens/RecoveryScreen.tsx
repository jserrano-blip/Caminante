import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createRecovery, listRecovery } from '../api/endpoints';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorBanner } from '../components/ErrorBanner';
import { ScreenHeader } from '../components/ScreenHeader';
import { SimpleSlider } from '../components/SimpleSlider';
import { useApp } from '../context/AppContext';
import { errorMessage, useLoad } from '../lib/useLoad';
import { TAB_BAR_SPACE, colors, spacing, typography } from '../theme';

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function RecoveryScreen() {
  const { user } = useApp();
  const userId = user?.id ?? '';
  const { data, loading, error, reload } = useLoad(() => listRecovery(userId), [userId]);

  const [sleep, setSleep] = useState(7.5);
  const [soreness, setSoreness] = useState(3);
  const [fatigue, setFatigue] = useState(3);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await createRecovery({ userId, sleepHours: sleep, soreness, fatigue });
      reload();
    } catch (err) {
      setSaveError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const recent = (data ?? [])
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 14);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Recuperación" subtitle="Sueño, dolor muscular y fatiga" />
        {error ? <ErrorBanner message={error} onRetry={reload} /> : null}

        <View style={styles.body}>
          <Card tinted style={{ gap: 2 }}>
            <Text style={styles.sectionTitle}>¿Cómo te sientes hoy?</Text>
            <SimpleSlider
              label="Horas de sueño"
              value={sleep}
              onChange={setSleep}
              min={0}
              max={12}
              step={0.5}
              format={(v) => `${v} h`}
            />
            <SimpleSlider label="Dolor muscular (1-10)" value={soreness} onChange={setSoreness} min={1} max={10} />
            <SimpleSlider label="Fatiga general (1-10)" value={fatigue} onChange={setFatigue} min={1} max={10} />
            {saveError ? <Text style={styles.formError}>{saveError}</Text> : null}
            <Button title="Guardar registro" onPress={save} loading={saving} style={{ marginTop: spacing.sm }} />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Historial reciente</Text>
            {loading ? <ActivityIndicator color={colors.primary} /> : null}
            {!loading && recent.length === 0 ? (
              <Text style={typography.muted}>Aún no hay registros de recuperación.</Text>
            ) : null}
            {recent.map((log) => (
              <View key={log.id} style={styles.logRow}>
                <Text style={styles.logDate}>{fmtDate(log.date)}</Text>
                <View style={styles.logStats}>
                  <Text style={styles.logStat}>
                    <Ionicons name="moon-outline" size={12} color={colors.textMuted} /> {log.sleepHours} h
                  </Text>
                  <Text style={styles.logStat}>
                    <Ionicons name="fitness-outline" size={12} color={colors.textMuted} /> dolor {log.soreness}
                  </Text>
                  <Text style={styles.logStat}>
                    <Ionicons name="battery-half-outline" size={12} color={colors.textMuted} /> fatiga {log.fatigue}
                  </Text>
                </View>
              </View>
            ))}
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
  sectionTitle: { ...typography.subtitle, marginBottom: spacing.sm },
  formError: { color: colors.primaryDark, fontSize: 13, fontWeight: '600', marginTop: 4 },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.ice,
  },
  logDate: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, textTransform: 'capitalize' },
  logStats: { flexDirection: 'row', gap: spacing.sm },
  logStat: { fontSize: 12, color: colors.accent },
});
