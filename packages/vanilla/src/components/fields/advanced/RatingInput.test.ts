// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import createRatingInput from './RatingInput';
import { createDefaultContext } from '../../../context/formitivaContext';
import type { DefinitionPropertyField } from '@formitiva/core';

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'rating', displayName: 'Rating', type: 'rating', ...overrides } as DefinitionPropertyField;
}

function noValCtx() {
  return { ...createDefaultContext(), fieldValidationMode: 'onSubmission' as const };
}

describe('createRatingInput', () => {
  it('renders 5 stars by default', () => {
    const widget = createRatingInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 0, null, false);
    expect(widget.el.querySelectorAll('[role="radio"]').length).toBe(5);
  });

  it('renders custom number of stars from field.max', () => {
    const widget = createRatingInput(makeField({ max: 3 } as any), noValCtx(), vi.fn(), vi.fn(), 0, null, false);
    expect(widget.el.querySelectorAll('[role="radio"]').length).toBe(3);
  });

  it('radiogroup has role="radiogroup"', () => {
    const widget = createRatingInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 0, null, false);
    expect(widget.el.querySelector('[role="radiogroup"]')).not.toBeNull();
  });

  it('filled stars are gold when initialValue=3', () => {
    const widget = createRatingInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 3, null, false);
    const stars = Array.from(widget.el.querySelectorAll('[role="radio"]')) as HTMLElement[];
    expect(stars[0].style.color).toBe('gold');
    expect(stars[2].style.color).toBe('gold');
    expect(stars[3].style.color).toBe('lightgray');
  });

  it('clicking a star calls onChange with that rating', () => {
    const onChange = vi.fn();
    const widget = createRatingInput(makeField(), noValCtx(), onChange, vi.fn(), 0, null, false);
    const stars = Array.from(widget.el.querySelectorAll('[role="radio"]')) as HTMLElement[];
    stars[2].click();
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('clicking a star updates star colors', () => {
    const widget = createRatingInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 0, null, false);
    const stars = Array.from(widget.el.querySelectorAll('[role="radio"]')) as HTMLElement[];
    stars[1].click();
    expect(stars[0].style.color).toBe('gold');
    expect(stars[1].style.color).toBe('gold');
    expect(stars[2].style.color).toBe('lightgray');
  });

  it('stars have aria-label "Rating N"', () => {
    const widget = createRatingInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 0, null, false);
    const stars = Array.from(widget.el.querySelectorAll('[role="radio"]')) as HTMLElement[];
    expect(stars[0].getAttribute('aria-label')).toBe('Rating 1');
    expect(stars[4].getAttribute('aria-label')).toBe('Rating 5');
  });

  it('uses the default star character ★', () => {
    const widget = createRatingInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 0, null, false);
    const stars = Array.from(widget.el.querySelectorAll('[role="radio"]')) as HTMLElement[];
    expect(stars[0].textContent).toBe('\u2605');
  });

  it('does not call onChange when disabled', () => {
    const onChange = vi.fn();
    const widget = createRatingInput(makeField(), noValCtx(), onChange, vi.fn(), 0, null, true);
    const stars = Array.from(widget.el.querySelectorAll('[role="radio"]')) as HTMLElement[];
    stars[2].click();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('destroy() does not throw', () => {
    const widget = createRatingInput(makeField(), noValCtx(), vi.fn(), vi.fn(), 0, null, false);
    expect(() => widget.destroy()).not.toThrow();
  });
});
