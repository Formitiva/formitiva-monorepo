import { describe, it, expect } from 'vitest';
import {
  validateDefinitionSchema,
  loadJsonDefinition,
  createInstanceFromDefinition,
  loadInstance,
  upgradeInstanceToLatestDefinition,
} from './formitivaModel';
import type { FormitivaDefinition, FormitivaInstance } from './formitivaTypes';

// ─── validateDefinitionSchema ─────────────────────────────────────────────────

describe('validateDefinitionSchema', () => {
  it('returns null for a minimal valid definition', () => {
    expect(validateDefinitionSchema({ name: 'Form', version: '1.0.0', properties: [] })).toBeNull();
  });

  it('returns null when properties is omitted', () => {
    expect(validateDefinitionSchema({ name: 'Form', version: '1.0.0' } as unknown as FormitivaDefinition)).toBeNull();
  });

  it('returns an error when definition is not an object', () => {
    expect(validateDefinitionSchema(null as unknown as FormitivaDefinition)).not.toBeNull();
    expect(validateDefinitionSchema('string' as unknown as FormitivaDefinition)).not.toBeNull();
  });

  it('returns an error when name is missing', () => {
    expect(validateDefinitionSchema({ version: '1.0.0', properties: [] } as unknown as FormitivaDefinition)).not.toBeNull();
  });

  it('returns an error when name is an empty string', () => {
    expect(validateDefinitionSchema({ name: '', version: '1.0.0', properties: [] })).not.toBeNull();
  });

  it('returns an error when name is whitespace only', () => {
    expect(validateDefinitionSchema({ name: '   ', version: '1.0.0', properties: [] })).not.toBeNull();
  });

  it('returns an error when version is missing', () => {
    expect(validateDefinitionSchema({ name: 'Form', properties: [] } as unknown as FormitivaDefinition)).not.toBeNull();
  });

  it('returns an error when properties is not an array', () => {
    expect(validateDefinitionSchema({ name: 'Form', version: '1.0.0', properties: {} as unknown as [] })).not.toBeNull();
  });

  it('returns an error when a property is missing name', () => {
    expect(validateDefinitionSchema({
      name: 'Form', version: '1.0.0',
      properties: [{ type: 'text' } as unknown as ReturnType<() => FormitivaDefinition['properties'][0]>],
    })).not.toBeNull();
  });

  it('returns an error when a property is missing type', () => {
    expect(validateDefinitionSchema({
      name: 'Form', version: '1.0.0',
      properties: [{ name: 'field1', displayName: 'F' } as unknown as ReturnType<() => FormitivaDefinition['properties'][0]>],
    })).not.toBeNull();
  });

  it('returns an error when a property name is empty', () => {
    expect(validateDefinitionSchema({
      name: 'Form', version: '1.0.0',
      properties: [{ name: ' ', type: 'text', displayName: 'F' }],
    })).not.toBeNull();
  });

  it('returns an error when a property type is empty', () => {
    expect(validateDefinitionSchema({
      name: 'Form', version: '1.0.0',
      properties: [{ name: 'field', type: '  ', displayName: 'F' }],
    })).not.toBeNull();
  });

  it('returns null for valid properties array', () => {
    expect(validateDefinitionSchema({
      name: 'Form', version: '1.0.0',
      properties: [{ name: 'firstName', type: 'text', displayName: 'First Name' }],
    })).toBeNull();
  });
});

// ─── loadJsonDefinition ───────────────────────────────────────────────────────

