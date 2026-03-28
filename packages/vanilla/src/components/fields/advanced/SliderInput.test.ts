// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import createSliderInput from './SliderInput';
import { createDefaultContext } from '../../../context/formitivaContext';
import type { DefinitionPropertyField } from '@formitiva/core';

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'volume', displayName: 'Volume', type: 'slider', min: 0, max: 100, ...overrides } as DefinitionPropertyField;
}

function noValCtx() {
  return { ...createDefaultContext(), fieldValidationMode: 'onSubmission' as const };
}

describe('createSliderInput', () => {
  it('creates a range input', () => {
    const widget = createSliderInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 50, null, false);
    expect(widget.el.querySelector('input[type="range"]')).not.toBeNull();
  });

  it('creates a companion text input', () => {
    const widget = createSliderInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 50, null, false);
    expect(widget.el.querySelector('input[type="text"]')).not.toBeNull();
  });

  it('range input id is field.name + "-range"', () => {
    const widget = createSliderInput(makeField({ name: 'vol' }), noValCtx(), vi.fn(), vi.fn(), 50, null, false);
    expect(widget.el.querySelector('input[type="range"]')!.id).toBe('vol-range');
  });

  it('text input id is field.name', () => {
    const widget = createSliderInput(makeField({ name: 'vol' }), noValCtx(), vi.fn(), vi.fn(), 50, null, false);
    expect(widget.el.querySelector('input[type="text"]')!.id).toBe('vol');
  });

  it('sets min and max from field', () => {
    const widget = createSliderInput(makeField({ min: 10, max: 90 } as any), noValCtx(), vi.fn(), vi.fn(), 50, null, false);
    const range = widget.el.querySelector('input[type="range"]') as HTMLInputElement;
    expect(range.min).toBe('10');
    expect(range.max).toBe('90');
  });

  it('sets initial value on range and text', () => {
    const widget = createSliderInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 75, null, false);
    const range = widget.el.querySelector('input[type="range"]') as HTMLInputElement;
    const text = widget.el.querySelector('input[type="text"]') as HTMLInputElement;
    expect(range.value).toBe('75');
    expect(text.value).toBe('75');
  });

  it('syncs text input when range is dragged', () => {
    const widget = createSliderInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 0, null, false);
    const range = widget.el.querySelector('input[type="range"]') as HTMLInputElement;
    const text = widget.el.querySelector('input[type="text"]') as HTMLInputElement;
    range.value = '40';
    range.dispatchEvent(new Event('input', { bubbles: true }));
    expect(text.value).toBe('40');
  });

  it('syncs range when text input changes', () => {
    const widget = createSliderInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 0, null, false);
    const range = widget.el.querySelector('input[type="range"]') as HTMLInputElement;
    const text = widget.el.querySelector('input[type="text"]') as HTMLInputElement;
    text.value = '60';
    text.dispatchEvent(new Event('input', { bubbles: true }));
    expect(range.value).toBe('60');
  });

  it('calls onChange when range is dragged', () => {
    const onChange = vi.fn();
    const widget = createSliderInput(makeField(), noValCtx(), onChange, vi.fn(), 0, null, false);
    const range = widget.el.querySelector('input[type="range"]') as HTMLInputElement;
    range.value = '25';
    range.dispatchEvent(new Event('input', { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith('25');
  });

  it('disables range and text when disabled=true', () => {
    const widget = createSliderInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 0, null, true);
    const range = widget.el.querySelector('input[type="range"]') as HTMLInputElement;
    const text = widget.el.querySelector('input[type="text"]') as HTMLInputElement;
    expect(range.disabled).toBe(true);
    expect(text.disabled).toBe(true);
  });

  it('destroy() does not throw', () => {
    const widget = createSliderInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 0, null, false);
    expect(() => widget.destroy()).not.toThrow();
  });
});
