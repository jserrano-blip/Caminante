// Fórmulas de fuerza y conversiones de unidades.
// Todos los pesos internos están en kg.

export const KG_TO_LB = 2.2046226218;

export function kgToLb(kg: number): number {
  return kg * KG_TO_LB;
}

export function lbToKg(lb: number): number {
  return lb / KG_TO_LB;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * 1RM estimado con la fórmula de Epley: w * (1 + reps/30).
 * Devuelve null para series con reps > 12 (la estimación deja de ser fiable)
 * o datos no válidos.
 */
export function epley1RM(weightKg: number, reps: number): number | null {
  if (!Number.isFinite(weightKg) || !Number.isFinite(reps)) return null;
  if (weightKg <= 0 || reps <= 0 || reps > 12) return null;
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

export type Sex = 'M' | 'F';

// ── Wilks 2020 (coeficientes "new Wilks") ────────────────────────────────────
// coef = 600 / (a + b·x + c·x² + d·x³ + e·x⁴ + f·x⁵), x = peso corporal en kg
const WILKS_2020 = {
  M: [
    47.4617885411949,
    8.47206137941125,
    0.073694103462609,
    -0.00139583381094385,
    7.07665973070743e-6,
    -1.20804336482315e-8,
  ],
  F: [
    -125.425539779509,
    13.7121941940668,
    -0.0330725063103405,
    -0.0010504000506583,
    9.38773881462799e-6,
    -2.3334613884954e-8,
  ],
} as const;

// ── DOTS ─────────────────────────────────────────────────────────────────────
// coef = 500 / (a + b·x + c·x² + d·x³ + e·x⁴)
const DOTS = {
  M: [-307.75076, 24.0900756, -0.1918759221, 0.0007391293, -0.000001093],
  F: [-57.96288, 13.6175032, -0.1126655495, 0.0005158568, -0.0000010706],
} as const;

function poly(coeffs: readonly number[], x: number): number {
  let acc = 0;
  for (let i = 0; i < coeffs.length; i++) acc += coeffs[i] * Math.pow(x, i);
  return acc;
}

export function wilksCoefficient(bodyKg: number, sex: Sex): number {
  const c = WILKS_2020[sex] ?? WILKS_2020.M;
  return 600 / poly(c, bodyKg);
}

/** Puntos Wilks (coeficientes 2020) para un peso levantado dado. */
export function wilks(bodyKg: number, liftedKg: number, sex: Sex): number {
  if (!Number.isFinite(bodyKg) || bodyKg <= 0) return 0;
  return liftedKg * wilksCoefficient(bodyKg, sex);
}

export function dotsCoefficient(bodyKg: number, sex: Sex): number {
  const c = DOTS[sex] ?? DOTS.M;
  return 500 / poly(c, bodyKg);
}

/** Puntos DOTS estándar para un peso levantado dado. */
export function dots(bodyKg: number, liftedKg: number, sex: Sex): number {
  if (!Number.isFinite(bodyKg) || bodyKg <= 0) return 0;
  return liftedKg * dotsCoefficient(bodyKg, sex);
}
