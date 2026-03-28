// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import createTextInput from './TextInput';
import createEmailInput from '../advanced/EmailInput';
import createIntegerInput from './IntegerInput';
import createFloatInput from './FloatInput';
import createPhoneInput from '../advanced/PhoneInput';
import createUrlInput from '../advanced/UrlInput';
import { createDefaultContext } from '../../../context/formitivaContext';
import type { DefinitionPropertyField } from '@formitiva/core';

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'field1', displayName: 'Field One', type: 'string', ...overrides } as DefinitionPropertyField;
}

// Context with no auto-validation (for change-callback tests)
function noValCtx() {
  return { ...createDefaultContext(), fieldValidationMode: 'onSubmission' as const };
}

// ─── createTextInput ─────────────────────────────────────────────────────────

describe('createTextInput', () => {
  it('creates a container element with a text input', () => {
    const widget = createTextInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    const input = widget.el.querySelector('input');
    expect(input).not.toBeNull();
    expect(input!.type).toBe('text');
  });

  it('sets the input id to field.name', () => {
    const widget = createTextInput(makeField({ name: 'myField' }), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.querySelector('input')!.id).toBe('myField');
  });

  it('sets the initial value', () => {
    const widget = createTextInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 'hello world', null, false);
    expect((widget.el.querySelector('input') as HTMLInputElement).value).toBe('hello world');
  });

  it('renders a label containing the display name', () => {
    const widget = createTextInput(makeField({ displayName: 'My Label' }), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    const label = widget.el.querySelector('label');
    expect(label?.textContent).toContain('My Label');
  });

  it('disables the input when disabled=true', () => {
    const widget = createTextInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, true);
    expect((widget.el.querySelector('input') as HTMLInputElement).disabled).toBe(true);
  });

  it('sets placeholder text', () => {
    const widget = createTextInput(makeField({ placeholder: 'Type here...' }), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect((widget.el.querySelector('input') as HTMLInputElement).placeholder).toBe('Type here...');
  });

  it('aria-invalid is false when there is no error', () => {
    const widget = createTextInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect((widget.el.querySelector('input') as HTMLInputElement).getAttribute('aria-invalid')).toBe('false');
  });

  it('calls onChange when user types (input event)', () => {
    const onChange = vi.fn();
    const widget = createTextInput(makeField(), noValCtx(), onChange, vi.fn(), '', null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    input.value = 'typed';
    input.dispatchEvent(new Event('input'));
    expect(onChange).toHaveBeenCalledWith('typed');
  });

  it('does not call onChange on non-input events', () => {
    const onChange = vi.fn();
    createTextInput(makeField(), noValCtx(), onChange, vi.fn(), 'initial', null, false);
    // Mount without any events — onChange should not have been called
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onError for a required field with empty value in onEdit mode', () => {
    const ctx = { ...createDefaultContext(), fieldValidationMode: 'onEdit' as const };
    const onError = vi.fn();
    createTextInput(makeField({ required: true }), ctx, vi.fn(), onError, '', null, false);
    expect(onError).toHaveBeenCalledWith(expect.any(String));
    expect(onError.mock.calls[0]![0]).toBeTruthy();
  });

  it('does not call onError for a non-required field in onEdit mode', () => {
    const ctx = { ...createDefaultContext(), fieldValidationMode: 'onEdit' as const };
    const onError = vi.fn();
    createTextInput(makeField({ required: false }), ctx, vi.fn(), onError, '', null, false);
    expect(onError).not.toHaveBeenCalled();
  });

  it('update() syncs a new value to the input', () => {
    const widget = createTextInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 'old', null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    widget.update('updated', null, false);
    expect(input.value).toBe('updated');
  });

  it('update() enables and disables the input', () => {
    const widget = createTextInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    widget.update('', null, true);
    expect(input.disabled).toBe(true);
    widget.update('', null, false);
    expect(input.disabled).toBe(false);
  });

  it('destroy() does not throw', () => {
    const widget = createTextInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(() => widget.destroy()).not.toThrow();
  });

  it('onChange is not called again after destroy()', () => {
    const onChange = vi.fn();
    const widget = createTextInput(makeField(), noValCtx(), onChange, vi.fn(), '', null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    widget.destroy();
    input.value = 'after destroy';
    input.dispatchEvent(new Event('input'));
    expect(onChange).not.toHaveBeenCalled();
  });
});

// ─── Input type variants (all delegate to createSimpleField) ──────────────────

describe('createEmailInput', () => {
  it('creates an input[type="email"]', () => {
    const widget = createEmailInput(makeField({ type: 'email' }), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.querySelector('input')?.type).toBe('email');
  });

  it('sets initial value', () => {
    const widget = createEmailInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 'user@example.com', null, false);
    expect((widget.el.querySelector('input') as HTMLInputElement).value).toBe('user@example.com');
  });

  it('calls onChange on input event', () => {
    const onChange = vi.fn();
    const widget = createEmailInput(makeField(), noValCtx(), onChange, vi.fn(), '', null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    input.value = 'new@example.com';
    input.dispatchEvent(new Event('input'));
    expect(onChange).toHaveBeenCalledWith('new@example.com');
  });
});

describe('createIntegerInput', () => {
  it('creates an input[type="text"] with number class', () => {
    const widget = createIntegerInput(makeField({ type: 'int' }), noValCtx(), vi.fn(), vi.fn(), 42, null, false);
    const input = widget.el.querySelector('input');
    expect(input?.type).toBe('text');
    expect(input?.value).toBe('42');
  });

  it('calls onChange on input event', () => {
    const onChange = vi.fn();
    const widget = createIntegerInput(makeField(), noValCtx(), onChange, vi.fn(), 0, null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    input.value = '100';
    input.dispatchEvent(new Event('input'));
    expect(onChange).toHaveBeenCalledWith('100');
  });
});

describe('createFloatInput', () => {
  it('creates an input with float value', () => {
    const widget = createFloatInput(makeField({ type: 'float' }), noValCtx(), vi.fn(), vi.fn(), 3.14, null, false);
    expect((widget.el.querySelector('input') as HTMLInputElement).value).toBe('3.14');
  });
});

describe('createPhoneInput', () => {
  it('creates an input[type="tel"]', () => {
    const widget = createPhoneInput(makeField({ type: 'phone' }), noValCtx(), vi.fn(), vi.fn(), '+1234567890', null, false);
    expect(widget.el.querySelector('input')?.type).toBe('tel');
    expect((widget.el.querySelector('input') as HTMLInputElement).value).toBe('+1234567890');
  });
});

describe('createUrlInput', () => {
  it('creates an input[type="url"]', () => {
    const widget = createUrlInput(makeField({ type: 'url' }), noValCtx(), vi.fn(), vi.fn(), 'https://example.com', null, false);
    expect(widget.el.querySelector('input')?.type).toBe('url');
    expect((widget.el.querySelector('input') as HTMLInputElement).value).toBe('https://example.com');
  });
});
