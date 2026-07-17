import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { rootNavigationRef } from './src/navigation/rootNavigation';
import type {
  CuerpoStackParamList,
  EntrenarStackParamList,
  MainTabsParamList,
  MasStackParamList,
  RootStackParamList,
  RutinasStackParamList,
} from './src/navigation/types';
import { BodyScreen } from './src/screens/BodyScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { ExerciseEditScreen } from './src/screens/ExerciseEditScreen';
import { ExercisesScreen } from './src/screens/ExercisesScreen';
import { GymEditScreen } from './src/screens/GymEditScreen';
import { GymsScreen } from './src/screens/GymsScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { LiveWorkoutScreen } from './src/screens/LiveWorkoutScreen';
import { MealEditScreen } from './src/screens/MealEditScreen';
import { MoreScreen } from './src/screens/MoreScreen';
import { NutritionScreen } from './src/screens/NutritionScreen';
import { ProfileSelectScreen } from './src/screens/ProfileSelectScreen';
import { RecoveryScreen } from './src/screens/RecoveryScreen';
import { RoutineEditScreen } from './src/screens/RoutineEditScreen';
import { RoutinesScreen } from './src/screens/RoutinesScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { StartWorkoutScreen } from './src/screens/StartWorkoutScreen';
import { ToolsScreen } from './src/screens/ToolsScreen';
import { WorkoutSummaryScreen } from './src/screens/WorkoutSummaryScreen';
import { shadow, type ThemeColors } from './src/theme';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabsParamList>();
const EntrenarStack = createNativeStackNavigator<EntrenarStackParamList>();
const RutinasStack = createNativeStackNavigator<RutinasStackParamList>();
const CuerpoStack = createNativeStackNavigator<CuerpoStackParamList>();
const MasStack = createNativeStackNavigator<MasStackParamList>();

const stackOptions = { headerShown: false } as const;

function EntrenarNavigator() {
  return (
    <EntrenarStack.Navigator screenOptions={stackOptions}>
      <EntrenarStack.Screen name="StartWorkout" component={StartWorkoutScreen} />
      <EntrenarStack.Screen name="LiveWorkout" component={LiveWorkoutScreen} options={{ gestureEnabled: false }} />
      <EntrenarStack.Screen name="WorkoutSummary" component={WorkoutSummaryScreen} />
      <EntrenarStack.Screen name="History" component={HistoryScreen} />
    </EntrenarStack.Navigator>
  );
}

function RutinasNavigator() {
  return (
    <RutinasStack.Navigator screenOptions={stackOptions}>
      <RutinasStack.Screen name="Routines" component={RoutinesScreen} />
      <RutinasStack.Screen name="RoutineEdit" component={RoutineEditScreen} />
      <RutinasStack.Screen name="Exercises" component={ExercisesScreen} />
      <RutinasStack.Screen name="ExerciseEdit" component={ExerciseEditScreen} />
    </RutinasStack.Navigator>
  );
}

function CuerpoNavigator() {
  return (
    <CuerpoStack.Navigator screenOptions={stackOptions}>
      <CuerpoStack.Screen name="Body" component={BodyScreen} />
      <CuerpoStack.Screen name="Recovery" component={RecoveryScreen} />
    </CuerpoStack.Navigator>
  );
}

function MasNavigator() {
  return (
    <MasStack.Navigator screenOptions={stackOptions}>
      <MasStack.Screen name="More" component={MoreScreen} />
      <MasStack.Screen name="Gyms" component={GymsScreen} />
      <MasStack.Screen name="GymEdit" component={GymEditScreen} />
      <MasStack.Screen name="Nutrition" component={NutritionScreen} />
      <MasStack.Screen name="MealEdit" component={MealEditScreen} />
      <MasStack.Screen name="Tools" component={ToolsScreen} />
      <MasStack.Screen name="Settings" component={SettingsScreen} />
    </MasStack.Navigator>
  );
}

const TAB_ICONS: Record<keyof MainTabsParamList, keyof typeof Ionicons.glyphMap> = {
  InicioTab: 'home',
  EntrenarTab: 'barbell',
  RutinasTab: 'list',
  CuerpoTab: 'body',
  MasTab: 'ellipsis-horizontal',
};

function TabIcon({ name, focused }: { name: keyof typeof Ionicons.glyphMap; focused: boolean }) {
  const { colors: c } = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  return (
    <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
      <Ionicons
        name={focused ? name : (`${name}-outline` as keyof typeof Ionicons.glyphMap)}
        size={22}
        color={focused ? c.white : c.textMuted}
      />
    </View>
  );
}

function MainTabs() {
  const { colors: c } = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarIcon: ({ focused }) => <TabIcon name={TAB_ICONS[route.name]} focused={focused} />,
      })}
    >
      <Tabs.Screen name="InicioTab" component={DashboardScreen} options={{ title: 'Inicio' }} />
      <Tabs.Screen name="EntrenarTab" component={EntrenarNavigator} options={{ title: 'Entrenar' }} />
      <Tabs.Screen name="RutinasTab" component={RutinasNavigator} options={{ title: 'Rutinas' }} />
      <Tabs.Screen name="CuerpoTab" component={CuerpoNavigator} options={{ title: 'Cuerpo' }} />
      <Tabs.Screen name="MasTab" component={MasNavigator} options={{ title: 'Más' }} />
    </Tabs.Navigator>
  );
}

const makeNavTheme = (c: ThemeColors, resolved: 'light' | 'dark'): Theme => ({
  ...(resolved === 'dark' ? DarkTheme : DefaultTheme),
  colors: {
    ...(resolved === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
    primary: c.primary,
    background: c.background,
    card: c.surface,
    text: c.textPrimary,
    border: c.iceBorder,
    notification: c.accent,
  },
});

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    tabBar: {
      position: 'absolute',
      bottom: 24,
      marginHorizontal: 16,
      borderRadius: 28,
      backgroundColor: c.surface,
      height: 64,
      borderTopWidth: 0,
      paddingBottom: 0,
      paddingTop: 0,
      ...shadow.soft,
    },
    tabBarItem: {
      height: 64,
      justifyContent: 'center',
    },
    tabIconWrap: {
      width: 48,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabIconWrapActive: {
      backgroundColor: c.primary,
    },
  });

function Root() {
  const { user, hydrating } = useApp();
  const { colors: c, resolved } = useTheme();
  const navTheme = useMemo(() => makeNavTheme(c, resolved), [c, resolved]);

  if (hydrating) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={rootNavigationRef} theme={navTheme}>
      <RootStack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={user ? 'MainTabs' : 'ProfileSelect'}
      >
        <RootStack.Screen name="ProfileSelect" component={ProfileSelectScreen} />
        <RootStack.Screen name="MainTabs" component={MainTabs} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

function ThemedStatusBar() {
  const { resolved } = useTheme();
  return <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <ThemeProvider>
          <ThemedStatusBar />
          <Root />
        </ThemeProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
