// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import createUrlInput from './UrlInput';
import { createDefaultContext } from '../../../context/formitivaContext';
import type { DefinitionPropertyField } from '@formitiva/core';

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'website', displayName: 'Website', type: 'url', ...overrides } as DefinitionPropertyField;
}

function noValCtx() {
  return { ...createDefaultContext(), fieldValidationMode: 'onSubmission' as const };
}

describe('createUrlInput', () => {
  it('creates input[type="url"]', () => {
    const widget = createUrlInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.querySelector('input[type="url"]')).not.toBeNull();
  });

  it('sets id to field.name', () => {
    const widget = createUrlInput(makeField({ name: 'siteUrl' }), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.querySelector('input')!.id).toBe('siteUrl');
  });

  it('renders label with displayName', () => {
    const widget = createUrlInput(makeField({ displayName: 'Your Website' }), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(widget.el.textContent).toContain('Your Website');
  });

  it('sets initial value', () => {
    const widget = createUrlInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 'https://example.com', null, false);
    expect((widget.el.querySelector('input') as HTMLInputElement).value).toBe('https://example.com');
  });

  it('disables input when disabled=true', () => {
    const widget = createUrlInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, true);
    expect((widget.el.querySelector('input') as HTMLInputElement).disabled).toBe(true);
  });

  it('calls onChange on input event', () => {
    const onChange = vi.fn();
    const widget = createUrlInput(makeField(), noValCtx(), onChange, vi.fn(), '', null, false);
    const input = widget.el.querySelector('input') as HTMLInputElement;
    input.value = 'https://site.io';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith('https://site.io');
  });

  it('destroy() does not throw', () => {
    const widget = createUrlInput(makeField(), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    expect(() => widget.destroy()).not.toThrow();
  });
});
