import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deleteRoutine, listRoutines } from '../api/endpoints';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { ScreenHeader } from '../components/ScreenHeader';
import { useApp } from '../context/AppContext';
import { useLoad } from '../lib/useLoad';
import type { RutinasStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<RutinasStackParamList, 'Routines'>;

export function RoutinesScreen({ navigation }: Props) {
  const { user } = useApp();
  const userId = user?.id ?? '';
  const { data, loading, error, reload } = useLoad(() => listRoutines(userId), [userId]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const confirmDelete = (id: string, name: string) => {
    Alert.alert('Eliminar rutina', `¿Eliminar "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRoutine(id);
            reload();
          } catch {
            // el banner de error general lo mostrará al recargar
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Rutinas"
          subtitle="Tus plantillas de entrenamiento"
          right={
            <Pressable onPress={() => navigation.navigate('Exercises')} hitSlop={8}>
              <View style={styles.headerLink}>
                <Ionicons name="library-outline" size={18} color={colors.primary} />
                <Text style={styles.headerLinkText}>Ejercicios</Text>
              </View>
            </Pressable>
          }
        />

        {error ? <ErrorBanner message={error} onRetry={reload} /> : null}
        {loading ? <ActivityIndicator color={colors.primary} style={{ margin: spacing.lg }} /> : null}

        <View style={styles.body}>
          {data && data.length === 0 ? (
            <EmptyState
              icon="list-outline"
              title="Sin rutinas"
              subtitle="Crea tu primera plantilla para entrenar más rápido"
            />
          ) : null}

          {(data ?? []).map((routine) => (
            <Pressable key={routine.id} onPress={() => navigation.navigate('RoutineEdit', { routine })}>
              <Card style={styles.routineCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{routine.name}</Text>
                  {routine.description ? <Text style={styles.desc}>{routine.description}</Text> : null}
                  <Text style={styles.exercises} numberOfLines={2}>
                    {routine.exercises
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((e) => `${e.exercise.name} ${e.targetSets}×${e.targetReps}`)
                      .join(' · ')}
                  </Text>
                </View>
                <Pressable onPress={() => confirmDelete(routine.id, routine.name)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
                </Pressable>
              </Card>
            </Pressable>
          ))}

          <Button title="＋ Nueva rutina" onPress={() => navigation.navigate('RoutineEdit', {})} />
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
  routineCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  name: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  desc: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  exercises: { fontSize: 12, color: colors.accent, marginTop: 6 },
});
