// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import createColorInput from './ColorInput';
import { createDefaultContext } from '../../../context/formitivaContext';
import type { DefinitionPropertyField } from '@formitiva/core';

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'bg', displayName: 'Background', type: 'color', ...overrides } as DefinitionPropertyField;
}

function noValCtx() {
  return { ...createDefaultContext(), fieldValidationMode: 'onSubmission' as const };
}

describe('createColorInput', () => {
  it('creates a select element with id=field.name', () => {
    const w = createColorInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '#ff0000', null, false);
    const select = w.el.querySelector('select');
    expect(select).not.toBeNull();
    expect(select!.id).toBe('bg');
  });

  it('creates an input[type="color"]', () => {
    const w = createColorInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '#ff0000', null, false);
    expect(w.el.querySelector('input[type="color"]')).not.toBeNull();
  });

  it('color input id is field.name + "-color"', () => {
    const w = createColorInput(makeField({ name: 'myColor' }), noValCtx(), vi.fn(), vi.fn(), '#ff0000', null, false);
    expect(w.el.querySelector('input[type="color"]')!.id).toBe('myColor-color');
  });

  it('renders label with displayName', () => {
    const w = createColorInput(makeField({ displayName: 'Pick Color' }), noValCtx(), vi.fn(), vi.fn(), '#ff0000', null, false);
    expect(w.el.textContent).toContain('Pick Color');
  });

  it('disables select and color input when disabled=true', () => {
    const w = createColorInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '#ff0000', null, true);
    expect((w.el.querySelector('select') as HTMLSelectElement).disabled).toBe(true);
    expect((w.el.querySelector('input[type="color"]') as HTMLInputElement).disabled).toBe(true);
  });

  it('sets color input value from initial value', () => {
    const w = createColorInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '#ff0000', null, false);
    const colorInput = w.el.querySelector('input[type="color"]') as HTMLInputElement;
    expect(colorInput.value).toBe('#ff0000');
  });

  it('normalizes invalid initial color to #000000', () => {
    const w = createColorInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 'notacolor', null, false);
    const colorInput = w.el.querySelector('input[type="color"]') as HTMLInputElement;
    expect(colorInput.value).toBe('#000000');
  });

  it('calls onChange when select changes', () => {
    const onChange = vi.fn();
    const w = createColorInput(makeField(), noValCtx(), onChange, vi.fn(), '#000000', null, false);
    const select = w.el.querySelector('select') as HTMLSelectElement;
    select.value = '#ffffff';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(onChange).toHaveBeenCalled();
  });

  it('update() changes color input value', () => {
    const w = createColorInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '#ff0000', null, false);
    w.update('#0000ff', null, false);
    const colorInput = w.el.querySelector('input[type="color"]') as HTMLInputElement;
    expect(colorInput.value).toBe('#0000ff');
  });

  it('destroy() does not throw', () => {
    const w = createColorInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '#ff0000', null, false);
    expect(() => w.destroy()).not.toThrow();
  });
});
