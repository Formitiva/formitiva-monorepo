// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
afterEach(cleanup);
import ColorInput from './ColorInput';
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
  return { name: 'bg', displayName: 'Background', type: 'color', ...overrides } as DefinitionPropertyField;
}

describe('ColorInput (React)', () => {
  it('renders a select element with predefined colors', () => {
    render(<ColorInput field={makeField()} value="#ff0000" />, { wrapper: Wrapper });
    expect(document.querySelector('select')).not.toBeNull();
  });

  it('select id is field.name', () => {
    render(<ColorInput field={makeField({ name: 'theme' })} value="#ff0000" />, { wrapper: Wrapper });
    expect(document.querySelector('select')!.id).toBe('theme');
  });

  it('renders input[type="color"] with id=field.name+"-color"', () => {
    render(<ColorInput field={makeField({ name: 'theme' })} value="#ff0000" />, { wrapper: Wrapper });
    const colorInput = document.querySelector('input[type="color"]') as HTMLInputElement;
    expect(colorInput).not.toBeNull();
    expect(colorInput.id).toBe('theme-color');
  });

  it('renders label with displayName', () => {
    render(<ColorInput field={makeField({ displayName: 'Theme Color' })} value="#ff0000" />, { wrapper: Wrapper });
    expect(document.querySelector('label')?.textContent).toContain('Theme Color');
  });

  it('select has predefined color options', () => {
    render(<ColorInput field={makeField()} value="#000000" />, { wrapper: Wrapper });
    const select = document.querySelector('select') as HTMLSelectElement;
    expect(select.options.length).toBeGreaterThan(0);
  });

  it('does not crash with null value (normalizes to #000000)', () => {
    expect(() =>
      render(<ColorInput field={makeField()} value={null as any} />, { wrapper: Wrapper })
    ).not.toThrow();
  });

  it('does not crash with invalid color value', () => {
    expect(() =>
      render(<ColorInput field={makeField()} value="notacolor" />, { wrapper: Wrapper })
    ).not.toThrow();
  });
});
