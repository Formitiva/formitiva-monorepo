// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import createUnitValueInput from './UnitValueInput';
import { createDefaultContext } from '../../../context/formitivaContext';
import type { DefinitionPropertyField } from '@formitiva/core';

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'length', displayName: 'Length', type: 'unit-value', dimension: 'length', ...overrides } as DefinitionPropertyField;
}

function noValCtx() {
  return { ...createDefaultContext(), fieldValidationMode: 'onSubmission' as const };
}

describe('createUnitValueInput', () => {
  it('renders a text input with id=field.name when dimension is valid', () => {
    const w = createUnitValueInput(makeField(), noValCtx(), vi.fn(), vi.fn(), ['10', 'm'], null, false);
    const input = w.el.querySelector('input[type="text"]') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.id).toBe('length');
  });

  it('renders a select element for unit selection', () => {
    const w = createUnitValueInput(makeField(), noValCtx(), vi.fn(), vi.fn(), ['10', 'm'], null, false);
    expect(w.el.querySelector('select')).not.toBeNull();
  });

  it('sets text input value from initialValue[0]', () => {
    const w = createUnitValueInput(makeField(), noValCtx(), vi.fn(), vi.fn(), ['42', 'cm'], null, false);
    const input = w.el.querySelector('input[type="text"]') as HTMLInputElement;
    expect(input.value).toBe('42');
  });

  it('disables text input and select when disabled=true', () => {
    const w = createUnitValueInput(makeField(), noValCtx(), vi.fn(), vi.fn(), ['10', 'm'], null, true);
    expect((w.el.querySelector('input[type="text"]') as HTMLInputElement).disabled).toBe(true);
    expect((w.el.querySelector('select') as HTMLSelectElement).disabled).toBe(true);
  });

  it('shows "No unit dimension configured" when dimension is missing', () => {
    const w = createUnitValueInput(
      makeField({ dimension: undefined } as any),
      noValCtx(), vi.fn(), vi.fn(), '', null, false
    );
    expect(w.el.textContent).toContain('No unit dimension configured');
  });

  it('shows "No unit dimension configured" for unknown dimension', () => {
    const w = createUnitValueInput(
      makeField({ dimension: 'unknowndimension' } as any),
      noValCtx(), vi.fn(), vi.fn(), '', null, false
    );
    expect(w.el.textContent).toContain('No unit dimension configured');
  });

  it('calls onChange when text input changes', () => {
    const onChange = vi.fn();
    const w = createUnitValueInput(makeField(), noValCtx(), onChange, vi.fn(), ['10', 'm'], null, false);
    const input = w.el.querySelector('input[type="text"]') as HTMLInputElement;
    input.value = '20';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(onChange).toHaveBeenCalled();
  });

  it('renders label with displayName', () => {
    const w = createUnitValueInput(makeField({ displayName: 'Height' }), noValCtx(), vi.fn(), vi.fn(), ['10', 'm'], null, false);
    expect(w.el.textContent).toContain('Height');
  });

  it('select contains unit options from the dimension', () => {
    const w = createUnitValueInput(makeField(), noValCtx(), vi.fn(), vi.fn(), ['10', 'm'], null, false);
    const select = w.el.querySelector('select') as HTMLSelectElement;
    expect(select.options.length).toBeGreaterThan(0);
  });

  it('destroy() does not throw', () => {
    const w = createUnitValueInput(makeField(), noValCtx(), vi.fn(), vi.fn(), ['10', 'm'], null, false);
    expect(() => w.destroy()).not.toThrow();
  });
});
