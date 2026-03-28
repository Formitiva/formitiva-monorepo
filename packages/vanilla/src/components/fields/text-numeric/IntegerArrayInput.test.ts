// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import createIntegerArrayInput from './IntegerArrayInput';
import { createDefaultContext } from '../../../context/formitivaContext';
import type { DefinitionPropertyField } from '@formitiva/core';

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'tags', displayName: 'Tags', type: 'integerArray', ...overrides } as DefinitionPropertyField;
}

function noValCtx() {
  return { ...createDefaultContext(), fieldValidationMode: 'onSubmission' as const };
}

describe('createIntegerArrayInput', () => {
  it('creates input[type="text"]', () => {
    const w = createIntegerArrayInput(makeField(), noValCtx(), vi.fn(), vi.fn(), [], null, false);
    expect(w.el.querySelector('input[type="text"]')).not.toBeNull();
  });

  it('sets id to field.name', () => {
    const w = createIntegerArrayInput(makeField({ name: 'nums' }), noValCtx(), vi.fn(), vi.fn(), [], null, false);
    expect(w.el.querySelector('input')!.id).toBe('nums');
  });

  it('renders label with displayName', () => {
    const w = createIntegerArrayInput(makeField({ displayName: 'Numbers' }), noValCtx(), vi.fn(), vi.fn(), [], null, false);
    expect(w.el.textContent).toContain('Numbers');
  });

  it('displays array as comma-separated string', () => {
    const w = createIntegerArrayInput(makeField(), noValCtx(), vi.fn(), vi.fn(), [1, 2, 3], null, false);
    expect((w.el.querySelector('input') as HTMLInputElement).value).toBe('1, 2, 3');
  });

  it('displays non-array initial value as string', () => {
    const w = createIntegerArrayInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 42, null, false);
    expect((w.el.querySelector('input') as HTMLInputElement).value).toBe('42');
  });

  it('displays empty array as empty string', () => {
    const w = createIntegerArrayInput(makeField(), noValCtx(), vi.fn(), vi.fn(), [], null, false);
    expect((w.el.querySelector('input') as HTMLInputElement).value).toBe('');
  });

  it('disables input when disabled=true', () => {
    const w = createIntegerArrayInput(makeField(), noValCtx(), vi.fn(), vi.fn(), [], null, true);
    expect((w.el.querySelector('input') as HTMLInputElement).disabled).toBe(true);
  });

  it('calls onChange on input event', () => {
    const onChange = vi.fn();
    const w = createIntegerArrayInput(makeField(), noValCtx(), onChange, vi.fn(), [], null, false);
    const input = w.el.querySelector('input') as HTMLInputElement;
    input.value = '1, 2, 3';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith('1, 2, 3');
  });

  it('update() changes input value from array', () => {
    const w = createIntegerArrayInput(makeField(), noValCtx(), vi.fn(), vi.fn(), [], null, false);
    w.update([10, 20], null, false);
    expect((w.el.querySelector('input') as HTMLInputElement).value).toBe('10, 20');
  });

  it('destroy() does not throw', () => {
    const w = createIntegerArrayInput(makeField(), noValCtx(), vi.fn(), vi.fn(), [], null, false);
    expect(() => w.destroy()).not.toThrow();
  });
});
