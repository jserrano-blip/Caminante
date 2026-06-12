import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
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
import { colors, shadow } from './src/theme';

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
  return (
    <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
      <Ionicons
        name={focused ? name : (`${name}-outline` as keyof typeof Ionicons.glyphMap)}
        size={22}
        color={focused ? colors.white : colors.textMuted}
      />
    </View>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
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

const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.iceBorder,
    notification: colors.accent,
  },
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 24,
    marginHorizontal: 16,
    borderRadius: 28,
    backgroundColor: colors.surface,
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
    backgroundColor: colors.primary,
  },
});

function Root() {
  const { user, hydrating } = useApp();

  if (hydrating) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
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

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <Root />
      </AppProvider>
    </SafeAreaProvider>
  );
}
