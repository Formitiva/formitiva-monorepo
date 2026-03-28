import { describe, it, expect } from 'vitest';
import { isDefinitionPropertyField, isFormitivaDefinition } from './definitionSerializers';

// ─── isDefinitionPropertyField ────────────────────────────────────────────────

describe('isDefinitionPropertyField', () => {
  it('returns true for a valid property field object', () => {
    expect(isDefinitionPropertyField({ name: 'email', displayName: 'Email', type: 'email' })).toBe(true);
  });

  it('returns false when name is missing', () => {
    expect(isDefinitionPropertyField({ displayName: 'Email', type: 'email' })).toBe(false);
  });

  it('returns false when displayName is missing', () => {
    expect(isDefinitionPropertyField({ name: 'email', type: 'email' })).toBe(false);
  });

  it('returns false when name is not a string', () => {
    expect(isDefinitionPropertyField({ name: 42, displayName: 'Email', type: 'email' })).toBe(false);
  });

  it('returns false for null', () => {
    expect(isDefinitionPropertyField(null)).toBe(false);
  });

  it('returns false for a primitive', () => {
    expect(isDefinitionPropertyField('string')).toBe(false);
    expect(isDefinitionPropertyField(123)).toBe(false);
  });
});

// ─── isFormitivaDefinition ────────────────────────────────────────────────────

describe('isFormitivaDefinition', () => {
  it('returns true for a valid definition', () => {
    expect(isFormitivaDefinition({
      name: 'Form',
      version: '1.0.0',
      properties: [{ name: 'f', displayName: 'F', type: 'text' }],
    })).toBe(true);
  });

  it('returns true for a definition with empty properties', () => {
    expect(isFormitivaDefinition({ name: 'Form', version: '1.0.0', properties: [] })).toBe(true);
  });

  it('returns false when name is missing', () => {
    expect(isFormitivaDefinition({ version: '1.0.0', properties: [] })).toBe(false);
  });

  it('returns false when version is missing', () => {
    expect(isFormitivaDefinition({ name: 'Form', properties: [] })).toBe(false);
  });

  it('returns false when properties is not an array', () => {
    expect(isFormitivaDefinition({ name: 'Form', version: '1.0.0', properties: {} })).toBe(false);
  });

  it('returns false when a property is invalid', () => {
    expect(isFormitivaDefinition({
      name: 'Form', version: '1.0.0',
      properties: [{ type: 'text' }], // missing name and displayName
    })).toBe(false);
  });

  it('returns false for null', () => {
    expect(isFormitivaDefinition(null)).toBe(false);
  });
});
