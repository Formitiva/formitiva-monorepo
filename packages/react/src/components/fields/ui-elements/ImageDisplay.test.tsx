// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
afterEach(cleanup);
import ImageDisplay from './ImageDisplay';
import { FormitivaContext } from '../../../hooks/useFormitivaContext';
import type { FormitivaContextType, DefinitionPropertyField } from '@formitiva/core';

const mockCtx: FormitivaContextType = {
  definitionName: '',
  language: 'en',
  theme: 'light',
  formStyle: { container: {}, titleStyle: {} },
  fieldStyle: {},
  t: (s: string) => s,
  fieldValidationMode: 'onSubmission',
  displayInstanceName: false,
};

function Wrapper({ children }: { children: React.ReactNode }) {
  return <FormitivaContext.Provider value={mockCtx}>{children}</FormitivaContext.Provider>;
}

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'logo', displayName: 'Logo', type: 'image', ...overrides } as DefinitionPropertyField;
}

const IMG_URL = 'https://example.com/image.png';

describe('ImageDisplay (React)', () => {
  it('renders an img element when a URL is provided', () => {
    render(<ImageDisplay field={makeField()} value={IMG_URL} />, { wrapper: Wrapper });
    expect(document.querySelector('img')).not.toBeNull();
  });

  it('img alt comes from field.displayName', () => {
    render(<ImageDisplay field={makeField({ displayName: 'Company Logo' })} value={IMG_URL} />, { wrapper: Wrapper });
    expect(document.querySelector('img')!.alt).toBe('Company Logo');
  });

  it('img alt defaults to "Image" when displayName is empty', () => {
    render(<ImageDisplay field={makeField({ displayName: '' })} value={IMG_URL} />, { wrapper: Wrapper });
    expect(document.querySelector('img')!.alt).toBe('Image');
  });

  it('renders wrapper with data-testid="image-wrapper"', () => {
    render(<ImageDisplay field={makeField()} value={IMG_URL} />, { wrapper: Wrapper });
    expect(document.querySelector('[data-testid="image-wrapper"]')).not.toBeNull();
  });

  it('sets img width and height when both provided in field', () => {
    render(<ImageDisplay field={makeField({ width: 200, height: 100 } as any)} value={IMG_URL} />, { wrapper: Wrapper });
    const img = document.querySelector('img') as HTMLImageElement;
    expect(img.width).toBe(200);
    expect(img.height).toBe(100);
  });

  it('renders nothing when no URL is provided', () => {
    const { container } = render(<ImageDisplay field={makeField()} value="" />, { wrapper: Wrapper });
    expect(container.querySelector('img')).toBeNull();
  });

  it('uses field.defaultValue when value is empty', () => {
    render(<ImageDisplay field={makeField({ defaultValue: IMG_URL } as any)} value="" />, { wrapper: Wrapper });
    expect(document.querySelector('img')).not.toBeNull();
  });
});
