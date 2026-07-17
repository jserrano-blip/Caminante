import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState, useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUser, listUsers } from '../api/endpoints';
import type { Sex, User, WeightUnit } from '../api/types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { SegmentedControl } from '../components/SegmentedControl';
import { useApp } from '../context/AppContext';
import { errorMessage, useLoad } from '../lib/useLoad';
import type { RootStackParamList } from '../navigation/types';
import { radius, spacing, makeTypography, type ThemeColors } from '../theme';
import { useTheme } from '../context/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileSelect'>;

export function ProfileSelectScreen({ navigation }: Props) {
  const { colors: c } = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  const { setUser } = useApp();
  const { data: users, loading, error, reload } = useLoad(() => listUsers(), []);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [sex, setSex] = useState<Sex>('M');
  const [unit, setUnit] = useState<WeightUnit>('KG');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const select = (user: User) => {
    setUser(user);
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  const create = async () => {
    if (!name.trim()) {
      setFormError('Escribe un nombre');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const user = await createUser({ name: name.trim(), sex, weightUnit: unit });
      select(user);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Ionicons name="barbell" size={42} color={c.primary} />
          <Text style={styles.appName}>Amplify Gym</Text>
          <Text style={styles.tagline}>¿Quién entrena hoy?</Text>
        </View>

        {error ? <ErrorBanner message={error} onRetry={reload} /> : null}
        {loading ? <ActivityIndicator color={c.primary} style={{ marginVertical: spacing.lg }} /> : null}

        {!loading && users && users.length === 0 && !creating ? (
          <EmptyState icon="person-add-outline" title="Aún no hay perfiles" subtitle="Crea el primero para empezar" />
        ) : null}

        {users?.map((user) => (
          <Pressable key={user.id} onPress={() => select(user)}>
            <Card style={styles.profileCard}>
              <View style={[styles.avatar, { backgroundColor: user.avatarColor || c.accent }]}>
                <Text style={styles.avatarText}>{user.name.slice(0, 1).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.profileName}>{user.name}</Text>
                <Text style={styles.profileMeta}>
                  {user.sex === 'F' ? 'Mujer' : 'Hombre'} · prefiere {user.weightUnit}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={c.textMuted} />
            </Card>
          </Pressable>
        ))}

        {creating ? (
          <Card style={{ marginTop: spacing.md }}>
            <Text style={styles.formTitle}>Nuevo perfil</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              placeholderTextColor={c.textMuted}
              value={name}
              onChangeText={setName}
              autoFocus
            />
            <Text style={styles.fieldLabel}>Sexo (para Wilks/DOTS)</Text>
            <SegmentedControl
              options={['M', 'F'] as const}
              labels={{ M: 'Hombre', F: 'Mujer' }}
              value={sex}
              onChange={setSex}
            />
            <Text style={styles.fieldLabel}>Unidad preferida</Text>
            <SegmentedControl options={['KG', 'LB'] as const} value={unit} onChange={setUnit} />
            {formError ? <Text style={styles.formError}>{formError}</Text> : null}
            <View style={styles.formButtons}>
              <Button title="Cancelar" variant="secondary" onPress={() => setCreating(false)} style={{ flex: 1 }} />
              <Button title="Crear perfil" onPress={create} loading={saving} style={{ flex: 1 }} />
            </View>
          </Card>
        ) : (
          <Button
            title="＋ Crear perfil"
            variant="secondary"
            onPress={() => setCreating(true)}
            style={{ marginTop: spacing.md }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) => {
  const typography = makeTypography(c);
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  hero: { alignItems: 'center', marginVertical: spacing.xl },
  appName: { ...typography.title, marginTop: spacing.sm },
  tagline: { ...typography.muted, marginTop: 4, fontSize: 15 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: c.white, fontSize: 20, fontWeight: '700' },
  profileName: { fontSize: 17, fontWeight: '600', color: c.textPrimary },
  profileMeta: { fontSize: 12, color: c.textMuted, marginTop: 2 },
  formTitle: { ...typography.subtitle, marginBottom: spacing.sm },
  input: {
    backgroundColor: c.ice,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: c.surfaceBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    color: c.textPrimary,
    marginBottom: spacing.sm,
  },
  fieldLabel: { fontSize: 12, color: c.textMuted, marginTop: spacing.sm, marginBottom: 4 },
  formError: { color: c.primaryDark, fontSize: 13, marginTop: spacing.sm, fontWeight: '600' },
  formButtons: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
});
}
