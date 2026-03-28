// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import createPasswordInput from './PasswordInput';
import { createDefaultContext } from '../../../context/formitivaContext';
import type { DefinitionPropertyField } from '@formitiva/core';

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'pwd', displayName: 'Password', type: 'password', ...overrides } as DefinitionPropertyField;
}

function noValCtx() {
  return { ...createDefaultContext(), fieldValidationMode: 'onSubmission' as const };
}

describe('createPasswordInput', () => {
  it('creates input[type="password"]', () => {
    const widget = createPasswordInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.querySelector('input[type="password"]')).not.toBeNull();
  });

  it('sets id to field.name', () => {
    const widget = createPasswordInput(makeField({ name: 'userPwd' }), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.querySelector('input')!.id).toBe('userPwd');
  });

  it('sets initial value', () => {
    const widget = createPasswordInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 'secret', null, false);
    expect((widget.el.querySelector('input') as HTMLInputElement).value).toBe('secret');
  });

  it('has a show/hide toggle button', () => {
    const widget = createPasswordInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    const btn = widget.el.querySelector('button');
    expect(btn).not.toBeNull();
  });

  it('toggle button aria-label is "Show password" initially', () => {
    const widget = createPasswordInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    const btn = widget.el.querySelector('button') as HTMLButtonElement;
    expect(btn.getAttribute('aria-label')).toContain('Show password');
  });

  it('clicking toggle reveals password (type becomes "text")', () => {
    const widget = createPasswordInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    const btn = widget.el.querySelector('button') as HTMLButtonElement;
    btn.click();
    expect(input.type).toBe('text');
  });

  it('clicking toggle again hides password (type becomes "password")', () => {
    const widget = createPasswordInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    const btn = widget.el.querySelector('button') as HTMLButtonElement;
    btn.click();
    btn.click();
    expect(input.type).toBe('password');
  });

  it('toggle button aria-label becomes "Hide password" when revealed', () => {
    const widget = createPasswordInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    const btn = widget.el.querySelector('button') as HTMLButtonElement;
    btn.click();
    expect(btn.getAttribute('aria-label')).toContain('Hide password');
  });

  it('disables input when disabled=true', () => {
    const widget = createPasswordInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, true);
    expect((widget.el.querySelector('input') as HTMLInputElement).disabled).toBe(true);
  });

  it('calls onChange on input event', () => {
    const onChange = vi.fn();
    const widget = createPasswordInput(makeField(), noValCtx(), onChange, vi.fn(), '', null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    input.value = 'newpwd';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith('newpwd');
  });

  it('destroy() does not throw', () => {
    const widget = createPasswordInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(() => widget.destroy()).not.toThrow();
  });
});
