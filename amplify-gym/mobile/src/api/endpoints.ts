// Funciones tipadas por recurso, según docs/API.md.
import { del, get, patch, post, put } from './client';
import type {
  BodyMetric,
  DashboardResponse,
  EquipmentItem,
  EquipmentItemInput,
  Exercise,
  FinishResponse,
  Gym,
  MealPrep,
  MealPrepInput,
  PersonalRecord,
  ReadinessResponse,
  RecoveryLog,
  RelativeStrengthResponse,
  Routine,
  RoutineInput,
  Sex,
  StrengthAnalyticsResponse,
  SuggestionResponse,
  User,
  WeightUnit,
  WorkoutSession,
  WorkoutSet,
  WorkoutSetInput,
} from './types';

// ── Usuarios ────────────────────────────────────────────────────────────────
export const listUsers = () => get<User[]>('/users');
export const createUser = (body: {
  name: string;
  avatarColor?: string;
  weightUnit?: WeightUnit;
  sex?: Sex;
}) => post<User>('/users', body);
export const updateUser = (id: string, body: Partial<Pick<User, 'name' | 'avatarColor' | 'weightUnit' | 'sex'>>) =>
  patch<User>(`/users/${id}`, body);
export const deleteUser = (id: string) => del<{ ok: true }>(`/users/${id}`);

// ── Gimnasios y equipo ──────────────────────────────────────────────────────
export const listGyms = (userId: string) => get<Gym[]>(`/gyms?userId=${userId}`);
export const createGym = (body: { userId: string; name: string; notes?: string }) =>
  post<Gym>('/gyms', body);
export const updateGym = (id: string, body: { name?: string; notes?: string }) =>
  patch<Gym>(`/gyms/${id}`, body);
export const deleteGym = (id: string) => del<{ ok: true }>(`/gyms/${id}`);
export const replaceEquipment = (gymId: string, equipment: EquipmentItemInput[]) =>
  put<EquipmentItem[]>(`/gyms/${gymId}/equipment`, { equipment });

// ── Ejercicios ──────────────────────────────────────────────────────────────
export const listExercises = (userId: string) => get<Exercise[]>(`/exercises?userId=${userId}`);
export const createExercise = (body: {
  userId: string;
  name: string;
  muscleGroup: string;
  category: string;
  variantOfId?: string;
  notes?: string;
  isPowerlift?: boolean;
}) => post<Exercise>('/exercises', body);
export const updateExercise = (
  id: string,
  body: Partial<{
    name: string;
    muscleGroup: string;
    category: string;
    variantOfId: string | null;
    notes: string;
    isPowerlift: boolean;
  }>
) => patch<Exercise>(`/exercises/${id}`, body);
export const deleteExercise = (id: string) => del<{ ok: true }>(`/exercises/${id}`);

// ── Rutinas ─────────────────────────────────────────────────────────────────
export const listRoutines = (userId: string) => get<Routine[]>(`/routines?userId=${userId}`);
export const createRoutine = (body: RoutineInput) => post<Routine>('/routines', body);
export const updateRoutine = (id: string, body: RoutineInput) => put<Routine>(`/routines/${id}`, body);
export const deleteRoutine = (id: string) => del<{ ok: true }>(`/routines/${id}`);

// ── Sesiones ────────────────────────────────────────────────────────────────
export const listSessions = (userId: string, limit?: number) =>
  get<WorkoutSession[]>(`/sessions?userId=${userId}${limit ? `&limit=${limit}` : ''}`);
export const getSession = (id: string) => get<WorkoutSession>(`/sessions/${id}`);
export const createSession = (body: {
  userId: string;
  gymId?: string;
  routineId?: string;
  name: string;
}) => post<WorkoutSession>('/sessions', body);
export const updateSession = (id: string, body: { name?: string; notes?: string; gymId?: string }) =>
  patch<WorkoutSession>(`/sessions/${id}`, body);
export const deleteSession = (id: string) => del<{ ok: true }>(`/sessions/${id}`);
export const addSet = (sessionId: string, body: WorkoutSetInput) =>
  post<WorkoutSet>(`/sessions/${sessionId}/sets`, body);
export const updateSet = (setId: string, body: Partial<WorkoutSetInput>) =>
  patch<WorkoutSet>(`/sets/${setId}`, body);
export const deleteSet = (setId: string) => del<{ ok: true }>(`/sets/${setId}`);
export const finishSession = (sessionId: string) =>
  post<FinishResponse>(`/sessions/${sessionId}/finish`);

// ── Sobrecarga progresiva ───────────────────────────────────────────────────
export const getSuggestion = (userId: string, exerciseId: string) =>
  get<SuggestionResponse>(`/suggestions?userId=${userId}&exerciseId=${exerciseId}`);

// ── Récords personales ──────────────────────────────────────────────────────
export const listRecords = (userId: string, exerciseId?: string) =>
  get<PersonalRecord[]>(`/records?userId=${userId}${exerciseId ? `&exerciseId=${exerciseId}` : ''}`);

// ── Métricas corporales ─────────────────────────────────────────────────────
export const listMetrics = (userId: string) => get<BodyMetric[]>(`/metrics?userId=${userId}`);
export const createMetric = (body: {
  userId: string;
  weightKg: number;
  heightCm?: number;
  bodyFatPct?: number;
  date?: string;
}) => post<BodyMetric>('/metrics', body);
export const deleteMetric = (id: string) => del<{ ok: true }>(`/metrics/${id}`);
export const getRelativeStrength = (userId: string) =>
  get<RelativeStrengthResponse>(`/relative-strength?userId=${userId}`);

// ── Recuperación ────────────────────────────────────────────────────────────
export const listRecovery = (userId: string) => get<RecoveryLog[]>(`/recovery?userId=${userId}`);
export const createRecovery = (body: {
  userId: string;
  sleepHours: number;
  soreness: number;
  fatigue: number;
  notes?: string;
  date?: string;
}) => post<RecoveryLog>('/recovery', body);
export const deleteRecovery = (id: string) => del<{ ok: true }>(`/recovery/${id}`);

// ── Meal Prep ───────────────────────────────────────────────────────────────
export const listMeals = (userId: string) => get<MealPrep[]>(`/meals?userId=${userId}`);
export const createMeal = (body: MealPrepInput) => post<MealPrep>('/meals', body);
export const updateMeal = (id: string, body: Partial<MealPrepInput>) =>
  patch<MealPrep>(`/meals/${id}`, body);
export const deleteMeal = (id: string) => del<{ ok: true }>(`/meals/${id}`);

// ── Analítica ───────────────────────────────────────────────────────────────
export const getDashboard = (userId: string) =>
  get<DashboardResponse>(`/analytics/dashboard?userId=${userId}`);
export const getStrengthAnalytics = (userId: string, exerciseId: string) =>
  get<StrengthAnalyticsResponse>(`/analytics/strength?userId=${userId}&exerciseId=${exerciseId}`);

// ── Recuperación inteligente (deload) ───────────────────────────────────────
export const getReadiness = (userId: string) =>
  get<ReadinessResponse>(`/readiness?userId=${userId}`);
