import { describe, it, expect } from 'vitest';
import { combineClasses, CSS_CLASSES } from './cssClasses';

describe('CSS_CLASSES', () => {
  it('has expected BEM class names', () => {
    expect(CSS_CLASSES.field).toBe('formitiva-field');
    expect(CSS_CLASSES.label).toBe('formitiva-label');
    expect(CSS_CLASSES.input).toBe('formitiva-input');
    expect(CSS_CLASSES.button).toBe('formitiva-button');
    expect(CSS_CLASSES.description).toBe('formitiva-description');
  });
});

describe('combineClasses', () => {
  it('joins multiple strings with a space', () => {
    expect(combineClasses('a', 'b', 'c')).toBe('a b c');
  });

  it('filters out null values', () => {
    expect(combineClasses('a', null, 'b')).toBe('a b');
  });

  it('filters out undefined values', () => {
    expect(combineClasses('a', undefined, 'b')).toBe('a b');
  });

  it('filters out false values', () => {
    expect(combineClasses('a', false, 'b')).toBe('a b');
  });

  it('includes object keys whose value is true', () => {
    expect(combineClasses({ active: true, disabled: false })).toBe('active');
  });

  it('excludes object keys whose value is false', () => {
    expect(combineClasses({ a: false, b: false })).toBe('');
  });

  it('handles a mix of strings and conditional objects', () => {
    expect(combineClasses('base', { active: true, hidden: false }, 'extra')).toBe('base active extra');
  });

  it('returns an empty string when called with no arguments', () => {
    expect(combineClasses()).toBe('');
  });

  it('returns an empty string when all values are falsy', () => {
    expect(combineClasses(null, undefined, false)).toBe('');
  });
});
