// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import createDropdownInput from './DropdownInput';
import { createDefaultContext } from '../../../context/formitivaContext';
import type { DefinitionPropertyField } from '@formitiva/core';

const OPTIONS = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
];

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'fruit', displayName: 'Favourite fruit', type: 'dropdown', options: OPTIONS, ...overrides } as DefinitionPropertyField;
}

function noValCtx() {
  return { ...createDefaultContext(), fieldValidationMode: 'onSubmission' as const };
}

describe('createDropdownInput', () => {
  it('creates a combobox control element', () => {
    const widget = createDropdownInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 'apple', null, false);
    const control = widget.el.querySelector('[role="combobox"]');
    expect(control).not.toBeNull();
  });

  it('sets aria-haspopup="listbox"', () => {
    const widget = createDropdownInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 'apple', null, false);
    const control = widget.el.querySelector('[role="combobox"]') as HTMLElement;
    expect(control.getAttribute('aria-haspopup')).toBe('listbox');
  });

  it('displays the label text of the current value', () => {
    const widget = createDropdownInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 'banana', null, false);
    const control = widget.el.querySelector('[role="combobox"]') as HTMLElement;
    expect(control.textContent).toContain('Banana');
  });

  it('renders a label with field.displayName', () => {
    const widget = createDropdownInput(makeField({ displayName: 'Pick fruit' }), noValCtx(), vi.fn(), vi.fn(), 'apple', null, false);
    expect(widget.el.textContent).toContain('Pick fruit');
  });

  it('opens popup and shows options on click', () => {
    const widget = createDropdownInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 'apple', null, false);
    document.body.appendChild(widget.el);
    const control = widget.el.querySelector('[role="combobox"]') as HTMLElement;
    control.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const popup = document.querySelector('[role="listbox"]');
    expect(popup).not.toBeNull();
    document.body.removeChild(widget.el);
    document.getElementById('popup-root')?.remove();
  });

  it('calls onChange when an option is selected', () => {
    const onChange = vi.fn();
    const widget = createDropdownInput(makeField(), noValCtx(), onChange, vi.fn(), 'apple', null, false);
    document.body.appendChild(widget.el);
    const control = widget.el.querySelector('[role="combobox"]') as HTMLElement;
    control.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    // The popup options use mousedown event
    const cherryOption = Array.from(document.querySelectorAll('[role="option"]'))
      .find(el => el.textContent?.includes('Cherry')) as HTMLElement | undefined;
    cherryOption?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith('cherry');
    document.body.removeChild(widget.el);
    document.getElementById('popup-root')?.remove();
  });

  it('update() reflects the new value in control text', () => {
    const widget = createDropdownInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 'apple', null, false);
    widget.update('cherry', null, false);
    const control = widget.el.querySelector('[role="combobox"]') as HTMLElement;
    expect(control.textContent).toContain('Cherry');
  });

  it('destroy() does not throw', () => {
    const widget = createDropdownInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 'apple', null, false);
    expect(() => widget.destroy()).not.toThrow();
  });
});
