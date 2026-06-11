import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatePlates, STANDARD_PLATES } from '../src/lib/plateCalculator';

test('100kg con barra de 20: 1×25 + 1×15 por lado (con stock estándar)', () => {
  const r = calculatePlates(100, 20, STANDARD_PLATES);
  assert.equal(r.achievedKg, 100);
  assert.equal(r.residualKg, 0);
  const total = r.perSide.reduce((s, p) => s + p.weightKg * p.qty, 0);
  assert.equal(total, 40); // 40 por lado
  assert.equal(r.perSide[0]?.weightKg, 25);
});

test('objetivo igual o menor que la barra: sin discos', () => {
  const r = calculatePlates(20, 20, STANDARD_PLATES);
  assert.deepEqual(r.perSide, []);
  assert.equal(r.achievedKg, 20);
  const r2 = calculatePlates(15, 20, STANDARD_PLATES);
  assert.deepEqual(r2.perSide, []);
});

test('respeta el stock disponible (count = pares)', () => {
  const plates = [{ weightKg: 20, count: 1 }, { weightKg: 10, count: 2 }];
  // 100kg → 40 por lado, pero solo hay 1 disco de 20 y 2 de 10 por lado → 20+10+10 = 40 ✓
  const r = calculatePlates(100, 20, plates);
  assert.equal(r.achievedKg, 100);
  assert.deepEqual(r.perSide, [
    { weightKg: 20, qty: 1 },
    { weightKg: 10, qty: 2 },
  ]);
});

test('residual cuando no se puede alcanzar el objetivo', () => {
  const plates = [{ weightKg: 10, count: 1 }];
  const r = calculatePlates(100, 20, plates); // solo 10 por lado → 40 total
  assert.equal(r.achievedKg, 40);
  assert.equal(r.residualKg, 60);
});

test('pesos fraccionarios: 102.5kg usa el disco de 1.25', () => {
  const r = calculatePlates(102.5, 20, STANDARD_PLATES);
  assert.equal(r.achievedKg, 102.5);
  assert.ok(r.perSide.some((p) => p.weightKg === 1.25 && p.qty === 1));
});

test('greedy de mayor a menor: 60kg → 1×20 por lado', () => {
  const r = calculatePlates(60, 20, STANDARD_PLATES);
  assert.equal(r.achievedKg, 60);
  assert.deepEqual(r.perSide, [{ weightKg: 20, qty: 1 }]);
});

test('ignora discos con peso o stock inválido', () => {
  const plates = [
    { weightKg: 0, count: 5 },
    { weightKg: 20, count: 0 },
    { weightKg: 10, count: 4 },
  ];
  const r = calculatePlates(100, 20, plates);
  assert.deepEqual(r.perSide, [{ weightKg: 10, qty: 4 }]);
  assert.equal(r.achievedKg, 100);
});

test('no muta el arreglo de entrada', () => {
  const plates = [
    { weightKg: 5, count: 2 },
    { weightKg: 25, count: 2 },
  ];
  const copy = JSON.parse(JSON.stringify(plates));
  calculatePlates(120, 20, plates);
  assert.deepEqual(plates, copy);
});