describe('loadJsonDefinition', () => {
  it('loads a valid definition JSON', async () => {
    const json = JSON.stringify({ name: 'Form', version: '1.0.0', properties: [] });
    const result = await loadJsonDefinition(json);
    expect(result.success).toBe(true);
    expect(result.definition?.name).toBe('Form');
    expect(result.definition?.version).toBe('1.0.0');
  });

  it('fails on invalid JSON', async () => {
    const result = await loadJsonDefinition('{ not: valid json }');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Invalid JSON/i);
  });

  it('fails on empty string', async () => {
    const result = await loadJsonDefinition('   ');
    expect(result.success).toBe(false);
  });

  it('fails on null/undefined input', async () => {
    const result = await loadJsonDefinition(null as unknown as string);
    expect(result.success).toBe(false);
  });

  it('fails schema validation when schema is invalid', async () => {
    const json = JSON.stringify({ name: '', version: '1.0.0', properties: [] });
    const result = await loadJsonDefinition(json);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Schema validation failed/i);
  });

  it('skips schema validation when validateSchema is false', async () => {
    const json = JSON.stringify({ name: '', version: '1.0.0', properties: [] });
    const result = await loadJsonDefinition(json, { validateSchema: false });
    expect(result.success).toBe(true);
  });

  it('loads definition with valid properties', async () => {
    const json = JSON.stringify({
      name: 'Form', version: '2.0.0',
      properties: [{ name: 'email', type: 'email', displayName: 'Email' }],
    });
    const result = await loadJsonDefinition(json);
    expect(result.success).toBe(true);
    expect(result.definition?.properties).toHaveLength(1);
  });
});

// ─── createInstanceFromDefinition ─────────────────────────────────────────────

describe('createInstanceFromDefinition', () => {
  it('creates an instance with correct metadata', () => {
    const def: FormitivaDefinition = { name: 'Form', version: '1.0.0', properties: [] };
    const result = createInstanceFromDefinition(def, 'my-instance');
    expect(result.success).toBe(true);
    expect(result.instance?.name).toBe('my-instance');
    expect(result.instance?.definition).toBe('Form');
    expect(result.instance?.version).toBe('1.0.0');
  });

  it('populates default values from properties', () => {
    const def: FormitivaDefinition = {
      name: 'Form', version: '1.0.0',
      properties: [
        { name: 'age', type: 'int', displayName: 'Age', defaultValue: 25 },
        { name: 'label', type: 'text', displayName: 'Label', defaultValue: 'hello' },
        { name: 'flag', type: 'text', displayName: 'Flag', defaultValue: false },
      ],
    };
    const result = createInstanceFromDefinition(def, 'inst');
    expect(result.success).toBe(true);
    expect(result.instance?.values.age).toBe(25);
    expect(result.instance?.values.label).toBe('hello');
    expect(result.instance?.values.flag).toBe(false);
  });

  it('initializes unit fields as [value, unit]', () => {
    const def: FormitivaDefinition = {
      name: 'Form', version: '1.0.0',
      properties: [{ name: 'height', type: 'unit', displayName: 'Height', defaultValue: 1.8, defaultUnit: 'm' }],
    };
    const result = createInstanceFromDefinition(def, 'inst');
    expect(result.instance?.values.height).toEqual([1.8, 'm']);
  });

  it('uses "m" as default unit when defaultUnit is not set', () => {
    const def: FormitivaDefinition = {
      name: 'Form', version: '1.0.0',
      properties: [{ name: 'width', type: 'unit', displayName: 'Width', defaultValue: 5 }],
    };
    const result = createInstanceFromDefinition(def, 'inst');
    expect(result.instance?.values.width).toEqual([5, 'm']);
  });

  it('does not populate fields with no defaultValue', () => {
    const def: FormitivaDefinition = {
      name: 'Form', version: '1.0.0',
      properties: [{ name: 'notes', type: 'text', displayName: 'Notes' }],
    };
    const result = createInstanceFromDefinition(def, 'inst');
    expect(result.instance?.values).not.toHaveProperty('notes');
  });

  it('fails when instance name is missing', () => {
    const def: FormitivaDefinition = { name: 'Form', version: '1.0.0', properties: [] };
    expect(createInstanceFromDefinition(def, '').success).toBe(false);
  });

  it('fails when definition is null', () => {
    expect(createInstanceFromDefinition(null as unknown as FormitivaDefinition, 'inst').success).toBe(false);
  });
});

