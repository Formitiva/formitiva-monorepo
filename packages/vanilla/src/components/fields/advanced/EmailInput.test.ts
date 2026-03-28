// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import createEmailInput from './EmailInput';
import { createDefaultContext } from '../../../context/formitivaContext';
import type { DefinitionPropertyField } from '@formitiva/core';

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'email', displayName: 'Email', type: 'email', ...overrides } as DefinitionPropertyField;
}

function noValCtx() {
  return { ...createDefaultContext(), fieldValidationMode: 'onSubmission' as const };
}

describe('createEmailInput', () => {
  it('creates input[type="email"]', () => {
    const widget = createEmailInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.querySelector('input[type="email"]')).not.toBeNull();
  });

  it('sets id to field.name', () => {
    const widget = createEmailInput(makeField({ name: 'userEmail' }), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.querySelector('input')!.id).toBe('userEmail');
  });

  it('renders label with displayName', () => {
    const widget = createEmailInput(makeField({ displayName: 'Your Email' }), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.textContent).toContain('Your Email');
  });

  it('sets initial value', () => {
    const widget = createEmailInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 'test@example.com', null, false);
    expect((widget.el.querySelector('input') as HTMLInputElement).value).toBe('test@example.com');
  });

  it('disables input when disabled=true', () => {
    const widget = createEmailInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, true);
    expect((widget.el.querySelector('input') as HTMLInputElement).disabled).toBe(true);
  });

  it('calls onChange on input event', () => {
    const onChange = vi.fn();
    const widget = createEmailInput(makeField(), noValCtx(), onChange, vi.fn(), '', null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    input.value = 'a@b.com';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith('a@b.com');
  });

  it('destroy() does not throw', () => {
    const widget = createEmailInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(() => widget.destroy()).not.toThrow();
  });
});
