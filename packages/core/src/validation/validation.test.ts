import { describe, it, expect, beforeAll } from 'vitest';
import { validateField, validateFieldWithCustomHandler, validateFormValues } from './validation';
import { ensureBuiltinFieldTypeValidatorsRegistered } from './registerBuiltinTypeValidators';
import {
  registerFieldValidator,
  registerFormValidator,
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
  it('returns null when the field has no validatorRef', () => {
    const f: DefinitionPropertyField = { name: 'f', type: 'text', displayName: 'F' } as DefinitionPropertyField;
    expect(validateFieldWithCustomHandler('Form', f, 'val', t)).toBeNull();
  });

  it('calls a registered custom handler by string name', () => {
    registerFieldValidator('FormA', 'noXValidator', (_name, value) =>
      String(value).includes('X') ? 'No X allowed' : undefined,
    );
    const f: DefinitionPropertyField = {
      name: 'f', type: 'text', displayName: 'F', validatorRef: 'noXValidator',
    } as DefinitionPropertyField;
    expect(validateFieldWithCustomHandler('FormA', f, 'hello', t)).toBeNull();
    expect(validateFieldWithCustomHandler('FormA', f, 'helloX', t)).toBe('No X allowed');
  });

  it('calls a registered handler when validatorRef is a single-element array', () => {
    registerFieldValidator('FormB', 'singleArrValidator', (_name, value) =>
      String(value) === 'bad' ? 'Value is bad' : undefined,
    );
    const f: DefinitionPropertyField = {
      name: 'f', type: 'text', displayName: 'F', validatorRef: ['singleArrValidator'],
    } as DefinitionPropertyField;
    expect(validateFieldWithCustomHandler('FormB', f, 'ok', t)).toBeNull();
    expect(validateFieldWithCustomHandler('FormB', f, 'bad', t)).toBe('Value is bad');
  });

  it('calls a handler when validatorRef is a [category, name] tuple', () => {
    registerFieldValidator('CatC', 'tupleValidator', (_name, value) =>
      Number(value) < 0 ? 'Must not be negative' : undefined,
    );
    const f: DefinitionPropertyField = {
      name: 'f', type: 'int', displayName: 'F', validatorRef: ['CatC', 'tupleValidator'],
    } as DefinitionPropertyField;
    expect(validateFieldWithCustomHandler('AnyForm', f, 5, t)).toBeNull();
    expect(validateFieldWithCustomHandler('AnyForm', f, -1, t)).toBe('Must not be negative');
  });

  it('returns null when handler is not found', () => {
    const f: DefinitionPropertyField = {
      name: 'f', type: 'text', displayName: 'F', validatorRef: 'nonExistentHandler',
    } as DefinitionPropertyField;
    expect(validateFieldWithCustomHandler('FormX', f, 'val', t)).toBeNull();
  });

  it('supports legacy field validationHandlerName during migration', () => {
    registerFieldValidator('LegacyForm', 'legacyValidator', (_name, value) =>
      String(value) === 'legacy' ? 'Legacy error' : undefined,
    );
    const f = {
      name: 'f', type: 'text', displayName: 'F', validationHandlerName: 'legacyValidator',
    } as DefinitionPropertyField & { validationHandlerName: string };

    expect(validateFieldWithCustomHandler('LegacyForm', f, 'ok', t)).toBeNull();
    expect(validateFieldWithCustomHandler('LegacyForm', f, 'legacy', t)).toBe('Legacy error');
  });
});

// ─── validateFormValues ───────────────────────────────────────────────────────

describe('validateFormValues', () => {
  it('returns null when definition has no validatorRef', async () => {
    const def: FormitivaDefinition = { name: 'F', version: '1.0.0', displayName: 'F', properties: [] };
    expect(await validateFormValues(def, {}, t)).toBeNull();
  });

  it('returns null when definition is null', async () => {
    expect(await validateFormValues(null, {}, t)).toBeNull();
  });

  it('returns null when no handler is registered for the name', async () => {
    const def: FormitivaDefinition = {
      name: 'F', version: '1.0.0', displayName: 'F', properties: [], validatorRef: 'unregisteredHandler',
    };
    expect(await validateFormValues(def, {}, t)).toBeNull();
  });

  it('runs the registered sync form handler and returns errors', async () => {
    registerFormValidator('syncFormValidator', (_values) => ['Form-level error']);
    const def: FormitivaDefinition = {
      name: 'F', version: '1.0.0', displayName: 'F', properties: [], validatorRef: 'syncFormValidator',
    };
    const result = await validateFormValues(def, {}, t);
    expect(result).toEqual(['Form-level error']);
  });

  it('runs the registered async form handler and returns errors', async () => {
    registerFormValidator('asyncFormValidator', async (_values) => ['Async error']);
    const def: FormitivaDefinition = {
      name: 'F', version: '1.0.0', displayName: 'F', properties: [], validatorRef: 'asyncFormValidator',
    };
    const result = await validateFormValues(def, {}, t);
    expect(result).toEqual(['Async error']);
  });

  it('returns null when form handler returns undefined', async () => {
    registerFormValidator('okFormValidator', () => undefined);
    const def: FormitivaDefinition = {
      name: 'F', version: '1.0.0', displayName: 'F', properties: [], validatorRef: 'okFormValidator',
    };
    expect(await validateFormValues(def, {}, t)).toBeNull();
  });

  it('supports legacy form validationHandlerName during migration', async () => {
    registerFormValidator('legacyFormValidator', () => ['Legacy form error']);
    const def = {
      name: 'F', version: '1.0.0', displayName: 'F', properties: [], validationHandlerName: 'legacyFormValidator',
    } as FormitivaDefinition & { validationHandlerName: string };

    expect(await validateFormValues(def, {}, t)).toEqual(['Legacy form error']);
  });
});
