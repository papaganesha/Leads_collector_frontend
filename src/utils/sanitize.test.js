import test from 'node:test';
import assert from 'node:assert';
import { sanitizeCityInput, classifyPhoneType } from './sanitize.js';

test('sanitizeCityInput formats city with UF correctly', () => {
  assert.strictEqual(sanitizeCityInput('sao paulo - sp'), 'Sao Paulo, SP, Brasil');
  assert.strictEqual(sanitizeCityInput('rio de janeiro, RJ'), 'Rio De Janeiro, RJ, Brasil');
});

test('sanitizeCityInput formats city without UF correctly', () => {
  assert.strictEqual(sanitizeCityInput('curitiba'), 'Curitiba, Brasil');
});

test('sanitizeCityInput handles empty input gracefully', () => {
  assert.strictEqual(sanitizeCityInput(''), '');
  assert.strictEqual(sanitizeCityInput(null), '');
});

test('classifyPhoneType classifies mobile numbers correctly', () => {
  assert.strictEqual(classifyPhoneType('(11) 98765-4321'), 'celular');
  assert.strictEqual(classifyPhoneType('11987654321'), 'celular');
});

test('classifyPhoneType classifies landline numbers correctly', () => {
  assert.strictEqual(classifyPhoneType('(11) 3333-4444'), 'fixo');
  assert.strictEqual(classifyPhoneType('1133334444'), 'fixo');
});

