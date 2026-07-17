/** Normaliza para búsqueda: minúsculas y sin diacríticos ("Máquina" → "maquina"). */
export function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}
