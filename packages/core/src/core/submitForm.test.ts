import { describe, it, expect, beforeAll } from 'vitest';
import { submitForm } from './submitForm';
import { ensureBuiltinFieldTypeValidatorsRegistered } from '../validation/registerBuiltinTypeValidators';
import type { FormitivaDefinition, FormitivaInstance, TranslationFunction } from './formitivaTypes';

const t: TranslationFunction = (text, ...args) =>
  text.replace(/\{\{(\d+)\}\}/g, (_, i) => String((args as unknown[])[parseInt(i, 10) - 1] ?? _));

beforeAll(() => ensureBuiltinFieldTypeValidatorsRegistered());

const simpleDef: FormitivaDefinition = { name: 'TestForm', version: '1.0.0', properties: [] };
const instance: FormitivaInstance = { name: 'inst', definition: 'TestForm', version: '1.0.0', values: {} };

describe('submitForm', () => {
  // ─── early exit on existing errors ──────────────────────────────────────────

  it('fails immediately when there are existing field errors', async () => {
    const result = await submitForm(simpleDef, instance, {}, t, { fieldA: 'Required' });
    expect(result.success).toBe(false);
    expect(result.errors).toContain('Required');
  });

  it('ignores falsy error values in the errors map', async () => {
    const result = await submitForm(simpleDef, instance, {}, t, { fieldA: '' }, async () => undefined);
    expect(result.success).toBe(true);
  });

  // ─── happy path ──────────────────────────────────────────────────────────────

  it('succeeds and calls onSubmit when there are no errors', async () => {
    let submitted = false;
    const result = await submitForm(simpleDef, instance, {}, t, {}, async () => {
      submitted = true;
      return undefined;
    });
    expect(result.success).toBe(true);
    expect(submitted).toBe(true);
  });

  it('returns success true with no onSubmit and no submitHandlerName', async () => {
    const result = await submitForm(simpleDef, instance, {}, t, {});
    expect(result.success).toBe(true);
  });

  // ─── onValidation ────────────────────────────────────────────────────────────

  it('fails when onValidation returns errors', async () => {
    const result = await submitForm(simpleDef, instance, {}, t, {}, undefined, async () => ['Validation failed']);
    expect(result.success).toBe(false);
    expect(result.errors).toContain('Validation failed');
  });

  it('proceeds to onSubmit when onValidation returns no errors', async () => {
    let submitted = false;
    await submitForm(simpleDef, instance, {}, t, {}, async () => { submitted = true; return undefined; }, async () => undefined);
    expect(submitted).toBe(true);
  });

  // ─── int coercion ────────────────────────────────────────────────────────────

  it('coerces string int field to number before submission', async () => {
    const def: FormitivaDefinition = {
      name: 'F', version: '1.0.0',
      properties: [{ name: 'age', type: 'int', displayName: 'Age' }],
    };
    let captured: Record<string, unknown> = {};
    await submitForm(def, instance, { age: '42' }, t, {}, async (_d, _n, values) => {
      captured = values as Record<string, unknown>;
      return undefined;
    });
    expect(captured.age).toBe(42);
  });

  it('returns error for non-integer string in int field', async () => {
    const def: FormitivaDefinition = {
      name: 'F', version: '1.0.0',
      properties: [{ name: 'age', type: 'int', displayName: 'Age' }],
    };
    const result = await submitForm(def, instance, { age: '3.14' }, t, {});
    expect(result.success).toBe(false);
  });

  // ─── float coercion ──────────────────────────────────────────────────────────

  it('coerces string float field to number before submission', async () => {
    const def: FormitivaDefinition = {
      name: 'F', version: '1.0.0',
      properties: [{ name: 'score', type: 'float', displayName: 'Score' }],
    };
    let captured: Record<string, unknown> = {};
    await submitForm(def, instance, { score: '9.5' }, t, {}, async (_d, _n, values) => {
      captured = values as Record<string, unknown>;
      return undefined;
    });
    expect(captured.score).toBe(9.5);
  });

  it('returns error when float field receives non-numeric text', async () => {
    const def: FormitivaDefinition = {
      name: 'F', version: '1.0.0',
      properties: [{ name: 'score', type: 'float', displayName: 'Score' }],
    };
    const result = await submitForm(def, instance, { score: 'abc' }, t, {});
    expect(result.success).toBe(false);
  });

  // ─── int-array coercion ───────────────────────────────────────────────────────

  it('coerces a comma-separated int-array field to a number array', async () => {
    const def: FormitivaDefinition = {
      name: 'F', version: '1.0.0',
      properties: [{ name: 'nums', type: 'int-array', displayName: 'Nums' }],
    };
    let captured: Record<string, unknown> = {};
    await submitForm(def, instance, { nums: '1,2,3' }, t, {}, async (_d, _n, values) => {
      captured = values as Record<string, unknown>;
      return undefined;
    });
    expect(captured.nums).toEqual([1, 2, 3]);
  });

  // ─── onSubmit returning errors ────────────────────────────────────────────────

  it('returns failure when onSubmit returns error strings', async () => {
    const result = await submitForm(simpleDef, instance, {}, t, {}, async () => ['Submission error']);
    expect(result.success).toBe(false);
    expect(result.errors).toContain('Submission error');
  });

  it('returns failure when onSubmit throws', async () => {
    const result = await submitForm(simpleDef, instance, {}, t, {}, async () => {
      throw new Error('Handler crashed');
    });
    expect(result.success).toBe(false);
    expect(result.errors?.[0]).toMatch(/Handler crashed/);
  });
});
