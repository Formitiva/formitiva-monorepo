// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import createDescription from './Description';
import createSeparator from './Separator';
import { createDefaultContext } from '../../../context/formitivaContext';
import type { DefinitionPropertyField } from '@formitiva/core';

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'desc1', displayName: 'Description', type: 'description', ...overrides } as DefinitionPropertyField;
}

// ─── createDescription ────────────────────────────────────────────────────────

describe('createDescription', () => {
  it('creates a DOM element', () => {
    const widget = createDescription(makeField({ displayText: 'Hello' } as DefinitionPropertyField), createDefaultContext(), vi.fn(), vi.fn(), null, null, false);
    expect(widget.el).toBeDefined();
    expect(widget.el.tagName.toLowerCase()).toBe('div');
  });

  it('renders single-line text content', () => {
    const widget = createDescription(makeField({ displayText: 'Welcome to the form!' } as DefinitionPropertyField), createDefaultContext(), vi.fn(), vi.fn(), null, null, false);
    // Description replaces spaces with  ; normalise before comparing
    const text = (widget.el.textContent ?? '').replace(/\u00A0/g, ' ');
    expect(text).toContain('Welcome to the form!');
  });

  it('renders an array of strings joined into content', () => {
    const widget = createDescription(makeField({ displayText: ['Line one', 'Line two'] } as unknown as DefinitionPropertyField), createDefaultContext(), vi.fn(), vi.fn(), null, null, false);
    const text = (widget.el.textContent ?? '').replace(/\u00A0/g, ' ');
    expect(text).toContain('Line one');
    expect(text).toContain('Line two');
  });

  it('creates separate child divs for multi-line text', () => {
    const widget = createDescription(makeField({ displayText: 'First\nSecond\nThird' } as DefinitionPropertyField), createDefaultContext(), vi.fn(), vi.fn(), null, null, false);
    const divs = widget.el.querySelectorAll('div');
    expect(divs.length).toBeGreaterThanOrEqual(3);
  });

  it('renders HTML when allowHtml=true', () => {
    const widget = createDescription(
      makeField({ displayText: '<strong>Bold</strong>' } as DefinitionPropertyField),
      createDefaultContext(),
      vi.fn(), vi.fn(), null, null, false
    );
    // allowHtml defaults to false — HTML is escaped
    expect(widget.el.querySelector('strong')).toBeNull();
  });

  it('renders raw HTML when allowHtml=true', () => {
    const widget = createDescription(
      makeField({ displayText: '<em>Italic</em>', allowHtml: true } as unknown as DefinitionPropertyField),
      createDefaultContext(),
      vi.fn(), vi.fn(), null, null, false
    );
    expect(widget.el.querySelector('em')).not.toBeNull();
    expect(widget.el.querySelector('em')!.textContent).toBe('Italic');
  });

  it('applies textAlign style', () => {
    const widget = createDescription(
      makeField({ displayText: 'Centered', textAlign: 'center' } as unknown as DefinitionPropertyField),
      createDefaultContext(),
      vi.fn(), vi.fn(), null, null, false
    );
    expect(widget.el.style.textAlign).toBe('center');
  });

  it('calls ctx.t() on the display text', () => {
    const ctx = { ...createDefaultContext(), t: vi.fn((s: string) => s) };
    createDescription(makeField({ displayText: 'translatable' } as DefinitionPropertyField), ctx, vi.fn(), vi.fn(), null, null, false);
    expect(ctx.t).toHaveBeenCalledWith('translatable');
  });

  it('update() is a no-op and does not throw', () => {
    const widget = createDescription(makeField({ displayText: 'text' } as DefinitionPropertyField), createDefaultContext(), vi.fn(), vi.fn(), null, null, false);
    expect(() => widget.update('new text', null, false)).not.toThrow();
  });

  it('destroy() is a no-op and does not throw', () => {
    const widget = createDescription(makeField({ displayText: 'text' } as DefinitionPropertyField), createDefaultContext(), vi.fn(), vi.fn(), null, null, false);
    expect(() => widget.destroy()).not.toThrow();
  });

  it('handles empty displayText', () => {
    const widget = createDescription(makeField({ displayText: '' } as DefinitionPropertyField), createDefaultContext(), vi.fn(), vi.fn(), null, null, false);
    expect(widget.el).toBeDefined();
  });
});

// ─── createSeparator ─────────────────────────────────────────────────────────

describe('createSeparator', () => {
  it('creates a div element', () => {
    const widget = createSeparator(makeField(), createDefaultContext(), vi.fn(), vi.fn(), null, null, false);
    expect(widget.el.tagName.toLowerCase()).toBe('div');
  });

  it('applies border-top with the given thickness', () => {
    const field = { ...makeField(), thickness: 3 } as unknown as DefinitionPropertyField;
    const widget = createSeparator(field, createDefaultContext(), vi.fn(), vi.fn(), null, null, false);
    expect(widget.el.style.borderTop).toContain('3px');
  });

  it('applies margin style', () => {
    const field = { ...makeField(), margin: '16px 0' } as unknown as DefinitionPropertyField;
    const widget = createSeparator(field, createDefaultContext(), vi.fn(), vi.fn(), null, null, false);
    // happy-dom normalises '16px 0' → '16px 0px'
    expect(widget.el.style.margin).toContain('16px');
  });

  it('applies a custom color', () => {
    const field = { ...makeField(), color: '#ff0000' } as unknown as DefinitionPropertyField;
    const widget = createSeparator(field, createDefaultContext(), vi.fn(), vi.fn(), null, null, false);
    expect(widget.el.style.borderTop).toContain('#ff0000');
  });

  it('update() and destroy() are no-ops and do not throw', () => {
    const widget = createSeparator(makeField(), createDefaultContext(), vi.fn(), vi.fn(), null, null, false);
    expect(() => widget.update(null, null, false)).not.toThrow();
    expect(() => widget.destroy()).not.toThrow();
  });
});
