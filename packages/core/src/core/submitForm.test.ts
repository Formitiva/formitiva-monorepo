import { describe, it, expect, beforeAll } from 'vitest';
import { submitForm } from './submitForm';
import { ensureBuiltinFieldTypeValidatorsRegistered } from '../validation/registerBuiltinTypeValidators';
import type { FormitivaDefinition, FormitivaInstance, TranslationFunction } from './formitivaTypes';

const t: TranslationFunction = (text, ...args) =>
  text.replace(/\{\{(\d+)\}\}/g, (_, i) => String((args as unknown[])[parseInt(i, 10) - 1] ?? _));

beforeAll(() => ensureBuiltinFieldTypeValidatorsRegistered());

const simpleDef: FormitivaDefinition = { name: 'TestForm', version: '1.0.0', displayName: 'Test Form', properties: [] };
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

  it('returns success true with no onSubmit and no submitterRef', async () => {
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
      name: 'F', version: '1.0.0', displayName: 'F',
      properties: [{ name: 'age', type: 'int', displayName: 'Age', defaultValue: 0 }],
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
      name: 'F', version: '1.0.0', displayName: 'F',
      properties: [{ name: 'age', type: 'int', displayName: 'Age', defaultValue: 0 }],
    };
    const result = await submitForm(def, instance, { age: '3.14' }, t, {});
    expect(result.success).toBe(false);
  });

  // ─── float coercion ──────────────────────────────────────────────────────────

  it('coerces string float field to number before submission', async () => {
    const def: FormitivaDefinition = {
      name: 'F', version: '1.0.0', displayName: 'F',
      properties: [{ name: 'score', type: 'float', displayName: 'Score', defaultValue: 0 }],
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
      name: 'F', version: '1.0.0', displayName: 'F',
      properties: [{ name: 'score', type: 'float', displayName: 'Score', defaultValue: 0 }],
    };
    const result = await submitForm(def, instance, { score: 'abc' }, t, {});
    expect(result.success).toBe(false);
  });

  // ─── int-array coercion ───────────────────────────────────────────────────────

  it('coerces a comma-separated int-array field to a number array', async () => {
    const def: FormitivaDefinition = {
      name: 'F', version: '1.0.0', displayName: 'F',
      properties: [{ name: 'nums', type: 'int-array', displayName: 'Nums', defaultValue: [] }],
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

  it('uses a registered submitterRef when onSubmit is not provided', async () => {
    const { registerSubmitter } = await import('./registries/submissionHandlerRegistry');
    registerSubmitter('submitterRefHandler', (_definition, _instanceName, values) => {
      return values.ok === false ? ['Submission rejected'] : undefined;
    });

    const def: FormitivaDefinition = {
      name: 'F', version: '1.0.0', displayName: 'F', properties: [], submitterRef: 'submitterRefHandler',
    };

    const okResult = await submitForm(def, instance, { ok: true }, t, {});
    expect(okResult.success).toBe(true);

    const failResult = await submitForm(def, instance, { ok: false }, t, {});
    expect(failResult.success).toBe(false);
    expect(failResult.errors).toContain('Submission rejected');
  });

  it('supports legacy submitHandlerName during migration', async () => {
    const { registerSubmitter } = await import('./registries/submissionHandlerRegistry');
    registerSubmitter('legacySubmitHandler', () => ['Legacy submission error']);

    const def = {
      name: 'F', version: '1.0.0', displayName: 'F', properties: [], submitHandlerName: 'legacySubmitHandler',
    } as FormitivaDefinition & { submitHandlerName: string };

    const result = await submitForm(def, instance, {}, t, {});
    expect(result.success).toBe(false);
    expect(result.errors).toContain('Legacy submission error');
  });
});
