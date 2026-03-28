// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import createCheckboxInput from './CheckboxInput';
import { createDefaultContext } from '../../../context/formitivaContext';
import type { DefinitionPropertyField } from '@formitiva/core';

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'check1', displayName: 'Accept Terms', type: 'checkbox', ...overrides } as DefinitionPropertyField;
}

function noValCtx() {
  return { ...createDefaultContext(), fieldValidationMode: 'onSubmission' as const };
}

describe('createCheckboxInput', () => {
  it('creates a checkbox input element', () => {
    const widget = createCheckboxInput(makeField(), noValCtx(), vi.fn(), vi.fn(), false, null, false);
    const input = widget.el.querySelector('input[type="checkbox"]');
    expect(input).not.toBeNull();
  });

  it('sets checked=true when initial value is true', () => {
    const widget = createCheckboxInput(makeField(), noValCtx(), vi.fn(), vi.fn(), true, null, false);
    expect((widget.el.querySelector('input') as HTMLInputElement).checked).toBe(true);
  });

  it('sets checked=false when initial value is false', () => {
    const widget = createCheckboxInput(makeField(), noValCtx(), vi.fn(), vi.fn(), false, null, false);
    expect((widget.el.querySelector('input') as HTMLInputElement).checked).toBe(false);
  });

  it('sets the input id to field.name', () => {
    const widget = createCheckboxInput(makeField({ name: 'terms' }), noValCtx(), vi.fn(), vi.fn(), false, null, false);
    expect(widget.el.querySelector('input')!.id).toBe('terms');
  });

  it('disables the input when disabled=true', () => {
    const widget = createCheckboxInput(makeField(), noValCtx(), vi.fn(), vi.fn(), false, null, true);
    expect((widget.el.querySelector('input') as HTMLInputElement).disabled).toBe(true);
  });

  it('calls onChange with true when checkbox becomes checked', () => {
    const onChange = vi.fn();
    const widget = createCheckboxInput(makeField(), noValCtx(), onChange, vi.fn(), false, null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when checkbox becomes unchecked', () => {
    const onChange = vi.fn();
    const widget = createCheckboxInput(makeField(), noValCtx(), onChange, vi.fn(), true, null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    input.checked = false;
    input.dispatchEvent(new Event('change'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('toggles on Space keydown and calls onChange', () => {
    const onChange = vi.fn();
    const widget = createCheckboxInput(makeField(), noValCtx(), onChange, vi.fn(), false, null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', cancelable: true }));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('toggles on Enter keydown and calls onChange', () => {
    const onChange = vi.fn();
    const widget = createCheckboxInput(makeField(), noValCtx(), onChange, vi.fn(), false, null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('sets aria-checked attribute on the input', () => {
    const widget = createCheckboxInput(makeField(), noValCtx(), vi.fn(), vi.fn(), true, null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-checked')).toBe('true');
  });

  it('aria-invalid is false when no error', () => {
    const widget = createCheckboxInput(makeField(), noValCtx(), vi.fn(), vi.fn(), false, null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('false');
  });

  it('aria-invalid is true when initial error is set', () => {
    const widget = createCheckboxInput(makeField(), noValCtx(), vi.fn(), vi.fn(), false, 'Required', false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('renders a label with the display name', () => {
    const ctx = noValCtx();
    const widget = createCheckboxInput(makeField({ displayName: 'Accept Terms' }), ctx, vi.fn(), vi.fn(), false, null, false);
    const label = widget.el.querySelector('label');
    expect(label?.textContent).toContain('Accept Terms');
  });

  it('update() syncs the checked state', () => {
    const widget = createCheckboxInput(makeField(), noValCtx(), vi.fn(), vi.fn(), false, null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    widget.update(true, null, false);
    expect(input.checked).toBe(true);
    widget.update(false, null, false);
    expect(input.checked).toBe(false);
  });

  it('update() disables and enables the input', () => {
    const widget = createCheckboxInput(makeField(), noValCtx(), vi.fn(), vi.fn(), false, null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    widget.update(false, null, true);
    expect(input.disabled).toBe(true);
    widget.update(false, null, false);
    expect(input.disabled).toBe(false);
  });

  it('destroy() does not throw', () => {
    const widget = createCheckboxInput(makeField(), noValCtx(), vi.fn(), vi.fn(), false, null, false);
    expect(() => widget.destroy()).not.toThrow();
  });

  it('onChange not called after destroy()', () => {
    const onChange = vi.fn();
    const widget = createCheckboxInput(makeField(), noValCtx(), onChange, vi.fn(), false, null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    widget.destroy();
    input.checked = true;
    input.dispatchEvent(new Event('change'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
