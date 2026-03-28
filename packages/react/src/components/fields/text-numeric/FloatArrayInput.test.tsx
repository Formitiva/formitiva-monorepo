// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
afterEach(cleanup);
import FloatArrayInput from './FloatArrayInput';
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
  return { name: 'floats', displayName: 'Floats', type: 'float-array', ...overrides } as DefinitionPropertyField;
}

describe('FloatArrayInput (React)', () => {
  it('renders an input[type="text"]', () => {
    render(<FloatArrayInput field={makeField()} value={[1.1, 2.2, 3.3]} />, { wrapper: Wrapper });
    expect(document.querySelector('input[type="text"]')).not.toBeNull();
  });

  it('input id is field.name', () => {
    render(<FloatArrayInput field={makeField({ name: 'scores' })} value={[]} />, { wrapper: Wrapper });
    expect(document.querySelector('input')!.id).toBe('scores');
  });

  it('displays float array values as comma-separated string', () => {
    render(<FloatArrayInput field={makeField()} value={[1.5, 2.5]} />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    expect(input.defaultValue).toBe('1.5, 2.5');
  });

  it('renders label with displayName', () => {
    render(<FloatArrayInput field={makeField({ displayName: 'Measurements' })} value={[]} />, { wrapper: Wrapper });
    expect(document.querySelector('label')?.textContent).toContain('Measurements');
  });

  it('does not crash with empty array', () => {
    expect(() =>
      render(<FloatArrayInput field={makeField()} value={[]} />, { wrapper: Wrapper })
    ).not.toThrow();
  });

  it('does not crash with null value', () => {
    expect(() =>
      render(<FloatArrayInput field={makeField()} value={null as any} />, { wrapper: Wrapper })
    ).not.toThrow();
  });
});
