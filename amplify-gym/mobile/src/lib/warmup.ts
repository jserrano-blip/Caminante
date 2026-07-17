// Generador de series de aproximación (calentamiento). Puro y testeable.
import { roundToStep } from './formulas';
import { calculatePlates, type PlateStock } from './plateCalculator';

export interface WarmupSet {
  weightKg: number;
  reps: number;
  /** Etiqueta amable: "Barra", "40%", etc. */
  label: string;
}

const SCHEME: { pct: number; reps: number; label: string }[] = [
  { pct: 0.4, reps: 8, label: '40%' },
  { pct: 0.6, reps: 5, label: '60%' },
  { pct: 0.8, reps: 3, label: '80%' },
  { pct: 0.9, reps: 1, label: '90%' },
];

/**
 * Genera la aproximación: barra×10, 40%×8, 60%×5, 80%×3, 90%×1.
 * Redondea cada paso a `roundStep` (2.5 kg por defecto) o, si se pasan los
 * discos disponibles, al peso realmente alcanzable con esos discos.
 * Omite los pasos cuyo peso quede por debajo (o igual) del peso de la barra.
 */
export function generateWarmup(
  workingWeightKg: number,
  barKg = 20,
  options?: { roundStep?: number; plates?: PlateStock[] }
): WarmupSet[] {
  if (workingWeightKg <= 0 || barKg < 0) return [];
  const roundStep = options?.roundStep ?? 2.5;
  const plates = options?.plates;

  const sets: WarmupSet[] = [{ weightKg: barKg, reps: 10, label: 'Barra' }];

  for (const step of SCHEME) {
    const raw = workingWeightKg * step.pct;
    let weight: number;
    if (plates && plates.length > 0) {
      weight = calculatePlates(raw, barKg, plates).achievedKg;
    } else {
      weight = roundToStep(raw, roundStep);
    }
    // omite pasos que no superan la barra y pasos que igualan o superan el peso de trabajo
    if (weight <= barKg + 1e-9) continue;
    if (weight >= workingWeightKg - 1e-9) continue;
    sets.push({ weightKg: weight, reps: step.reps, label: step.label });
  }

  return sets;
}
