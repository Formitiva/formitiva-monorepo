// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import createDateInput from './DateInput';
import { createDefaultContext } from '../../../context/formitivaContext';
import type { DefinitionPropertyField } from '@formitiva/core';

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'dob', displayName: 'Date of Birth', type: 'date', ...overrides } as DefinitionPropertyField;
}

function noValCtx() {
  return { ...createDefaultContext(), fieldValidationMode: 'onSubmission' as const };
}

describe('createDateInput', () => {
  it('creates an input[type="date"] element', () => {
    const widget = createDateInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    const input = widget.el.querySelector('input[type="date"]');
    expect(input).not.toBeNull();
  });

  it('sets the input id to field.name', () => {
    const widget = createDateInput(makeField({ name: 'dob' }), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.querySelector('input')!.id).toBe('dob');
  });

  it('renders a label with field.displayName', () => {
    const widget = createDateInput(makeField({ displayName: 'Birthday' }), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.textContent).toContain('Birthday');
  });

  it('sets initial value in YYYY-MM-DD format', () => {
    const widget = createDateInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '2000-06-15', null, false);
    expect((widget.el.querySelector('input') as HTMLInputElement).value).toBe('2000-06-15');
  });

  it('sets empty string for invalid date', () => {
    const widget = createDateInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 'not-a-date', null, false);
    expect((widget.el.querySelector('input') as HTMLInputElement).value).toBe('');
  });

  it('disables the input when disabled=true', () => {
    const widget = createDateInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, true);
    expect((widget.el.querySelector('input') as HTMLInputElement).disabled).toBe(true);
  });

  it('applies min attribute from field.minDate', () => {
    const widget = createDateInput(makeField({ minDate: '2000-01-01' }), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect((widget.el.querySelector('input') as HTMLInputElement).min).toBe('2000-01-01');
  });

  it('applies max attribute from field.maxDate', () => {
    const widget = createDateInput(makeField({ maxDate: '2030-12-31' }), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect((widget.el.querySelector('input') as HTMLInputElement).max).toBe('2030-12-31');
  });

  it('calls onChange when user picks a date', () => {
    const onChange = vi.fn();
    const widget = createDateInput(makeField(), noValCtx(), onChange, vi.fn(), '', null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    input.value = '2024-03-15';
    input.dispatchEvent(new Event('input'));
    expect(onChange).toHaveBeenCalledWith('2024-03-15');
  });

  it('destroy() does not throw', () => {
    const widget = createDateInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(() => widget.destroy()).not.toThrow();
  });
});
