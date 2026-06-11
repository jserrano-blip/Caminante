// Fórmulas PURAS y testeables. Sin dependencias de React Native.

export const KG_PER_LB = 0.45359237;

/** 1RM estimado con fórmula de Epley: w * (1 + reps/30). Para reps=1 devuelve el peso. */
export function epley1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

/** Peso estimado para N reps a partir de un 1RM (inversa de Epley). */
export function rmAtReps(oneRmKg: number, reps: number): number {
  if (oneRmKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return oneRmKg;
  return oneRmKg / (1 + reps / 30);
}

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}

/** Redondea al múltiplo de `step` más cercano (por defecto 2.5 kg). */
export function roundToStep(value: number, step = 2.5): number {
  if (step <= 0) return value;
  const rounded = Math.round(value / step) * step;
  // corrige errores binarios (p. ej. 0.30000000000000004)
  return Math.round(rounded * 1000) / 1000;
}

/** Redondea hacia abajo al múltiplo de `step`. */
export function floorToStep(value: number, step = 2.5): number {
  if (step <= 0) return value;
  return Math.round(Math.floor(value / step + 1e-9) * step * 1000) / 1000;
}

/** Redondea a N decimales (presentación). */
export function roundTo(value: number, decimals = 1): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

export type Sex = 'M' | 'F';
export type Unit = 'KG' | 'LB';

/** Convierte kg a la unidad de presentación. */
export function toDisplayWeight(kg: number, unit: Unit): number {
  return unit === 'LB' ? roundTo(kgToLb(kg), 1) : roundTo(kg, 1);
}

/** Convierte un valor capturado en la unidad de presentación a kg (lo que viaja a la API). */
export function fromDisplayWeight(value: number, unit: Unit): number {
  return unit === 'LB' ? roundTo(lbToKg(value), 2) : value;
}

/** Formatea un peso en kg según la unidad: "82.5 kg" / "181.9 lb". */
export function formatWeight(kg: number, unit: Unit): string {
  return `${toDisplayWeight(kg, unit)} ${unit === 'LB' ? 'lb' : 'kg'}`;
}

// ── Wilks (coeficientes 2020) ────────────────────────────────────────────────
const WILKS2020 = {
  M: [47.4617885411949, 8.47206137941125, 0.073694103462609, -0.00139583381094385, 7.07665973070743e-6, -1.20804336482315e-8],
  F: [-125.425539779509, 13.7121941940668, -0.0330725063103405, -0.0010504000506583, 9.38773881462799e-6, -2.3334613884954e-8],
} as const;

/** Puntos Wilks (versión 2020, factor 600). */
export function wilks(sex: Sex, bodyWeightKg: number, liftedKg: number): number {
  if (bodyWeightKg <= 0 || liftedKg <= 0) return 0;
  const c = WILKS2020[sex];
  const x = bodyWeightKg;
  const denom = c[0] + c[1] * x + c[2] * x ** 2 + c[3] * x ** 3 + c[4] * x ** 4 + c[5] * x ** 5;
  if (denom === 0) return 0;
  return roundTo(liftedKg * (600 / denom), 2);
}

// ── DOTS ─────────────────────────────────────────────────────────────────────
const DOTS = {
  M: [-307.75076, 24.0900756, -0.1918759221, 0.0007391293, -0.000001093],
  F: [-57.96288, 13.6175032, -0.1126655495, 0.0005158568, -0.0000010706],
} as const;

/** Puntos DOTS estándar (factor 500). */
export function dots(sex: Sex, bodyWeightKg: number, liftedKg: number): number {
  if (bodyWeightKg <= 0 || liftedKg <= 0) return 0;
  const c = DOTS[sex];
  const x = bodyWeightKg;
  const denom = c[0] + c[1] * x + c[2] * x ** 2 + c[3] * x ** 3 + c[4] * x ** 4;
  if (denom === 0) return 0;
  return roundTo(liftedKg * (500 / denom), 2);
}
