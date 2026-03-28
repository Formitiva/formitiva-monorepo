// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import createImageDisplay from './ImageDisplay';
import { createDefaultContext } from '../../../context/formitivaContext';
import type { DefinitionPropertyField } from '@formitiva/core';

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'logo', displayName: 'Logo', type: 'image', ...overrides } as DefinitionPropertyField;
}

function noValCtx() {
  return { ...createDefaultContext(), fieldValidationMode: 'onSubmission' as const };
}

const IMG_URL = 'https://example.com/image.png';

describe('createImageDisplay', () => {
  it('renders an img element when a URL is provided', () => {
    const w = createImageDisplay(makeField(), noValCtx(), vi.fn(), vi.fn(), IMG_URL, null, false);
    expect(w.el.querySelector('img')).not.toBeNull();
  });

  it('img alt comes from field.displayName', () => {
    const w = createImageDisplay(makeField({ displayName: 'Company Logo' }), noValCtx(), vi.fn(), vi.fn(), IMG_URL, null, false);
    expect(w.el.querySelector('img')!.alt).toBe('Company Logo');
  });

  it('img alt defaults to "Image" when displayName is empty', () => {
    const w = createImageDisplay(makeField({ displayName: '' }), noValCtx(), vi.fn(), vi.fn(), IMG_URL, null, false);
    expect(w.el.querySelector('img')!.alt).toBe('Image');
  });

  it('renders wrapper with data-testid="image-wrapper"', () => {
    const w = createImageDisplay(makeField(), noValCtx(), vi.fn(), vi.fn(), IMG_URL, null, false);
    expect(w.el.querySelector('[data-testid="image-wrapper"]')).not.toBeNull();
  });

  it('sets img width and height when both are provided in field', () => {
    const w = createImageDisplay(makeField({ width: 200, height: 100 } as any), noValCtx(), vi.fn(), vi.fn(), IMG_URL, null, false);
    const img = w.el.querySelector('img') as HTMLImageElement;
    expect(img.width).toBe(200);
    expect(img.height).toBe(100);
  });

  it('sets img width only when field.width provided without height', () => {
    const w = createImageDisplay(makeField({ width: 300 } as any), noValCtx(), vi.fn(), vi.fn(), IMG_URL, null, false);
    const img = w.el.querySelector('img') as HTMLImageElement;
    expect(img.width).toBe(300);
  });

  it('uses field.defaultValue when initialValue is empty', () => {
    const w = createImageDisplay(makeField({ defaultValue: IMG_URL } as any), noValCtx(), vi.fn(), vi.fn(), '', null, false);
    const img = w.el.querySelector('img') as HTMLImageElement;
    expect(img).not.toBeNull();
  });

  it('destroy() does not throw', () => {
    const w = createImageDisplay(makeField(), noValCtx(), vi.fn(), vi.fn(), IMG_URL, null, false);
    expect(() => w.destroy()).not.toThrow();
  });
});
