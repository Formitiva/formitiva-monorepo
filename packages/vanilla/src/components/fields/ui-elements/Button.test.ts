// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import createButton from './Button';
import { createDefaultContext } from '../../../context/formitivaContext';
import { CSS_CLASSES } from '@formitiva/core';
import type { DefinitionPropertyField } from '@formitiva/core';

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'submit', displayName: 'Submit', type: 'button', ...overrides } as DefinitionPropertyField;
}

function noValCtx() {
  return { ...createDefaultContext(), fieldValidationMode: 'onSubmission' as const };
}

describe('createButton', () => {
  it('renders a button element', () => {
    const w = createButton(makeField(), noValCtx(), {}, vi.fn(), vi.fn());
    expect(w.el.querySelector('button')).not.toBeNull();
  });

  it('button has CSS_CLASSES.button class', () => {
    const w = createButton(makeField(), noValCtx(), {}, vi.fn(), vi.fn());
    const btn = w.el.querySelector('button') as HTMLButtonElement;
    expect(btn.className).toContain(CSS_CLASSES.button);
  });

  it('button text comes from field.displayName', () => {
    const w = createButton(makeField({ displayName: 'Send' }), noValCtx(), {}, vi.fn(), vi.fn());
    const btn = w.el.querySelector('button') as HTMLButtonElement;
    expect(btn.textContent).toContain('Send');
  });

  it('uses field.buttonText over field.displayName when provided', () => {
    const w = createButton(makeField({ buttonText: 'Click Me', displayName: 'Submit' } as any), noValCtx(), {}, vi.fn(), vi.fn());
    const btn = w.el.querySelector('button') as HTMLButtonElement;
    expect(btn.textContent).toContain('Click Me');
  });

  it('aria-label is set from the label text', () => {
    const w = createButton(makeField({ displayName: 'Go' }), noValCtx(), {}, vi.fn(), vi.fn());
    const btn = w.el.querySelector('button') as HTMLButtonElement;
    expect(btn.getAttribute('aria-label')).toBe('Go');
  });

  it('button is not disabled initially', () => {
    const w = createButton(makeField(), noValCtx(), {}, vi.fn(), vi.fn());
    const btn = w.el.querySelector('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it('update() disables button when disabled=true', () => {
    const w = createButton(makeField(), noValCtx(), {}, vi.fn(), vi.fn());
    w.update(null, null, true);
    const btn = w.el.querySelector('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('destroy() does not throw', () => {
    const w = createButton(makeField(), noValCtx(), {}, vi.fn(), vi.fn());
    expect(() => w.destroy()).not.toThrow();
  });
});
