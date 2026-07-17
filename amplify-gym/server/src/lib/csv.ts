// Generación de CSV compatible con Excel: BOM UTF-8, separador coma,
// escapado RFC 4180 (comillas dobles duplicadas).

export const UTF8_BOM = '\uFEFF';

export type CsvValue = string | number | boolean | null | undefined;

/** Escapa un valor individual para CSV. null/undefined → celda vacía. */
export function escapeCsvValue(value: CsvValue): string {
  if (value === null || value === undefined) return '';
  let s: string;
  if (typeof value === 'boolean') s = value ? 'true' : 'false';
  else s = String(value);
  if (/[",\r\n]/.test(s)) {
    s = '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

/** Construye un cuerpo CSV (sin BOM) a partir de header + filas. */
export function buildCsv(header: string[], rows: CsvValue[][]): string {
  const lines = [header.map(escapeCsvValue).join(',')];
  for (const row of rows) {
    lines.push(row.map(escapeCsvValue).join(','));
  }
  return lines.join('\r\n');
}

/** CSV completo con BOM UTF-8 listo para enviar como text/csv. */
export function buildCsvWithBom(header: string[], rows: CsvValue[][]): string {
  return UTF8_BOM + buildCsv(header, rows);
}
