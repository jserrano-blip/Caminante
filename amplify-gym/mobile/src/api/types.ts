// Tipos espejo de server/prisma/schema.prisma y docs/API.md.
// El peso SIEMPRE viaja en kg a la API.

export type WeightUnit = 'KG' | 'LB';
export type Sex = 'M' | 'F';

export interface User {
  id: string;
  name: string;
  avatarColor: string;
  weightUnit: WeightUnit;
  sex: Sex;
  createdAt: string;
}

export type EquipmentType = 'BARBELL' | 'PLATE' | 'DUMBBELL' | 'MACHINE';

export interface EquipmentItem {
  id: string;
  gymId: string;
  type: EquipmentType;
  name: string | null;
  weightKg: number | null;
  count: number | null;
  stackStepKg: number | null;
  stackMaxKg: number | null;
}

export interface EquipmentItemInput {
  type: EquipmentType;
  name?: string;
  weightKg?: number;
  count?: number;
  stackStepKg?: number;
  stackMaxKg?: number;
}

export interface Gym {
  id: string;
  userId: string;
  name: string;
  notes: string | null;
  createdAt: string;
  equipment?: EquipmentItem[];
}

export type MuscleGroup =
  | 'PECHO'
  | 'ESPALDA'
  | 'PIERNA'
  | 'HOMBRO'
  | 'BRAZO'
  | 'CORE'
  | 'OTRO';

export type ExerciseCategory =
  | 'BARBELL'
  | 'DUMBBELL'
  | 'MACHINE'
  | 'CABLE'
  | 'BODYWEIGHT';

export interface Exercise {
  id: string;
  userId: string | null;
  name: string;
  muscleGroup: MuscleGroup;
  category: ExerciseCategory;
  variantOfId: string | null;
  notes: string | null;
  isPowerlift: boolean;
  variants?: Exercise[];
}

export interface RoutineExercise {
  id: string;
  routineId: string;
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: string;
  targetRpe: number | null;
  restSeconds: number;
  exercise: Exercise;
}

export interface Routine {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: string;
  exercises: RoutineExercise[];
}

export interface RoutineExerciseInput {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: string;
  targetRpe?: number;
  restSeconds: number;
}

export interface RoutineInput {
  userId: string;
  name: string;
  description?: string;
  exercises: RoutineExerciseInput[];
}

export interface WorkoutSet {
  id: string;
  sessionId: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  unit: WeightUnit;
  rpe: number | null;
  rir: number | null;
  isWarmup: boolean;
  completedAt: string;
  exercise?: Exercise;
}

export interface WorkoutSetInput {
  exerciseId: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  unit?: WeightUnit;
  rpe?: number;
  rir?: number;
  isWarmup?: boolean;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  gymId: string | null;
  routineId: string | null;
  name: string;
  startedAt: string;
  finishedAt: string | null;
  notes: string | null;
  sets?: WorkoutSet[];
  gym?: Gym | null;
}

export type RecordType = 'WEIGHT' | 'E1RM' | 'VOLUME' | 'REPS';

export interface PersonalRecord {
  id: string;
  userId: string;
  exerciseId: string;
  sessionId: string | null;
  type: RecordType;
  value: number;
  reps: number | null;
  date: string;
  exercise?: Exercise;
}

export interface FinishSummary {
  durationMin: number;
  totalVolumeKg: number;
  totalSets: number;
  newRecords: PersonalRecord[];
}

export interface FinishResponse {
  session: WorkoutSession;
  summary: FinishSummary;
}

export interface SuggestionResponse {
  last: {
    date: string;
    sets: { reps: number; weightKg: number; rpe: number | null }[];
  } | null;
  suggestion: {
    weightKg: number;
    reps: number;
    rationale: string;
  } | null;
}

export interface BodyMetric {
  id: string;
  userId: string;
  date: string;
  weightKg: number;
  heightCm: number | null;
  bodyFatPct: number | null;
}

export interface RelativeStrengthLift {
  exerciseId: string;
  name: string;
  bestE1rmKg: number;
  wilks: number;
  dots: number;
}

export interface RelativeStrengthResponse {
  bodyWeightKg: number;
  sex: Sex;
  lifts: RelativeStrengthLift[];
  totalWilks?: number;
  totalDots?: number;
}

export interface RecoveryLog {
  id: string;
  userId: string;
  date: string;
  sleepHours: number;
  soreness: number;
  fatigue: number;
  notes: string | null;
}

export interface MealPrep {
  id: string;
  userId: string | null;
  name: string;
  servings: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  calories: number;
  cookMinutes: number | null;
  applianceNote: string | null;
  instructions: string | null;
}

export interface MealPrepInput {
  userId: string;
  name: string;
  servings: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  calories: number;
  cookMinutes?: number;
  applianceNote?: string;
  instructions?: string;
}

export interface DashboardResponse {
  weeklyVolume: { weekStart: string; volumeKg: number; sessions: number }[];
  recentRecords: PersonalRecord[];
  bodyWeightTrend: { date: string; weightKg: number }[];
  recoveryTrend: {
    date: string;
    sleepHours: number;
    soreness: number;
    fatigue: number;
  }[];
  lastSession: WorkoutSession | null;
}

export interface StrengthPoint {
  date: string;
  bestSetKg: number;
  e1rmKg: number;
  volumeKg: number;
}

export interface StrengthAnalyticsResponse {
  points: StrengthPoint[];
}

export type ReadinessLevel = 'OK' | 'CUIDADO' | 'DELOAD';

export interface ReadinessResponse {
  hasData: boolean;
  score: number;
  level: ReadinessLevel;
  recommendation: string;
  sleepAvg: number | null;
  sorenessAvg: number | null;
  fatigueAvg: number | null;
  rpeAvg: number | null;
}

export type ExportDataset =
  | 'sets'
  | 'sessions'
  | 'metrics'
  | 'recovery'
  | 'records'
  | 'all';
