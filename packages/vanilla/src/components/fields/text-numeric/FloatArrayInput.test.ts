// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import createFloatArrayInput from './FloatArrayInput';
import { createDefaultContext } from '../../../context/formitivaContext';
import type { DefinitionPropertyField } from '@formitiva/core';

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'amounts', displayName: 'Amounts', type: 'floatArray', ...overrides } as DefinitionPropertyField;
}

function noValCtx() {
  return { ...createDefaultContext(), fieldValidationMode: 'onSubmission' as const };
}

describe('createFloatArrayInput', () => {
  it('creates input[type="text"]', () => {
    const w = createFloatArrayInput(makeField(), noValCtx(), vi.fn(), vi.fn(), [], null, false);
    expect(w.el.querySelector('input[type="text"]')).not.toBeNull();
  });

  it('sets id to field.name', () => {
    const w = createFloatArrayInput(makeField({ name: 'vals' }), noValCtx(), vi.fn(), vi.fn(), [], null, false);
    expect(w.el.querySelector('input')!.id).toBe('vals');
  });

  it('renders label with displayName', () => {
    const w = createFloatArrayInput(makeField({ displayName: 'Values' }), noValCtx(), vi.fn(), vi.fn(), [], null, false);
    expect(w.el.textContent).toContain('Values');
  });

  it('displays float array as comma-separated string', () => {
    const w = createFloatArrayInput(makeField(), noValCtx(), vi.fn(), vi.fn(), [1.5, 2.5, 3.5], null, false);
    expect((w.el.querySelector('input') as HTMLInputElement).value).toBe('1.5, 2.5, 3.5');
  });

  it('displays empty array as empty string', () => {
    const w = createFloatArrayInput(makeField(), noValCtx(), vi.fn(), vi.fn(), [], null, false);
    expect((w.el.querySelector('input') as HTMLInputElement).value).toBe('');
  });

  it('disables input when disabled=true', () => {
    const w = createFloatArrayInput(makeField(), noValCtx(), vi.fn(), vi.fn(), [], null, true);
    expect((w.el.querySelector('input') as HTMLInputElement).disabled).toBe(true);
  });

  it('calls onChange on input event', () => {
    const onChange = vi.fn();
    const w = createFloatArrayInput(makeField(), noValCtx(), onChange, vi.fn(), [], null, false);
    const input = w.el.querySelector('input') as HTMLInputElement;
    input.value = '1.5, 2.5';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith('1.5, 2.5');
  });

  it('update() changes input value from float array', () => {
    const w = createFloatArrayInput(makeField(), noValCtx(), vi.fn(), vi.fn(), [], null, false);
    w.update([1.1, 2.2], null, false);
    expect((w.el.querySelector('input') as HTMLInputElement).value).toBe('1.1, 2.2');
  });

  it('destroy() does not throw', () => {
    const w = createFloatArrayInput(makeField(), noValCtx(), vi.fn(), vi.fn(), [], null, false);
    expect(() => w.destroy()).not.toThrow();
  });
});