// ─── loadInstance ─────────────────────────────────────────────────────────────

describe('loadInstance', () => {
  const raw: FormitivaInstance = { name: 'inst', definition: 'Form', version: '1.0.0', values: {} };

  it('loads from a plain object', () => {
    const result = loadInstance(raw as unknown as Record<string, unknown>);
    expect(result.success).toBe(true);
    expect(result.instance?.name).toBe('inst');
  });

  it('loads from a JSON string', () => {
    const result = loadInstance(JSON.stringify(raw));
    expect(result.success).toBe(true);
    expect(result.instance?.definition).toBe('Form');
  });

  it('fails on invalid JSON string', () => {
    const result = loadInstance('{bad json');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Invalid JSON/i);
  });

  it('fails on null input', () => {
    expect(loadInstance(null as unknown as string).success).toBe(false);
  });
});

// ─── upgradeInstanceToLatestDefinition ────────────────────────────────────────

describe('upgradeInstanceToLatestDefinition', () => {
  const latestDef: FormitivaDefinition = {
    name: 'Form', version: '2.0.0',
    properties: [{ name: 'age', type: 'int', displayName: 'Age', defaultValue: 30 }],
  };

  it('is a no-op when definition name and version already match', () => {
    const instance: FormitivaInstance = {
      name: 'inst', definition: 'Form', version: '2.0.0', values: { age: 99 },
    };
    const result = upgradeInstanceToLatestDefinition(instance, latestDef);
    expect(result.success).toBe(true);
    expect(result.instance).toBe(instance); // same reference
  });

  it('upgrades metadata when version differs', () => {
    const old: FormitivaInstance = {
      name: 'inst', definition: 'Form', version: '1.0.0', values: { age: 42 },
    };
    const result = upgradeInstanceToLatestDefinition(old, latestDef);
    expect(result.success).toBe(true);
    expect(result.instance?.version).toBe('2.0.0');
    expect(result.instance?.definition).toBe('Form');
  });

  it('preserves compatible values from old instance', () => {
    const old: FormitivaInstance = {
      name: 'inst', definition: 'Form', version: '1.0.0', values: { age: 55 },
    };
    const result = upgradeInstanceToLatestDefinition(old, latestDef);
    expect(result.instance?.values.age).toBe(55);
  });

  it('fills defaults for fields not present in old instance', () => {
    const defWithExtra: FormitivaDefinition = {
      name: 'Form', version: '2.0.0',
      properties: [
        { name: 'age', type: 'int', displayName: 'Age', defaultValue: 30 },
        { name: 'score', type: 'float', displayName: 'Score', defaultValue: 9.5 },
      ],
    };
    const old: FormitivaInstance = {
      name: 'inst', definition: 'Form', version: '1.0.0', values: { age: 20 },
    };
    const result = upgradeInstanceToLatestDefinition(old, defWithExtra);
    expect(result.success).toBe(true);
    expect(result.instance?.values.score).toBe(9.5);
  });

  it('invokes optional callback', () => {
    const old: FormitivaInstance = {
      name: 'inst', definition: 'Form', version: '1.0.0', values: {},
    };
    let called = false;
    upgradeInstanceToLatestDefinition(old, latestDef, () => { called = true; });
    expect(called).toBe(true);
  });

  it('fails when instance is null', () => {
    expect(upgradeInstanceToLatestDefinition(null as unknown as FormitivaInstance, latestDef).success).toBe(false);
  });

  it('fails when latestDefinition is null', () => {
    const inst: FormitivaInstance = { name: 'inst', definition: 'Form', version: '1.0.0', values: {} };
    expect(upgradeInstanceToLatestDefinition(inst, null as unknown as FormitivaDefinition).success).toBe(false);
  });
});
