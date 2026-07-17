import { Ionicons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState, useMemo } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getApiKey, setApiKey, testApiKey, testConnection } from '../api/client';
import { updateUser } from '../api/endpoints';
import type { ExportDataset, Sex, WeightUnit } from '../api/types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorBanner } from '../components/ErrorBanner';
import { ScreenHeader } from '../components/ScreenHeader';
import { SegmentedControl } from '../components/SegmentedControl';
import { useApp } from '../context/AppContext';
import { errorMessage } from '../lib/useLoad';
import { resetToProfileSelect } from '../navigation/rootNavigation';
import { TAB_BAR_SPACE, radius, spacing, makeTypography, type ThemeColors } from '../theme';
import { useTheme } from '../context/ThemeContext';

const DATASETS: { key: ExportDataset; label: string }[] = [
  { key: 'sets', label: 'Series (todas)' },
  { key: 'sessions', label: 'Sesiones' },
  { key: 'metrics', label: 'Métricas corporales' },
  { key: 'recovery', label: 'Recuperación' },
  { key: 'records', label: 'Récords (PRs)' },
  { key: 'all', label: 'Todo el histórico' },
];

export function SettingsScreen() {
  const { colors: c, mode, setMode } = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  const { user, setUser, unit, setUnit, baseUrl, setBaseUrl } = useApp();

  const [name, setName] = useState(user?.name ?? '');
  const [sex, setSex] = useState<Sex>(user?.sex ?? 'M');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  const [urlInput, setUrlInput] = useState(baseUrl);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [testing, setTesting] = useState(false);
  const [connMsg, setConnMsg] = useState<string | null>(null);

  useEffect(() => {
    void getApiKey().then((key) => setApiKeyInput(key ?? ''));
  }, []);

  const [exporting, setExporting] = useState<ExportDataset | null>(null);
  const [error, setError] = useState<string | null>(null);

  const saveProfile = async () => {
    if (!user) return;
    if (!name.trim()) {
      setProfileMsg('El nombre no puede estar vacío');
      return;
    }
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const updated = await updateUser(user.id, { name: name.trim(), sex, weightUnit: unit });
      setUser(updated);
      setProfileMsg('Perfil guardado ✓');
    } catch (err) {
      setProfileMsg(errorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const changeUnit = async (next: WeightUnit) => {
    setUnit(next);
    if (user) {
      try {
        const updated = await updateUser(user.id, { weightUnit: next });
        setUser(updated);
      } catch {
        // la preferencia local ya quedó guardada
      }
    }
  };

  const saveAndTestUrl = async () => {
    setTesting(true);
    setConnMsg(null);
    try {
      await setBaseUrl(urlInput);
      await setApiKey(apiKeyInput);
      // Paso 1: conectividad básica (GET /health, sin clave)
      const ok = await testConnection(urlInput);
      if (!ok) {
        setConnMsg('No se pudo conectar — revisa la URL y que el servidor esté corriendo.');
        return;
      }
      // Paso 2: autenticación (GET /users con x-api-key)
      const auth = await testApiKey(urlInput, apiKeyInput.trim() || null);
      if (auth === 'unauthorized') {
        setConnMsg('Conecta, pero la clave de API es incorrecta');
      } else {
        setConnMsg('Conexión exitosa con el servidor ✓');
      }
    } finally {
      setTesting(false);
    }
  };

  const exportDataset = async (dataset: ExportDataset) => {
    if (!user) return;
    setExporting(dataset);
    setError(null);
    const key = apiKeyInput.trim();
    const keyParam = key ? `&key=${encodeURIComponent(key)}` : '';
    const url = `${baseUrl.replace(/\/+$/, '')}/export.csv?userId=${user.id}&dataset=${dataset}${keyParam}`;
    try {
      const destination = new File(Paths.cache, `amplify-${dataset}-${Date.now()}.csv`);
      const file = await File.downloadFileAsync(url, destination, { idempotent: true });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/csv',
          dialogTitle: `Exportar ${dataset}.csv`,
          UTI: 'public.comma-separated-values-text',
        });
      } else {
        await Linking.openURL(url);
      }
    } catch {
      // fallback: abrir la URL directamente en el navegador
      try {
        await Linking.openURL(url);
      } catch (err) {
        setError(errorMessage(err));
      }
    } finally {
      setExporting(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="Ajustes" subtitle="Perfil, servidor y exportación" />
        {error ? <ErrorBanner message={error} /> : null}

        <View style={styles.body}>
          <Card style={{ gap: spacing.sm }}>
            <Text style={styles.sectionTitle}>Perfil</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nombre"
              placeholderTextColor={c.textMuted}
            />
            <Text style={styles.fieldLabel}>Sexo (para Wilks/DOTS)</Text>
            <SegmentedControl
              options={['M', 'F'] as const}
              labels={{ M: 'Hombre', F: 'Mujer' }}
              value={sex}
              onChange={setSex}
            />
            {profileMsg ? <Text style={styles.msg}>{profileMsg}</Text> : null}
            <Button title="Guardar perfil" onPress={saveProfile} loading={savingProfile} />
          </Card>

          <Card style={{ gap: spacing.sm }}>
            <Text style={styles.sectionTitle}>Apariencia</Text>
            <Text style={styles.hint}>
              Con &quot;Sistema&quot; la app sigue el modo claro/oscuro del teléfono.
            </Text>
            <SegmentedControl
              options={['light', 'dark', 'system'] as const}
              labels={{ light: 'Claro', dark: 'Oscuro', system: 'Sistema' }}
              value={mode}
              onChange={setMode}
            />
          </Card>

          <Card style={{ gap: spacing.sm }}>
            <Text style={styles.sectionTitle}>Unidad por defecto</Text>
            <Text style={styles.hint}>
              Solo cambia cómo ves los pesos; siempre se guardan en kg.
            </Text>
            <SegmentedControl options={['KG', 'LB'] as const} value={unit} onChange={changeUnit} />
          </Card>

          <Card style={{ gap: spacing.sm }}>
            <Text style={styles.sectionTitle}>Servidor</Text>
            <Text style={styles.hint}>
              URL de la API (ej. http://192.168.1.50:4000/api o tu URL de Render).
            </Text>
            <TextInput
              style={styles.input}
              value={urlInput}
              onChangeText={setUrlInput}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              placeholder="http://localhost:4000/api"
              placeholderTextColor={c.textMuted}
            />
            <Text style={styles.fieldLabel}>Clave de API (opcional)</Text>
            <TextInput
              style={styles.input}
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              placeholder="Clave de API (opcional)"
              placeholderTextColor={c.textMuted}
            />
            {connMsg ? <Text style={styles.msg}>{connMsg}</Text> : null}
            <Button title="Guardar y probar conexión" onPress={saveAndTestUrl} loading={testing} />
          </Card>

          <Card style={{ gap: spacing.sm }}>
            <Text style={styles.sectionTitle}>Exportar datos (CSV)</Text>
            <Text style={styles.hint}>
              CSV crudo compatible con Excel (UTF-8 con BOM). Se descarga y comparte desde el
              teléfono.
            </Text>
            {DATASETS.map((d) => (
              <Button
                key={d.key}
                title={exporting === d.key ? 'Descargando…' : d.label}
                variant="secondary"
                small
                onPress={() => exportDataset(d.key)}
                loading={exporting === d.key}
                disabled={exporting !== null && exporting !== d.key}
              />
            ))}
          </Card>

          <Card style={{ gap: spacing.sm }}>
            <View style={styles.profileRow}>
              <Ionicons name="people-outline" size={20} color={c.primary} />
              <Text style={styles.profileText}>Perfil activo: {user?.name ?? '—'}</Text>
            </View>
            <Button
              title="Cambiar de perfil"
              variant="secondary"
              onPress={() => {
                setUser(null);
                resetToProfileSelect();
              }}
            />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) => {
  const typography = makeTypography(c);
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  content: { paddingBottom: TAB_BAR_SPACE },
  body: { paddingHorizontal: spacing.md, gap: spacing.md },
  sectionTitle: { ...typography.subtitle },
  hint: { fontSize: 12, color: c.textMuted, lineHeight: 17 },
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
  fieldLabel: { fontSize: 12, color: c.textMuted },
  msg: { fontSize: 13, fontWeight: '600', color: c.primary },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  profileText: { fontSize: 14, fontWeight: '600', color: c.textPrimary },
});
}
