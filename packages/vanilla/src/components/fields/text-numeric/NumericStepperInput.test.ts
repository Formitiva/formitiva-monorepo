// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import createNumericStepperInput from './NumericStepperInput';
import { createDefaultContext } from '../../../context/formitivaContext';
import type { DefinitionPropertyField } from '@formitiva/core';

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'count', displayName: 'Count', type: 'integer', ...overrides } as DefinitionPropertyField;
}

function noValCtx() {
  return { ...createDefaultContext(), fieldValidationMode: 'onSubmission' as const };
}

describe('createNumericStepperInput', () => {
  it('creates input[type="number"]', () => {
    const widget = createNumericStepperInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.querySelector('input[type="number"]')).not.toBeNull();
  });

  it('sets default step=1', () => {
    const widget = createNumericStepperInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    expect(input.step).toBe('1');
  });

  it('sets custom step', () => {
    const widget = createNumericStepperInput(makeField({ step: 5 } as any), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    expect(input.step).toBe('5');
  });

  it('sets id to field.name', () => {
    const widget = createNumericStepperInput(makeField({ name: 'qty' }), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.querySelector('input')!.id).toBe('qty');
  });

  it('renders label with displayName', () => {
    const widget = createNumericStepperInput(makeField({ displayName: 'Quantity' }), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.textContent).toContain('Quantity');
  });

  it('sets min attribute', () => {
    const widget = createNumericStepperInput(makeField({ min: 0 } as any), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    expect(input.min).toBe('0');
  });

  it('sets max attribute', () => {
    const widget = createNumericStepperInput(makeField({ max: 100 } as any), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    expect(input.max).toBe('100');
  });

  it('sets initial value', () => {
    const widget = createNumericStepperInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 42, null, false);
    expect((widget.el.querySelector('input') as HTMLInputElement).value).toBe('42');
  });

  it('disables input when disabled=true', () => {
    const widget = createNumericStepperInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, true);
    expect((widget.el.querySelector('input') as HTMLInputElement).disabled).toBe(true);
  });

  it('calls onChange on input event', () => {
    const onChange = vi.fn();
    const widget = createNumericStepperInput(makeField(), noValCtx(), onChange, vi.fn(), '', null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    input.value = '7';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith('7');
  });

  it('destroy() does not throw', () => {
    const widget = createNumericStepperInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(() => widget.destroy()).not.toThrow();
  });
});
