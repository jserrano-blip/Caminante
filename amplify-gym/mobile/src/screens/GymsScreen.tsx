import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deleteGym, listGyms } from '../api/endpoints';
import type { Gym } from '../api/types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { ScreenHeader } from '../components/ScreenHeader';
import { useApp } from '../context/AppContext';
import { useLoad } from '../lib/useLoad';
import type { MasStackParamList } from '../navigation/types';
import { TAB_BAR_SPACE, spacing, type ThemeColors } from '../theme';
import { useTheme } from '../context/ThemeContext';

type Props = NativeStackScreenProps<MasStackParamList, 'Gyms'>;

function equipmentSummary(gym: Gym): string {
  const eq = gym.equipment ?? [];
  const bar = eq.find((e) => e.type === 'BARBELL');
  const plates = eq.filter((e) => e.type === 'PLATE').length;
  const dumbbells = eq.filter((e) => e.type === 'DUMBBELL').length;
  const machines = eq.filter((e) => e.type === 'MACHINE').length;
  const parts: string[] = [];
  if (bar) parts.push(`barra ${bar.weightKg ?? '?'} kg`);
  if (plates) parts.push(`${plates} tipos de disco`);
  if (dumbbells) parts.push(`${dumbbells} mancuernas`);
  if (machines) parts.push(`${machines} máquinas`);
  return parts.length ? parts.join(' · ') : 'Sin equipo registrado';
}

export function GymsScreen({ navigation }: Props) {
  const { colors: c } = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  const { user, gym: activeGym, setGym } = useApp();
  const userId = user?.id ?? '';
  const { data, loading, error, reload } = useLoad(() => listGyms(userId), [userId]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const confirmDelete = (gym: Gym) => {
    Alert.alert('Eliminar gimnasio', `¿Eliminar "${gym.name}" y su inventario?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteGym(gym.id);
            if (activeGym?.id === gym.id) setGym(null);
            reload();
          } catch {
            // se verá al recargar
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Gimnasios" subtitle="Inventario de equipo por gimnasio" />
        {error ? <ErrorBanner message={error} onRetry={reload} /> : null}
        {loading ? <ActivityIndicator color={c.primary} style={{ margin: spacing.lg }} /> : null}

        <View style={styles.body}>
          {data && data.length === 0 ? (
            <EmptyState
              icon="business-outline"
              title="Sin gimnasios"
              subtitle="Registra tu gimnasio y su equipo para la calculadora de discos"
            />
          ) : null}

          {(data ?? []).map((gym) => (
            <Pressable key={gym.id} onPress={() => navigation.navigate('GymEdit', { gym })}>
              <Card style={styles.gymCard}>
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{gym.name}</Text>
                    {activeGym?.id === gym.id ? (
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>activo</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.meta}>{equipmentSummary(gym)}</Text>
                  {gym.notes ? <Text style={styles.notes}>{gym.notes}</Text> : null}
                </View>
                <Pressable onPress={() => confirmDelete(gym)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={20} color={c.textMuted} />
                </Pressable>
              </Card>
            </Pressable>
          ))}

          <Button title="＋ Nuevo gimnasio" onPress={() => navigation.navigate('GymEdit', {})} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) => {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  content: { paddingBottom: TAB_BAR_SPACE },
  body: { paddingHorizontal: spacing.md, gap: spacing.md },
  gymCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { fontSize: 16, fontWeight: '700', color: c.textPrimary },
  activeBadge: {
    backgroundColor: c.primary,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  activeBadgeText: { color: c.white, fontSize: 10, fontWeight: '700' },
  meta: { fontSize: 12, color: c.accent, marginTop: 4 },
  notes: { fontSize: 12, color: c.textMuted, marginTop: 2 },
});
}
