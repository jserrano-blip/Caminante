import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateWarmup } from '../src/lib/warmup';

test('100kg con barra de 20: barra×10, 40×8, 60×5, 80×3, 90×1', () => {
  const sets = generateWarmup(100, 20);
  assert.deepEqual(
    sets.map((s) => [s.weightKg, s.reps]),
    [
      [20, 10],
      [40, 8],
      [60, 5],
      [80, 3],
      [90, 1],
    ]
  );
  assert.equal(sets[0]?.label, 'Barra');
});

test('omite pasos que no superan la barra', () => {
  // 40% de 45 = 18 < barra de 20 → se omite
  const sets = generateWarmup(45, 20);
  assert.equal(sets[0]?.weightKg, 20);
  assert.ok(sets.every((s) => s.weightKg >= 20));
  assert.ok(!sets.some((s) => s.label === '40%'));
});

test('omite pasos que igualan o superan el peso de trabajo', () => {
  const sets = generateWarmup(25, 20);
  // 90% de 25 = 22.5 ok; 40%/60%/80% quedan <= barra
  assert.ok(sets.every((s) => s.weightKg < 25));
});

test('redondea a 2.5 por defecto', () => {
  const sets = generateWarmup(103, 20);
  for (const s of sets.slice(1)) {
    const mod = Math.round((s.weightKg % 2.5) * 1000) / 1000;
    assert.ok(mod === 0 || mod === 2.5, `peso ${s.weightKg} no es múltiplo de 2.5`);
  }
});

test('con discos disponibles redondea a cargas alcanzables', () => {
  // solo discos de 10: cargas posibles 20, 40, 60, 80, 100...
  const sets = generateWarmup(100, 20, { plates: [{ weightKg: 10, count: 10 }] });
  assert.deepEqual(
    sets.map((s) => s.weightKg),
    [20, 40, 60, 80, 80].slice(0, sets.length)
  );
  // el 90% (90kg) baja a 80 por discos disponibles
  assert.ok(sets.every((s) => (s.weightKg - 20) % 20 === 0));
});

test('peso de trabajo inválido devuelve vacío', () => {
  assert.deepEqual(generateWarmup(0, 20), []);
  assert.deepEqual(generateWarmup(-50, 20), []);
});

test('barra de 0 (mancuernas/máquina): incluye pasos relativos', () => {
  const sets = generateWarmup(50, 0);
  // primer paso es "barra" con 0 kg... se incluye como base
  assert.equal(sets[0]?.weightKg, 0);
  assert.ok(sets.some((s) => s.label === '40%'));
});
