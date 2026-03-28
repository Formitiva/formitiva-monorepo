// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import createFloatInput from './FloatInput';
import { createDefaultContext } from '../../../context/formitivaContext';
import type { DefinitionPropertyField } from '@formitiva/core';

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'price', displayName: 'Price', type: 'float', ...overrides } as DefinitionPropertyField;
}

function noValCtx() {
  return { ...createDefaultContext(), fieldValidationMode: 'onSubmission' as const };
}

describe('createFloatInput', () => {
  it('creates input[type="text"]', () => {
    const widget = createFloatInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.querySelector('input[type="text"]')).not.toBeNull();
  });

  it('sets id to field.name', () => {
    const widget = createFloatInput(makeField({ name: 'myFloat' }), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.querySelector('input')!.id).toBe('myFloat');
  });

  it('renders label with displayName', () => {
    const widget = createFloatInput(makeField({ displayName: 'Unit Price' }), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.textContent).toContain('Unit Price');
  });

  it('sets initial value', () => {
    const widget = createFloatInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 3.14, null, false);
    expect((widget.el.querySelector('input') as HTMLInputElement).value).toBe('3.14');
  });

  it('disables input when disabled=true', () => {
    const widget = createFloatInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, true);
    expect((widget.el.querySelector('input') as HTMLInputElement).disabled).toBe(true);
  });

  it('calls onChange on input event', () => {
    const onChange = vi.fn();
    const widget = createFloatInput(makeField(), noValCtx(), onChange, vi.fn(), '', null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    input.value = '1.5';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith('1.5');
  });

  it('destroy() does not throw', () => {
    const widget = createFloatInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(() => widget.destroy()).not.toThrow();
  });
});
