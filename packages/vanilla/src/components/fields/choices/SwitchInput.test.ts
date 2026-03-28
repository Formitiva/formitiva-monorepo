// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import createSwitchInput from './SwitchInput';
import { createDefaultContext } from '../../../context/formitivaContext';
import type { DefinitionPropertyField } from '@formitiva/core';

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'toggle', displayName: 'Enable feature', type: 'boolean', ...overrides } as DefinitionPropertyField;
}

function noValCtx() {
  return { ...createDefaultContext(), fieldValidationMode: 'onSubmission' as const };
}

describe('createSwitchInput', () => {
  it('creates a switch track element', () => {
    const widget = createSwitchInput(makeField(), noValCtx(), vi.fn(), vi.fn(), false, null, false);
    expect(widget.el.querySelector('[data-testid="switch"]')).not.toBeNull();
  });

  it('sets aria-checked="false" when initial value is false', () => {
    const widget = createSwitchInput(makeField(), noValCtx(), vi.fn(), vi.fn(), false, null, false);
    const track = widget.el.querySelector('[data-testid="switch"]') as HTMLElement;
    expect(track.getAttribute('aria-checked')).toBe('false');
  });

  it('sets aria-checked="true" when initial value is true', () => {
    const widget = createSwitchInput(makeField(), noValCtx(), vi.fn(), vi.fn(), true, null, false);
    const track = widget.el.querySelector('[data-testid="switch"]') as HTMLElement;
    expect(track.getAttribute('aria-checked')).toBe('true');
  });

  it('renders label with field.displayName', () => {
    const widget = createSwitchInput(makeField({ displayName: 'Dark mode' }), noValCtx(), vi.fn(), vi.fn(), false, null, false);
    expect(widget.el.textContent).toContain('Dark mode');
  });

  it('calls onChange with true when clicked while off', () => {
    const onChange = vi.fn();
    const widget = createSwitchInput(makeField(), noValCtx(), onChange, vi.fn(), false, null, false);
    const track = widget.el.querySelector('[data-testid="switch"]') as HTMLElement;
    track.dispatchEvent(new MouseEvent('click'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when clicked while on', () => {
    const onChange = vi.fn();
    const widget = createSwitchInput(makeField(), noValCtx(), onChange, vi.fn(), true, null, false);
    const track = widget.el.querySelector('[data-testid="switch"]') as HTMLElement;
    track.dispatchEvent(new MouseEvent('click'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('toggles on Space keydown', () => {
    const onChange = vi.fn();
    const widget = createSwitchInput(makeField(), noValCtx(), onChange, vi.fn(), false, null, false);
    const track = widget.el.querySelector('[data-testid="switch"]') as HTMLElement;
    track.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', cancelable: true }));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('toggles on Enter keydown', () => {
    const onChange = vi.fn();
    const widget = createSwitchInput(makeField(), noValCtx(), onChange, vi.fn(), false, null, false);
    const track = widget.el.querySelector('[data-testid="switch"]') as HTMLElement;
    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('track has role="switch"', () => {
    const widget = createSwitchInput(makeField(), noValCtx(), vi.fn(), vi.fn(), false, null, false);
    const track = widget.el.querySelector('[data-testid="switch"]') as HTMLElement;
    expect(track.getAttribute('role')).toBe('switch');
  });

  it('update() changes aria-checked', () => {
    const widget = createSwitchInput(makeField(), noValCtx(), vi.fn(), vi.fn(), false, null, false);
    widget.update(true, null, false);
    const track = widget.el.querySelector('[data-testid="switch"]') as HTMLElement;
    expect(track.getAttribute('aria-checked')).toBe('true');
  });

  it('destroy() does not throw', () => {
    const widget = createSwitchInput(makeField(), noValCtx(), vi.fn(), vi.fn(), false, null, false);
    expect(() => widget.destroy()).not.toThrow();
  });
});
