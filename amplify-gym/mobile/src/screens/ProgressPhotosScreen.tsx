import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listMetrics } from '../api/endpoints';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { ScreenHeader } from '../components/ScreenHeader';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { formatWeight } from '../lib/formulas';
import type { CuerpoStackParamList } from '../navigation/types';
import { TAB_BAR_SPACE, radius, spacing, makeTypography, type ThemeColors } from '../theme';

type Props = NativeStackScreenProps<CuerpoStackParamList, 'ProgressPhotos'>;

const STORAGE_KEY = 'amplify.progressPhotos';
const PHOTOS_DIR = 'progress-photos';

interface ProgressPhoto {
  id: string;
  uri: string;
  date: string;
  weightKg?: number;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

async function readIndex(): Promise<ProgressPhoto[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ProgressPhoto[]) : [];
  } catch {
    return [];
  }
}

async function writeIndex(photos: ProgressPhoto[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
  } catch {
    // sin persistencia
  }
}

export function ProgressPhotosScreen({ navigation }: Props) {
  const { colors: c } = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  const { user, unit } = useApp();
  const userId = user?.id ?? '';

  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [adding, setAdding] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    void readIndex().then(setPhotos);
  }, []);

  const savePhotos = (next: ProgressPhoto[]) => {
    setPhotos(next);
    void writeIndex(next);
  };

  const lastWeightKg = async (): Promise<number | undefined> => {
    try {
      const metrics = await listMetrics(userId);
      const latest = metrics
        .slice()
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      return latest?.weightKg;
    } catch {
      return undefined;
    }
  };

  const pick = async (source: 'camera' | 'library') => {
    setAdding(true);
    try {
      let result: ImagePicker.ImagePickerResult;
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Cámara', 'Se necesita permiso de cámara para tomar la foto.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({ quality: 0.6 });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.6,
        });
      }
      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];

      // copia al directorio de documentos para que la foto persista
      const dir = new Directory(Paths.document, PHOTOS_DIR);
      dir.create({ idempotent: true, intermediates: true });
      const id = `photo-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const extMatch = /\.(\w{2,5})$/.exec(asset.uri);
      const ext = extMatch ? `.${extMatch[1]}` : '.jpg';
      const dest = new File(dir, `${id}${ext}`);
      await new File(asset.uri).copy(dest);

      const weightKg = await lastWeightKg();
      const photo: ProgressPhoto = {
        id,
        uri: dest.uri,
        date: new Date().toISOString(),
        weightKg,
      };
      savePhotos([photo, ...photos]);
    } catch {
      Alert.alert('Fotos de progreso', 'No se pudo guardar la foto. Inténtalo de nuevo.');
    } finally {
      setAdding(false);
    }
  };

  const addPhoto = () => {
    Alert.alert('Agregar foto', '¿De dónde quieres tomar la foto?', [
      { text: 'Cámara', onPress: () => void pick('camera') },
      { text: 'Galería', onPress: () => void pick('library') },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const deletePhoto = (photo: ProgressPhoto) => {
    Alert.alert('Eliminar foto', `¿Eliminar la foto del ${fmtDate(photo.date)}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          try {
            const file = new File(photo.uri);
            if (file.exists) file.delete();
          } catch {
            // el índice se limpia igual
          }
          setSelected((prev) => prev.filter((id) => id !== photo.id));
          savePhotos(photos.filter((p) => p.id !== photo.id));
        },
      },
    ]);
  };

  const toggleSelect = (photo: ProgressPhoto) => {
    setSelected((prev) => {
      if (prev.includes(photo.id)) return prev.filter((id) => id !== photo.id);
      if (prev.length >= 2) return [prev[1], photo.id];
      return [...prev, photo.id];
    });
  };

  const toggleCompareMode = () => {
    setCompareMode((prev) => !prev);
    setSelected([]);
  };

  const selectedPhotos = selected
    .map((id) => photos.find((p) => p.id === id))
    .filter((p): p is ProgressPhoto => !!p)
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader
              title="Fotos de progreso"
              subtitle="Tu evolución visual"
              right={
                <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
                  <Ionicons name="close" size={22} color={c.primary} />
                </Pressable>
              }
            />
        <View style={styles.body}>
          <Card>
            <EmptyState
              icon="images-outline"
              title="Disponible en el teléfono"
              subtitle="Las fotos de progreso usan la cámara y el almacenamiento del dispositivo."
            />
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <ScreenHeader
              title="Fotos de progreso"
              subtitle="Tu evolución visual"
              right={
                <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
                  <Ionicons name="close" size={22} color={c.primary} />
                </Pressable>
              }
            />
            <View style={styles.actions}>
              <Button title="Agregar foto" onPress={addPhoto} loading={adding} style={{ flex: 1 }} />
              {photos.length >= 2 ? (
                <Button
                  title={compareMode ? 'Cancelar' : 'Comparar'}
                  variant="secondary"
                  onPress={toggleCompareMode}
                  style={{ flex: 1 }}
                />
              ) : null}
            </View>
            {compareMode ? (
              <Text style={styles.compareHint}>
                Selecciona 2 fotos para compararlas lado a lado.
              </Text>
            ) : null}
            {compareMode && selected.length === 2 ? (
              <Button title="Comparar" onPress={() => setComparing(true)} />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="images-outline"
            title="Sin fotos todavía"
            subtitle="Agrega tu primera foto para documentar tu progreso."
          />
        }
        renderItem={({ item }) => {
          const isSelected = selected.includes(item.id);
          return (
            <Pressable
              style={[styles.cell, compareMode && isSelected && styles.cellSelected]}
              onPress={() => (compareMode ? toggleSelect(item) : undefined)}
              onLongPress={() => deletePhoto(item)}
              delayLongPress={400}
            >
              <Image source={{ uri: item.uri }} style={styles.photo} resizeMode="cover" />
              <View style={styles.cellFooter}>
                <Text style={styles.cellDate}>{fmtDate(item.date)}</Text>
                {item.weightKg !== undefined ? (
                  <Text style={styles.cellWeight}>{formatWeight(item.weightKg, unit)}</Text>
                ) : null}
              </View>
              {compareMode ? (
                <View style={[styles.checkBadge, isSelected && styles.checkBadgeActive]}>
                  <Ionicons
                    name={isSelected ? 'checkmark' : 'ellipse-outline'}
                    size={14}
                    color={isSelected ? c.white : c.textMuted}
                  />
                </View>
              ) : null}
            </Pressable>
          );
        }}
      />

      <Modal
        visible={comparing && selectedPhotos.length === 2}
        animationType="slide"
        onRequestClose={() => setComparing(false)}
      >
        <SafeAreaView style={styles.compareSafe}>
          <View style={styles.compareHeader}>
            <Text style={styles.compareTitle}>Comparación</Text>
            <Pressable onPress={() => setComparing(false)} hitSlop={8}>
              <Ionicons name="close" size={26} color={c.textPrimary} />
            </Pressable>
          </View>
          <View style={styles.compareRow}>
            {selectedPhotos.map((p) => (
              <View key={p.id} style={styles.comparePane}>
                <Image source={{ uri: p.uri }} style={styles.comparePhoto} resizeMode="cover" />
                <Text style={styles.compareDate}>{fmtDate(p.date)}</Text>
                {p.weightKg !== undefined ? (
                  <Text style={styles.compareWeight}>{formatWeight(p.weightKg, unit)}</Text>
                ) : null}
              </View>
            ))}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) => {
  const typography = makeTypography(c);
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },
    body: { paddingHorizontal: spacing.md, gap: spacing.md },
    content: { paddingBottom: TAB_BAR_SPACE, paddingHorizontal: spacing.md },
    headerWrap: { marginHorizontal: -spacing.md, marginBottom: spacing.sm },
    actions: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    compareHint: {
      ...typography.muted,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    gridRow: { gap: spacing.sm, marginBottom: spacing.sm },
    cell: {
      flex: 1,
      backgroundColor: c.surface,
      borderRadius: radius.md,
      borderWidth: 2,
      borderColor: c.iceBorder,
      overflow: 'hidden',
    },
    cellSelected: { borderColor: c.accent },
    photo: { width: '100%', aspectRatio: 3 / 4, backgroundColor: c.ice },
    cellFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.sm,
      paddingVertical: 6,
    },
    cellDate: { fontSize: 12, fontWeight: '600', color: c.textPrimary },
    cellWeight: { fontSize: 12, color: c.textMuted },
    checkBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.surfaceBorder,
    },
    checkBadgeActive: { backgroundColor: c.accent, borderColor: c.accent },
    compareSafe: { flex: 1, backgroundColor: c.background },
    compareHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    compareTitle: { ...typography.subtitle, fontSize: 20 },
    compareRow: {
      flex: 1,
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.lg,
    },
    comparePane: { flex: 1 },
    comparePhoto: {
      width: '100%',
      flex: 1,
      borderRadius: radius.md,
      backgroundColor: c.ice,
    },
    compareDate: { fontSize: 14, fontWeight: '700', color: c.textPrimary, marginTop: spacing.sm },
    compareWeight: { fontSize: 13, color: c.textMuted, marginTop: 2 },
  });
};
