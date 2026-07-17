import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Exercise } from '../api/types';
import { normalize } from '../lib/text';
import { radius, spacing, makeTypography, type ThemeColors } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface Props {
  visible: boolean;
  exercises: Exercise[];
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
  title?: string;
}

/** Aplana padres + variantes en una sola lista buscable (sin duplicar). */
export function flattenExercises(exercises: Exercise[]): Exercise[] {
  const out: Exercise[] = [];
  const seen = new Set<string>();
  for (const ex of exercises) {
    if (!seen.has(ex.id)) {
      out.push(ex);
      seen.add(ex.id);
    }
    for (const v of ex.variants ?? []) {
      if (!seen.has(v.id)) {
        out.push(v);
        seen.add(v.id);
      }
    }
  }
  return out;
}

export function ExercisePickerModal({ visible, exercises, onSelect, onClose, title = 'Elegir ejercicio' }: Props) {
  const { colors: c } = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  const [query, setQuery] = useState('');
  const all = useMemo(() => flattenExercises(exercises), [exercises]);
  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return all;
    return all.filter(
      (e) => normalize(e.name).includes(q) || normalize(e.muscleGroup).includes(q)
    );
  }, [all, query]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.search}>
          <Ionicons name="search-outline" size={18} color={c.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar ejercicio…"
            placeholderTextColor={c.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={c.textMuted} />
            </Pressable>
          ) : null}
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
              onPress={() => {
                onSelect(item);
                setQuery('');
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>
                  {item.variantOfId ? '↳ ' : ''}
                  {item.name}
                </Text>
                <Text style={styles.meta}>
                  {item.muscleGroup} · {item.category}
                  {item.userId ? ' · propio' : ''}
                </Text>
              </View>
              <Ionicons name="add-circle-outline" size={22} color={c.accent} />
            </Pressable>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Sin resultados</Text>}
        />
      </View>
    </Modal>
  );
}

const createStyles = (c: ThemeColors) => {
  const typography = makeTypography(c);
  return StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(30, 58, 138, 0.35)' },
  sheet: {
    backgroundColor: c.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    height: '75%',
  },
  title: { ...typography.subtitle, fontSize: 20, marginBottom: spacing.sm },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: c.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.surfaceBorder,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: c.textPrimary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: c.ice,
  },
  name: { fontSize: 15, fontWeight: '600', color: c.textPrimary },
  meta: { fontSize: 12, color: c.textMuted, marginTop: 1 },
  empty: { textAlign: 'center', color: c.textMuted, marginTop: spacing.lg },
});
}
