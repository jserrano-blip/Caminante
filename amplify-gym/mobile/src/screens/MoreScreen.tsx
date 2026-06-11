import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { ScreenHeader } from '../components/ScreenHeader';
import type { MasStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<MasStackParamList, 'More'>;

const ITEMS: {
  route: 'Gyms' | 'Nutrition' | 'Tools' | 'Settings';
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}[] = [
  { route: 'Gyms', icon: 'business-outline', title: 'Gimnasios', subtitle: 'Inventario de barras, discos y máquinas' },
  { route: 'Nutrition', icon: 'restaurant-outline', title: 'Meal Prep', subtitle: 'Recetas con macros y olla de presión' },
  { route: 'Tools', icon: 'calculator-outline', title: 'Herramientas', subtitle: 'RM, discos, Wilks y DOTS' },
  { route: 'Settings', icon: 'settings-outline', title: 'Ajustes', subtitle: 'Perfil, servidor y exportar CSV' },
];

export function MoreScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Más" subtitle="Configuración y utilidades" />
        <View style={styles.body}>
          {ITEMS.map((item) => (
            <Pressable key={item.route} onPress={() => navigation.navigate(item.route)}>
              <Card style={styles.itemCard}>
                <View style={styles.iconWrap}>
                  <Ionicons name={item.icon} size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </Card>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xl },
  body: { paddingHorizontal: spacing.md, gap: spacing.sm },
  itemCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  itemSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
