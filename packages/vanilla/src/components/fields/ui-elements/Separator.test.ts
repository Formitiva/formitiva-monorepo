// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import createSeparator from './Separator';
import { createDefaultContext } from '../../../context/formitivaContext';
import type { DefinitionPropertyField } from '@formitiva/core';

function makeField(overrides: Record<string, unknown> = {}): DefinitionPropertyField {
  return { name: 'sep1', displayName: 'Separator', type: 'separator', ...overrides } as DefinitionPropertyField;
}

function ctx() {
  return { ...createDefaultContext(), fieldValidationMode: 'onSubmission' as const };
}

describe('createSeparator', () => {
  it('creates a div element', () => {
    const widget = createSeparator(makeField(), ctx(), vi.fn(), vi.fn(), null, null, false);
    expect(widget.el.tagName).toBe('DIV');
  });

  it('applies default thickness of 1px', () => {
    const widget = createSeparator(makeField(), ctx(), vi.fn(), vi.fn(), null, null, false);
    expect(widget.el.style.borderTop).toContain('1px solid');
  });

  it('applies custom thickness', () => {
    const widget = createSeparator(makeField({ thickness: 3 }), ctx(), vi.fn(), vi.fn(), null, null, false);
    expect(widget.el.style.borderTop).toContain('3px solid');
  });

  it('applies custom color', () => {
    const widget = createSeparator(makeField({ color: 'red' }), ctx(), vi.fn(), vi.fn(), null, null, false);
    expect(widget.el.style.borderTop).toContain('red');
  });

  it('applies default margin "8px 0"', () => {
    const widget = createSeparator(makeField(), ctx(), vi.fn(), vi.fn(), null, null, false);
    expect(widget.el.style.margin).toContain('8px');
  });

  it('applies custom numeric margin as px', () => {
    const widget = createSeparator(makeField({ margin: 16 }), ctx(), vi.fn(), vi.fn(), null, null, false);
    expect(widget.el.style.margin).toBe('16px');
  });

  it('applies custom string margin', () => {
    const widget = createSeparator(makeField({ margin: '2em 0' }), ctx(), vi.fn(), vi.fn(), null, null, false);
    expect(widget.el.style.margin).toContain('2em');
  });

  it('has height 0', () => {
    const widget = createSeparator(makeField(), ctx(), vi.fn(), vi.fn(), null, null, false);
    // happy-dom normalizes '0' to '0px'
    expect(widget.el.style.height).toMatch(/^0(px)?$/);
  });

  it('has width auto', () => {
    const widget = createSeparator(makeField(), ctx(), vi.fn(), vi.fn(), null, null, false);
    expect(widget.el.style.width).toBe('auto');
  });

  it('update() does not throw', () => {
    const widget = createSeparator(makeField(), ctx(), vi.fn(), vi.fn(), null, null, false);
    expect(() => widget.update(null, null, false)).not.toThrow();
  });

  it('destroy() does not throw', () => {
    const widget = createSeparator(makeField(), ctx(), vi.fn(), vi.fn(), null, null, false);
    expect(() => widget.destroy()).not.toThrow();
  });
});
