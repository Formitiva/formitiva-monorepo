// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import createMultiSelection from './MultiSelection';
import { createDefaultContext } from '../../../context/formitivaContext';
import type { DefinitionPropertyField } from '@formitiva/core';

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return {
    name: 'colors',
    displayName: 'Colors',
    type: 'multi-selection',
    options: [
      { value: 'red', label: 'Red' },
      { value: 'green', label: 'Green' },
      { value: 'blue', label: 'Blue' },
    ],
    ...overrides,
  } as unknown as DefinitionPropertyField;
}

function noValCtx() {
  return { ...createDefaultContext(), fieldValidationMode: 'onSubmission' as const };
}

describe('createMultiSelection', () => {
  it('renders a control with role="combobox"', () => {
    const w = createMultiSelection(makeField(), noValCtx(), vi.fn(), vi.fn(), [], null, false);
    expect(w.el.querySelector('[role="combobox"]')).not.toBeNull();
  });

  it('control has aria-haspopup="listbox"', () => {
    const w = createMultiSelection(makeField(), noValCtx(), vi.fn(), vi.fn(), [], null, false);
    const control = w.el.querySelector('[role="combobox"]') as HTMLElement;
    expect(control.getAttribute('aria-haspopup')).toBe('listbox');
  });

  it('shows "None selected" when no values selected', () => {
    const w = createMultiSelection(makeField(), noValCtx(), vi.fn(), vi.fn(), [], null, false);
    expect(w.el.textContent).toContain('None selected');
  });

  it('shows selected count when values provided', () => {
    const w = createMultiSelection(makeField(), noValCtx(), vi.fn(), vi.fn(), ['red', 'blue'], null, false);
    expect(w.el.textContent).toContain('2');
  });

  it('shows "All selected" when all values are selected', () => {
    const w = createMultiSelection(makeField(), noValCtx(), vi.fn(), vi.fn(), ['red', 'green', 'blue'], null, false);
    expect(w.el.textContent).toContain('All selected');
  });

  it('aria-expanded starts as "false"', () => {
    const w = createMultiSelection(makeField(), noValCtx(), vi.fn(), vi.fn(), [], null, false);
    const control = w.el.querySelector('[role="combobox"]') as HTMLElement;
    expect(control.getAttribute('aria-expanded')).toBe('false');
  });

  it('renders a label with displayName', () => {
    const w = createMultiSelection(makeField({ displayName: 'Pick Colors' }), noValCtx(), vi.fn(), vi.fn(), [], null, false);
    expect(w.el.textContent).toContain('Pick Colors');
  });

  it('opens popup on click and sets aria-expanded to "true"', () => {
    const w = createMultiSelection(makeField(), noValCtx(), vi.fn(), vi.fn(), [], null, false);
    document.body.appendChild(w.el);
    const control = w.el.querySelector('[role="combobox"]') as HTMLElement;
    control.click();
    expect(control.getAttribute('aria-expanded')).toBe('true');
    document.body.removeChild(w.el);
  });

  it('destroy() does not throw', () => {
    const w = createMultiSelection(makeField(), noValCtx(), vi.fn(), vi.fn(), [], null, false);
    expect(() => w.destroy()).not.toThrow();
  });
});
