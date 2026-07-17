// Calculadora de discos por lado de la barra. Pura y testeable.

export interface PlateStock {
  /** Peso de un disco en kg. */
  weightKg: number;
  /** Pares disponibles (un disco por lado de la barra). */
  count: number;
}

export interface PlateResultItem {
  weightKg: number;
  /** Cantidad de discos de este peso POR LADO. */
  qty: number;
}

export interface PlateResult {
  perSide: PlateResultItem[];
  /** Peso total realmente cargado (barra + discos de ambos lados). */
  achievedKg: number;
  /** Diferencia targetKg - achievedKg (>= 0 cuando no se alcanza el objetivo). */
  residualKg: number;
}

/** Discos estándar de fallback cuando el gimnasio no tiene inventario. */
export const STANDARD_PLATES: PlateStock[] = [
  { weightKg: 25, count: 4 },
  { weightKg: 20, count: 4 },
  { weightKg: 15, count: 2 },
  { weightKg: 10, count: 2 },
  { weightKg: 5, count: 2 },
  { weightKg: 2.5, count: 2 },
  { weightKg: 1.25, count: 2 },
];

const EPS = 1e-9;

/**
 * Calcula los discos por lado para alcanzar `targetKg` con una barra de `barKg`
 * usando los discos disponibles (count = pares). Estrategia voraz de mayor a menor.
 */
export function calculatePlates(
  targetKg: number,
  barKg: number,
  plates: PlateStock[]
): PlateResult {
  const perSide: PlateResultItem[] = [];
  if (targetKg <= barKg + EPS || barKg < 0) {
    return { perSide, achievedKg: barKg, residualKg: Math.max(0, round3(targetKg - barKg)) };
  }

  let remainingPerSide = (targetKg - barKg) / 2;
  const sorted = plates
    .filter((p) => p.weightKg > 0 && p.count > 0)
    .slice()
    .sort((a, b) => b.weightKg - a.weightKg);

  for (const plate of sorted) {
    if (remainingPerSide < plate.weightKg - EPS) continue;
    const qty = Math.min(Math.floor((remainingPerSide + EPS) / plate.weightKg), plate.count);
    if (qty > 0) {
      const existing = perSide.find((p) => p.weightKg === plate.weightKg);
      if (existing) existing.qty += qty;
      else perSide.push({ weightKg: plate.weightKg, qty });
      remainingPerSide -= qty * plate.weightKg;
    }
  }

  const loadedPerSide = perSide.reduce((sum, p) => sum + p.weightKg * p.qty, 0);
  const achievedKg = round3(barKg + 2 * loadedPerSide);
  const residualKg = round3(targetKg - achievedKg);
  return { perSide, achievedKg, residualKg };
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
