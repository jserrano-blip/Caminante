import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  dots,
  epley1RM,
  formatWeight,
  fromDisplayWeight,
  kgToLb,
  lbToKg,
  rmAtReps,
  roundTo,
  roundToStep,
  toDisplayWeight,
  wilks,
} from '../src/lib/formulas';

test('epley1RM: 100kg x 1 = 100', () => {
  assert.equal(epley1RM(100, 1), 100);
});

test('epley1RM: 100kg x 5 = 116.67 aprox', () => {
  assert.ok(Math.abs(epley1RM(100, 5) - 116.6667) < 0.001);
});

test('epley1RM: 0 o negativos devuelven 0', () => {
  assert.equal(epley1RM(0, 5), 0);
  assert.equal(epley1RM(100, 0), 0);
  assert.equal(epley1RM(-10, 5), 0);
});

test('rmAtReps es la inversa de epley1RM', () => {
  const oneRm = epley1RM(100, 5);
  assert.ok(Math.abs(rmAtReps(oneRm, 5) - 100) < 1e-9);
  assert.equal(rmAtReps(120, 1), 120);
});

test('rmAtReps: tabla 1/3/5RM desde 1RM de 120', () => {
  assert.equal(rmAtReps(120, 1), 120);
  assert.ok(Math.abs(rmAtReps(120, 3) - 109.0909) < 0.001);
  assert.ok(Math.abs(rmAtReps(120, 5) - 102.8571) < 0.001);
});

test('kgToLb / lbToKg redondean ida y vuelta', () => {
  assert.ok(Math.abs(kgToLb(100) - 220.4623) < 0.001);
  assert.ok(Math.abs(lbToKg(225) - 102.0583) < 0.001);
  assert.ok(Math.abs(lbToKg(kgToLb(82.5)) - 82.5) < 1e-9);
});

test('roundToStep: redondeo a 2.5', () => {
  assert.equal(roundToStep(78.9), 80);
  assert.equal(roundToStep(77.4), 77.5);
  assert.equal(roundToStep(76.2), 75);
  assert.equal(roundToStep(76.3), 77.5);
  assert.equal(roundToStep(76.2, 5), 75);
});

test('roundTo: decimales de presentación', () => {
  assert.equal(roundTo(12.345, 1), 12.3);
  assert.equal(roundTo(12.35, 1), 12.4);
});

test('toDisplayWeight / fromDisplayWeight respetan la unidad', () => {
  assert.equal(toDisplayWeight(100, 'KG'), 100);
  assert.equal(toDisplayWeight(100, 'LB'), 220.5);
  assert.equal(fromDisplayWeight(100, 'KG'), 100);
  assert.ok(Math.abs(fromDisplayWeight(220.46, 'LB') - 100) < 0.01);
});

test('formatWeight', () => {
  assert.equal(formatWeight(82.5, 'KG'), '82.5 kg');
  assert.equal(formatWeight(100, 'LB'), '220.5 lb');
});

test('wilks 2020: hombre de 80kg con total 500kg ronda 405-415', () => {
  const score = wilks('M', 80, 500);
  assert.ok(score > 400 && score < 420, `score=${score}`);
});

test('wilks 2020: mujer de 60kg con total 300kg ronda 390-400', () => {
  const score = wilks('F', 60, 300);
  assert.ok(score > 385 && score < 405, `score=${score}`);
});

test('wilks: entradas inválidas dan 0', () => {
  assert.equal(wilks('M', 0, 500), 0);
  assert.equal(wilks('M', 80, 0), 0);
});

test('dots: hombre de 80kg con total 500kg ronda 330-350', () => {
  const score = dots('M', 80, 500);
  assert.ok(score > 325 && score < 355, `score=${score}`);
});

test('dots: a igual total, más peso corporal da menos puntos', () => {
  assert.ok(dots('M', 70, 400) > dots('M', 100, 400));
  assert.ok(wilks('F', 55, 250) > wilks('F', 80, 250));
});
