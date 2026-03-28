// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import createTimeInput from './TimeInput';
import { createDefaultContext } from '../../../context/formitivaContext';
import type { DefinitionPropertyField } from '@formitiva/core';

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'apptTime', displayName: 'Appointment Time', type: 'time', ...overrides } as DefinitionPropertyField;
}

function noValCtx() {
  return { ...createDefaultContext(), fieldValidationMode: 'onSubmission' as const };
}

describe('createTimeInput', () => {
  it('creates input[type="time"]', () => {
    const widget = createTimeInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.querySelector('input[type="time"]')).not.toBeNull();
  });

  it('sets id to field.name', () => {
    const widget = createTimeInput(makeField({ name: 'startTime' }), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.querySelector('input')!.id).toBe('startTime');
  });

  it('renders label with displayName', () => {
    const widget = createTimeInput(makeField({ displayName: 'Start Time' }), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.textContent).toContain('Start Time');
  });

  it('sets step=60 by default (no seconds)', () => {
    const widget = createTimeInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    expect(input.step).toBe('60');
  });

  it('sets step=1 when includeSeconds=true', () => {
    const widget = createTimeInput(makeField({ includeSeconds: true } as any), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    expect(input.step).toBe('1');
  });

  it('sets min attribute from string', () => {
    const widget = createTimeInput(makeField({ min: '08:00' } as any), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    expect(input.min).toBe('08:00');
  });

  it('sets max attribute from string', () => {
    const widget = createTimeInput(makeField({ max: '18:00' } as any), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    expect(input.max).toBe('18:00');
  });

  it('sets initial value', () => {
    const widget = createTimeInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '09:30', null, false);
    expect((widget.el.querySelector('input') as HTMLInputElement).value).toBe('09:30');
  });

  it('disables input when disabled=true', () => {
    const widget = createTimeInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, true);
    expect((widget.el.querySelector('input') as HTMLInputElement).disabled).toBe(true);
  });

  it('calls onChange on input event', () => {
    const onChange = vi.fn();
    const widget = createTimeInput(makeField(), noValCtx(), onChange, vi.fn(), '', null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    input.value = '14:00';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith('14:00');
  });

  it('destroy() does not throw', () => {
    const widget = createTimeInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(() => widget.destroy()).not.toThrow();
  });
});
