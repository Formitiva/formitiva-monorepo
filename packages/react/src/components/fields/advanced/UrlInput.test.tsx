// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
afterEach(cleanup);
import UrlInput from './UrlInput';
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
  return { name: 'website', displayName: 'Website', type: 'url', ...overrides } as DefinitionPropertyField;
}

describe('UrlInput (React)', () => {
  it('renders an input[type="url"]', () => {
    render(<UrlInput field={makeField()} value="" />, { wrapper: Wrapper });
    expect(document.querySelector('input[type="url"]')).not.toBeNull();
  });

  it('sets the input id to field.name', () => {
    render(<UrlInput field={makeField({ name: 'homepage' })} value="" />, { wrapper: Wrapper });
    expect(document.getElementById('homepage')).not.toBeNull();
  });

  it('renders a label containing field.displayName', () => {
    render(<UrlInput field={makeField({ displayName: 'Homepage' })} value="" />, { wrapper: Wrapper });
    expect(document.querySelector('label')?.textContent).toContain('Homepage');
  });

  it('sets defaultValue from value prop', () => {
    render(<UrlInput field={makeField()} value="https://example.com" />, { wrapper: Wrapper });
    expect((document.querySelector('input') as HTMLInputElement).defaultValue).toBe('https://example.com');
  });

  it('has placeholder "https://example.com"', () => {
    render(<UrlInput field={makeField()} value="" />, { wrapper: Wrapper });
    expect((document.querySelector('input') as HTMLInputElement).placeholder).toBe('https://example.com');
  });

  it('calls onChange when user types', () => {
    const onChange = vi.fn();
    render(<UrlInput field={makeField()} value="" onChange={onChange} />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'https://test.com' } });
    expect(onChange).toHaveBeenCalledWith('https://test.com');
  });

  it('does not crash when onChange is not provided', () => {
    render(<UrlInput field={makeField()} value="" />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    expect(() => fireEvent.change(input, { target: { value: 'https://x.com' } })).not.toThrow();
  });
});
