import { describe, it, expect, beforeAll } from 'vitest';
import { validateField, validateFieldWithCustomHandler, validateFormValues } from './validation';
import { ensureBuiltinFieldTypeValidatorsRegistered } from './registerBuiltinTypeValidators';
import {
  registerFieldCustomValidationHandler,
  registerFormValidationHandler,
} from '../core/registries/validationHandlerRegistry';
import type { DefinitionPropertyField, FormitivaDefinition, TranslationFunction } from '../core/formitivaTypes';

const t: TranslationFunction = (text, ...args) =>
  text.replace(/\{\{(\d+)\}\}/g, (_, i) => String((args as unknown[])[parseInt(i, 10) - 1] ?? _));

beforeAll(() => ensureBuiltinFieldTypeValidatorsRegistered());

// ─── validateField ────────────────────────────────────────────────────────────

describe('validateField', () => {
  it('returns null for valid text input', () => {
    const f: DefinitionPropertyField = { name: 'f', type: 'text', displayName: 'F' } as DefinitionPropertyField;
    expect(validateField('Form', f, 'hello', t)).toBeNull();
  });

  it('returns an error for required text field with empty input', () => {
    const f: DefinitionPropertyField = { name: 'f', type: 'text', displayName: 'F', required: true } as DefinitionPropertyField;
    expect(validateField('Form', f, '', t)).toBeTruthy();
  });

  it('returns null for valid email', () => {
    const f: DefinitionPropertyField = { name: 'e', type: 'email', displayName: 'E' } as DefinitionPropertyField;
    expect(validateField('Form', f, 'user@example.com', t)).toBeNull();
  });

  it('returns an error for invalid email', () => {
    const f: DefinitionPropertyField = { name: 'e', type: 'email', displayName: 'E' } as DefinitionPropertyField;
    expect(validateField('Form', f, 'not-an-email', t)).toBeTruthy();
  });

  it('returns null for valid integer', () => {
    const f: DefinitionPropertyField = { name: 'n', type: 'int', displayName: 'N' } as DefinitionPropertyField;
    expect(validateField('Form', f, '42', t)).toBeNull();
  });

  it('uses required-only fallback for unknown field types', () => {
    const f: DefinitionPropertyField = { name: 'x', type: 'custom-unknown', displayName: 'X', required: true } as DefinitionPropertyField;
    expect(validateField('Form', f, '', t)).toBeTruthy();
    expect(validateField('Form', f, 'anything', t)).toBeNull();
  });
});

// ─── validateFieldWithCustomHandler ──────────────────────────────────────────

describe('validateFieldWithCustomHandler', () => {
  it('returns null when the field has no validationHandlerName', () => {
    const f: DefinitionPropertyField = { name: 'f', type: 'text', displayName: 'F' } as DefinitionPropertyField;
    expect(validateFieldWithCustomHandler('Form', f, 'val', t)).toBeNull();
  });

  it('calls a registered custom handler by string name', () => {
    registerFieldCustomValidationHandler('FormA', 'noXValidator', (_name, value) =>
      String(value).includes('X') ? 'No X allowed' : undefined,
    );
    const f: DefinitionPropertyField = {
      name: 'f', type: 'text', displayName: 'F', validationHandlerName: 'noXValidator',
    } as DefinitionPropertyField;
    expect(validateFieldWithCustomHandler('FormA', f, 'hello', t)).toBeNull();
    expect(validateFieldWithCustomHandler('FormA', f, 'helloX', t)).toBe('No X allowed');
  });

  it('calls a registered handler when validationHandlerName is a single-element array', () => {
    registerFieldCustomValidationHandler('FormB', 'singleArrValidator', (_name, value) =>
      String(value) === 'bad' ? 'Value is bad' : undefined,
    );
    const f: DefinitionPropertyField = {
      name: 'f', type: 'text', displayName: 'F', validationHandlerName: ['singleArrValidator'],
    } as DefinitionPropertyField;
    expect(validateFieldWithCustomHandler('FormB', f, 'ok', t)).toBeNull();
    expect(validateFieldWithCustomHandler('FormB', f, 'bad', t)).toBe('Value is bad');
  });

  it('calls a handler when validationHandlerName is a [category, name] tuple', () => {
    registerFieldCustomValidationHandler('CatC', 'tupleValidator', (_name, value) =>
      Number(value) < 0 ? 'Must not be negative' : undefined,
    );
    const f: DefinitionPropertyField = {
      name: 'f', type: 'int', displayName: 'F', validationHandlerName: ['CatC', 'tupleValidator'],
    } as DefinitionPropertyField;
    expect(validateFieldWithCustomHandler('AnyForm', f, 5, t)).toBeNull();
    expect(validateFieldWithCustomHandler('AnyForm', f, -1, t)).toBe('Must not be negative');
  });

  it('returns null when handler is not found', () => {
    const f: DefinitionPropertyField = {
      name: 'f', type: 'text', displayName: 'F', validationHandlerName: 'nonExistentHandler',
    } as DefinitionPropertyField;
    expect(validateFieldWithCustomHandler('FormX', f, 'val', t)).toBeNull();
  });
});

// ─── validateFormValues ───────────────────────────────────────────────────────

describe('validateFormValues', () => {
  it('returns null when definition has no validationHandlerName', async () => {
    const def: FormitivaDefinition = { name: 'F', version: '1.0.0', properties: [] };
    expect(await validateFormValues(def, {}, t)).toBeNull();
  });

  it('returns null when definition is null', async () => {
    expect(await validateFormValues(null, {}, t)).toBeNull();
  });

  it('returns null when no handler is registered for the name', async () => {
    const def: FormitivaDefinition = {
      name: 'F', version: '1.0.0', properties: [], validationHandlerName: 'unregisteredHandler',
    };
    expect(await validateFormValues(def, {}, t)).toBeNull();
  });

  it('runs the registered sync form handler and returns errors', async () => {
    registerFormValidationHandler('syncFormValidator', (_values) => ['Form-level error']);
    const def: FormitivaDefinition = {
      name: 'F', version: '1.0.0', properties: [], validationHandlerName: 'syncFormValidator',
    };
    const result = await validateFormValues(def, {}, t);
    expect(result).toEqual(['Form-level error']);
  });

  it('runs the registered async form handler and returns errors', async () => {
    registerFormValidationHandler('asyncFormValidator', async (_values) => ['Async error']);
    const def: FormitivaDefinition = {
      name: 'F', version: '1.0.0', properties: [], validationHandlerName: 'asyncFormValidator',
    };
    const result = await validateFormValues(def, {}, t);
    expect(result).toEqual(['Async error']);
  });

  it('returns null when form handler returns undefined', async () => {
    registerFormValidationHandler('okFormValidator', () => undefined);
    const def: FormitivaDefinition = {
      name: 'F', version: '1.0.0', properties: [], validationHandlerName: 'okFormValidator',
    };
    expect(await validateFormValues(def, {}, t)).toBeNull();
  });
});
