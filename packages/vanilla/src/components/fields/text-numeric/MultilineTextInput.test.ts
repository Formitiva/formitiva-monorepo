// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import createMultilineTextInput from './MultilineTextInput';
import { createDefaultContext } from '../../../context/formitivaContext';
import type { DefinitionPropertyField } from '@formitiva/core';

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'bio', displayName: 'Biography', type: 'multiline', ...overrides } as DefinitionPropertyField;
}

function noValCtx() {
  return { ...createDefaultContext(), fieldValidationMode: 'onSubmission' as const };
}

describe('createMultilineTextInput', () => {
  it('creates a textarea element', () => {
    const widget = createMultilineTextInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.querySelector('textarea')).not.toBeNull();
  });

  it('sets the textarea id to field.name', () => {
    const widget = createMultilineTextInput(makeField({ name: 'bio' }), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.querySelector('textarea')!.id).toBe('bio');
  });

  it('sets initial value', () => {
    const widget = createMultilineTextInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 'Hello world', null, false);
    expect((widget.el.querySelector('textarea') as HTMLTextAreaElement).value).toBe('Hello world');
  });

  it('renders a label with field.displayName', () => {
    const widget = createMultilineTextInput(makeField({ displayName: 'Your Bio' }), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.textContent).toContain('Your Bio');
  });

  it('disables the textarea when disabled=true', () => {
    const widget = createMultilineTextInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, true);
    expect((widget.el.querySelector('textarea') as HTMLTextAreaElement).disabled).toBe(true);
  });

  it('calls onChange when user types', () => {
    const onChange = vi.fn();
    const widget = createMultilineTextInput(makeField(), noValCtx(), onChange, vi.fn(), '', null, false);
    const textarea = widget.el.querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = 'typed text';
    textarea.dispatchEvent(new Event('input'));
    expect(onChange).toHaveBeenCalledWith('typed text');
  });

  it('sets resize style to vertical', () => {
    const widget = createMultilineTextInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    const textarea = widget.el.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.style.resize).toBe('vertical');
  });

  it('uses field.minHeight when specified', () => {
    const widget = createMultilineTextInput(makeField({ minHeight: '120px' }), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    const textarea = widget.el.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.style.minHeight).toBe('120px');
  });

  it('update() changes the textarea value', () => {
    const widget = createMultilineTextInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 'old', null, false);
    widget.update('new value', null, false);
    const textarea = widget.el.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe('new value');
  });

  it('destroy() does not throw', () => {
    const widget = createMultilineTextInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(() => widget.destroy()).not.toThrow();
  });
});
