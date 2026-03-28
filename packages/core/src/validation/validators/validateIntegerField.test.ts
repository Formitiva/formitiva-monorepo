import { describe, it, expect } from 'vitest';
import { validateIntegerField, validateIntegerArrayField } from './validateIntegerField';
import type { DefinitionPropertyField, TranslationFunction } from '../../core/formitivaTypes';

const t: TranslationFunction = (text, ...args) =>
  text.replace(/\{\{(\d+)\}\}/g, (_, i) => String((args as unknown[])[parseInt(i, 10) - 1] ?? _));

const field = (overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField =>
  ({ name: 'n', type: 'int', displayName: 'N', ...overrides } as DefinitionPropertyField);

describe('validateIntegerField', () => {
  it('accepts a valid integer string', () => {
    expect(validateIntegerField(field(), '42', t)).toBeUndefined();
  });

  it('accepts a negative integer', () => {
    expect(validateIntegerField(field(), '-5', t)).toBeUndefined();
  });

  it('accepts zero', () => {
    expect(validateIntegerField(field(), '0', t)).toBeUndefined();
  });

  it('rejects a float string', () => {
    expect(validateIntegerField(field(), '3.14', t)).toBeTruthy();
  });

  it('rejects non-numeric text', () => {
    expect(validateIntegerField(field(), 'abc', t)).toBeTruthy();
  });

  it('returns undefined for optional empty field with no constraints', () => {
    expect(validateIntegerField(field({ required: false }), '', t)).toBeUndefined();
  });

  it('returns an error for required empty field', () => {
    expect(validateIntegerField(field({ required: true }), '', t)).toBeTruthy();
  });

  it('returns an error for empty field when min is set', () => {
    expect(validateIntegerField(field({ min: 1 }), '', t)).toBeTruthy();
  });

  it('returns an error for empty field when max is set', () => {
    expect(validateIntegerField(field({ max: 10 }), '', t)).toBeTruthy();
  });

  it('rejects value <= min when minInclusive is false (exclusive)', () => {
    const f = field({ min: 10, minInclusive: false });
    expect(validateIntegerField(f, '10', t)).toBeTruthy();
    expect(validateIntegerField(f, '11', t)).toBeUndefined();
  });

  it('accepts value == min when minInclusive is true (inclusive)', () => {
    const f = field({ min: 10, minInclusive: true });
    expect(validateIntegerField(f, '10', t)).toBeUndefined();
    expect(validateIntegerField(f, '9', t)).toBeTruthy();
  });

  it('rejects value >= max when maxInclusive is false (exclusive by default)', () => {
    const f = field({ max: 100 });
    expect(validateIntegerField(f, '100', t)).toBeTruthy();
    expect(validateIntegerField(f, '99', t)).toBeUndefined();
  });

  it('accepts value == max when maxInclusive is true', () => {
    const f = field({ max: 100, maxInclusive: true });
    expect(validateIntegerField(f, '100', t)).toBeUndefined();
    expect(validateIntegerField(f, '101', t)).toBeTruthy();
  });

  it('validates step constraint', () => {
    const f = field({ min: 0, step: 5 });
    expect(validateIntegerField(f, '10', t)).toBeUndefined();
    expect(validateIntegerField(f, '7', t)).toBeTruthy();
  });
});

describe('validateIntegerArrayField', () => {
  const arrField = (overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField =>
    ({ name: 'arr', type: 'int-array', displayName: 'Arr', ...overrides } as DefinitionPropertyField);

  it('accepts a comma-separated list of integers', () => {
    expect(validateIntegerArrayField(arrField(), '1,2,3', t)).toBeUndefined();
  });

  it('accepts an empty value for an optional field', () => {
    expect(validateIntegerArrayField(arrField({ required: false }), '', t)).toBeUndefined();
  });

  it('returns an error for required empty field', () => {
    expect(validateIntegerArrayField(arrField({ required: true }), '', t)).toBeTruthy();
  });

  it('returns an error when minCount is not met', () => {
    expect(validateIntegerArrayField(arrField({ minCount: 3 }), '1,2', t)).toBeTruthy();
  });

  it('returns an error when maxCount is exceeded', () => {
    expect(validateIntegerArrayField(arrField({ maxCount: 2 }), '1,2,3', t)).toBeTruthy();
  });

  it('returns an error when a value in the array is not an integer', () => {
    expect(validateIntegerArrayField(arrField(), '1,abc,3', t)).toBeTruthy();
  });
});
