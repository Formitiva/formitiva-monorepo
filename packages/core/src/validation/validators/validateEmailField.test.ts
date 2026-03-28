import { describe, it, expect } from 'vitest';
import { validateEmailField } from './validateEmailField';
import type { DefinitionPropertyField, TranslationFunction } from '../../core/formitivaTypes';

const t: TranslationFunction = (text) => text;

const field = (overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField =>
  ({ name: 'email', type: 'email', displayName: 'Email', ...overrides } as DefinitionPropertyField);

describe('validateEmailField', () => {
  it('accepts a standard valid email', () => {
    expect(validateEmailField(field(), 'user@example.com', t)).toBeUndefined();
  });

  it('accepts an email with a subdomain', () => {
    expect(validateEmailField(field(), 'user@mail.example.co.uk', t)).toBeUndefined();
  });

  it('accepts an email with plus addressing', () => {
    expect(validateEmailField(field(), 'user+tag@example.com', t)).toBeUndefined();
  });

  it('rejects a string without @', () => {
    expect(validateEmailField(field(), 'notanemail', t)).toBeTruthy();
  });

  it('rejects a string without a domain part', () => {
    expect(validateEmailField(field(), 'user@', t)).toBeTruthy();
  });

  it('rejects a string without a TLD', () => {
    expect(validateEmailField(field(), 'user@domain', t)).toBeTruthy();
  });

  it('returns an error for required empty field', () => {
    expect(validateEmailField(field({ required: true }), '', t)).toBeTruthy();
  });

  it('returns undefined for optional empty field', () => {
    expect(validateEmailField(field({ required: false }), '', t)).toBeUndefined();
  });

  it('validates pattern in addition to email format', () => {
    const f = field({ pattern: '@example\\.com$' });
    expect(validateEmailField(f, 'user@other.com', t)).toBeTruthy();
    expect(validateEmailField(f, 'user@example.com', t)).toBeUndefined();
  });
});
