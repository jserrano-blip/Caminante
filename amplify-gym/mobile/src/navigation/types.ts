import type { Exercise, FinishSummary, Gym, MealPrep, Routine } from '../api/types';

export type RootStackParamList = {
  ProfileSelect: undefined;
  MainTabs: undefined;
};

export type MainTabsParamList = {
  InicioTab: undefined;
  EntrenarTab: undefined;
  RutinasTab: undefined;
  CuerpoTab: undefined;
  MasTab: undefined;
};

export type EntrenarStackParamList = {
  StartWorkout: undefined;
  LiveWorkout: { sessionId: string; sessionName: string; routine?: Routine };
  /**
   * Modo celebración: llega con `summary` recién calculado por el servidor.
   * Modo lectura (historial): llega solo con `sessionId` y carga la sesión.
   */
  WorkoutSummary: { summary?: FinishSummary; sessionName?: string; sessionId?: string };
  History: undefined;
};

export type RutinasStackParamList = {
  Routines: undefined;
  RoutineEdit: { routine?: Routine } | undefined;
  Exercises: undefined;
  ExerciseEdit: { exercise?: Exercise } | undefined;
};

export type CuerpoStackParamList = {
  Body: undefined;
  Recovery: undefined;
};

export type MasStackParamList = {
  More: undefined;
  Gyms: undefined;
  GymEdit: { gym?: Gym } | undefined;
  Nutrition: undefined;
  MealEdit: { meal?: MealPrep; duplicateFrom?: MealPrep } | undefined;
  Tools: undefined;
  Settings: undefined;
};
