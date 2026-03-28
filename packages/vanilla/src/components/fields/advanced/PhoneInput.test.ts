// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import createPhoneInput from './PhoneInput';
import { createDefaultContext } from '../../../context/formitivaContext';
import type { DefinitionPropertyField } from '@formitiva/core';

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'phone', displayName: 'Phone', type: 'phone', ...overrides } as DefinitionPropertyField;
}

function noValCtx() {
  return { ...createDefaultContext(), fieldValidationMode: 'onSubmission' as const };
}

describe('createPhoneInput', () => {
  it('creates input[type="tel"]', () => {
    const widget = createPhoneInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.querySelector('input[type="tel"]')).not.toBeNull();
  });

  it('sets id to field.name', () => {
    const widget = createPhoneInput(makeField({ name: 'mobile' }), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.querySelector('input')!.id).toBe('mobile');
  });

  it('renders label with displayName', () => {
    const widget = createPhoneInput(makeField({ displayName: 'Mobile Number' }), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.textContent).toContain('Mobile Number');
  });

  it('sets initial value', () => {
    const widget = createPhoneInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '+1 555-0100', null, false);
    expect((widget.el.querySelector('input') as HTMLInputElement).value).toBe('+1 555-0100');
  });

  it('disables input when disabled=true', () => {
    const widget = createPhoneInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, true);
    expect((widget.el.querySelector('input') as HTMLInputElement).disabled).toBe(true);
  });

  it('calls onChange on input event', () => {
    const onChange = vi.fn();
    const widget = createPhoneInput(makeField(), noValCtx(), onChange, vi.fn(), '', null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    input.value = '555-1234';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith('555-1234');
  });

  it('destroy() does not throw', () => {
    const widget = createPhoneInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(() => widget.destroy()).not.toThrow();
  });
});
