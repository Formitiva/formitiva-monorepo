import { describe, it, expect } from 'vitest';
import { validateTextField } from './validateTextField';
import type { DefinitionPropertyField, TranslationFunction } from '../../core/formitivaTypes';

const t: TranslationFunction = (text, ...args) =>
  text.replace(/\{\{(\d+)\}\}/g, (_, i) => String((args as unknown[])[parseInt(i, 10) - 1] ?? _));

const field = (overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField =>
  ({ name: 'txt', type: 'text', displayName: 'Text', ...overrides } as DefinitionPropertyField);

describe('validateTextField', () => {
  it('returns undefined for valid non-empty text', () => {
    expect(validateTextField(field(), 'hello', t)).toBeUndefined();
  });

  it('returns undefined for optional empty field', () => {
    expect(validateTextField(field({ required: false }), '', t)).toBeUndefined();
  });

  it('returns an error for required empty field', () => {
    expect(validateTextField(field({ required: true }), '', t)).toBeTruthy();
  });

  it('returns a specific error when minLength is set and field is empty + required', () => {
    const err = validateTextField(field({ required: true, minLength: 3 }), '', t);
    expect(err).toBeTruthy();
  });

  it('returns an error when text is shorter than minLength', () => {
    expect(validateTextField(field({ minLength: 5 }), 'hi', t)).toBeTruthy();
  });

  it('returns undefined when text meets minLength exactly', () => {
    expect(validateTextField(field({ minLength: 5 }), 'hello', t)).toBeUndefined();
  });

  it('returns undefined when text meets minLength and exceeds it', () => {
    expect(validateTextField(field({ minLength: 2 }), 'hello world', t)).toBeUndefined();
  });

  it('returns an error when text exceeds maxLength', () => {
    expect(validateTextField(field({ maxLength: 3 }), 'toolong', t)).toBeTruthy();
  });

  it('returns undefined when text is within maxLength', () => {
    expect(validateTextField(field({ maxLength: 10 }), 'short', t)).toBeUndefined();
  });

  it('returns an error when text does not match pattern', () => {
    expect(validateTextField(field({ pattern: '^[A-Z]+$' }), 'lowercase', t)).toBeTruthy();
  });

  it('returns undefined when text matches pattern', () => {
    expect(validateTextField(field({ pattern: '^[A-Z]+$' }), 'UPPERCASE', t)).toBeUndefined();
  });

  it('preserves spaces (does not trim)', () => {
    // Text fields allow spaces — " ab" is length 3, meets minLength: 3
    expect(validateTextField(field({ minLength: 3 }), ' ab', t)).toBeUndefined();
  });
});
