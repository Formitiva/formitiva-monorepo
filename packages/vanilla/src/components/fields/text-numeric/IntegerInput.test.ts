// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import createIntegerInput from './IntegerInput';
import { createDefaultContext } from '../../../context/formitivaContext';
import type { DefinitionPropertyField } from '@formitiva/core';

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'age', displayName: 'Age', type: 'integer', ...overrides } as DefinitionPropertyField;
}

function noValCtx() {
  return { ...createDefaultContext(), fieldValidationMode: 'onSubmission' as const };
}

describe('createIntegerInput', () => {
  it('creates input[type="text"]', () => {
    const widget = createIntegerInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.querySelector('input[type="text"]')).not.toBeNull();
  });

  it('sets id to field.name', () => {
    const widget = createIntegerInput(makeField({ name: 'myInt' }), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.querySelector('input')!.id).toBe('myInt');
  });

  it('renders label with displayName', () => {
    const widget = createIntegerInput(makeField({ displayName: 'Quantity' }), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.textContent).toContain('Quantity');
  });

  it('sets initial value', () => {
    const widget = createIntegerInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 5, null, false);
    expect((widget.el.querySelector('input') as HTMLInputElement).value).toBe('5');
  });

  it('disables input when disabled=true', () => {
    const widget = createIntegerInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, true);
    expect((widget.el.querySelector('input') as HTMLInputElement).disabled).toBe(true);
  });

  it('calls onChange on input event', () => {
    const onChange = vi.fn();
    const widget = createIntegerInput(makeField(), noValCtx(), onChange, vi.fn(), '', null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    input.value = '10';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith('10');
  });

  it('update() changes input value', () => {
    const widget = createIntegerInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    widget.update(99, null, false);
    expect((widget.el.querySelector('input') as HTMLInputElement).value).toBe('99');
  });

  it('destroy() does not throw', () => {
    const widget = createIntegerInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(() => widget.destroy()).not.toThrow();
  });
});
