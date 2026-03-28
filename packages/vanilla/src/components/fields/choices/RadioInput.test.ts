// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import createRadioInput from './RadioInput';
import { createDefaultContext } from '../../../context/formitivaContext';
import type { DefinitionPropertyField } from '@formitiva/core';

const OPTIONS = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
  { label: 'Option C', value: 'c' },
];

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'choice', displayName: 'Pick one', type: 'radio', options: OPTIONS, ...overrides } as DefinitionPropertyField;
}

function noValCtx() {
  return { ...createDefaultContext(), fieldValidationMode: 'onSubmission' as const };
}

describe('createRadioInput', () => {
  it('creates one radio input per option', () => {
    const widget = createRadioInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 'a', null, false);
    const radios = widget.el.querySelectorAll('input[type="radio"]');
    expect(radios.length).toBe(3);
  });

  it('pre-checks the radio matching the initial value', () => {
    const widget = createRadioInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 'b', null, false);
    const radios = Array.from(widget.el.querySelectorAll('input[type="radio"]')) as HTMLInputElement[];
    expect(radios.find(r => r.value === 'b')!.checked).toBe(true);
    expect(radios.find(r => r.value === 'a')!.checked).toBe(false);
  });

  it('all radios share the same name (field.name)', () => {
    const widget = createRadioInput(makeField({ name: 'q1' }), noValCtx(), vi.fn(), vi.fn(), 'a', null, false);
    const radios = Array.from(widget.el.querySelectorAll('input[type="radio"]')) as HTMLInputElement[];
    expect(radios.every(r => r.name === 'q1')).toBe(true);
  });

  it('each radio id is field.name-optionValue', () => {
    const widget = createRadioInput(makeField({ name: 'q1' }), noValCtx(), vi.fn(), vi.fn(), 'a', null, false);
    expect(widget.el.querySelector('#q1-a')).not.toBeNull();
    expect(widget.el.querySelector('#q1-b')).not.toBeNull();
    expect(widget.el.querySelector('#q1-c')).not.toBeNull();
  });

  it('renders option labels', () => {
    const widget = createRadioInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 'a', null, false);
    const text = widget.el.textContent ?? '';
    expect(text).toContain('Option A');
    expect(text).toContain('Option B');
    expect(text).toContain('Option C');
  });

  it('disables all radios when disabled=true', () => {
    const widget = createRadioInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 'a', null, true);
    const radios = Array.from(widget.el.querySelectorAll('input[type="radio"]')) as HTMLInputElement[];
    expect(radios.every(r => r.disabled)).toBe(true);
  });

  it('calls onChange when a radio is selected', () => {
    const onChange = vi.fn();
    const widget = createRadioInput(makeField(), noValCtx(), onChange, vi.fn(), 'a', null, false);
    const radioB = widget.el.querySelector('[value="b"]') as HTMLInputElement;
    radioB.checked = true;
    radioB.dispatchEvent(new Event('change'));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('update() checks the correct radio', () => {
    const widget = createRadioInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 'a', null, false);
    widget.update('c', null, false);
    const radios = Array.from(widget.el.querySelectorAll('input[type="radio"]')) as HTMLInputElement[];
    expect(radios.find(r => r.value === 'c')!.checked).toBe(true);
    expect(radios.find(r => r.value === 'a')!.checked).toBe(false);
  });

  it('has vertical layout by default', () => {
    const widget = createRadioInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 'a', null, false);
    // The flex container is the direct parent of the first radio's label element
    const firstRadio = widget.el.querySelector('input[type="radio"]') as HTMLInputElement;
    const container = firstRadio?.closest('div') as HTMLElement;
    expect(container?.style.flexDirection).toBe('column');
  });

  it('has row layout when field.layout is "horizontal"', () => {
    const widget = createRadioInput(makeField({ layout: 'horizontal' }), noValCtx(), vi.fn(), vi.fn(), 'a', null, false);
    const firstRadio = widget.el.querySelector('input[type="radio"]') as HTMLInputElement;
    const container = firstRadio?.closest('div') as HTMLElement;
    expect(container?.style.flexDirection).toBe('row');
  });

  it('destroy() does not throw', () => {
    const widget = createRadioInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 'a', null, false);
    expect(() => widget.destroy()).not.toThrow();
  });
});
