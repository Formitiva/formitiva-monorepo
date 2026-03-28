// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
afterEach(cleanup);
import IntegerInput from './IntegerInput';
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
  return { name: 'age', displayName: 'Age', type: 'integer', ...overrides } as DefinitionPropertyField;
}

describe('IntegerInput (React)', () => {
  it('renders an input[type="text"]', () => {
    render(<IntegerInput field={makeField()} value="" />, { wrapper: Wrapper });
    expect(document.querySelector('input[type="text"]')).not.toBeNull();
  });

  it('sets the input id to field.name', () => {
    render(<IntegerInput field={makeField({ name: 'myInt' })} value="" />, { wrapper: Wrapper });
    expect(document.getElementById('myInt')).not.toBeNull();
  });

  it('renders a label containing field.displayName', () => {
    render(<IntegerInput field={makeField({ displayName: 'Quantity' })} value="" />, { wrapper: Wrapper });
    expect(document.querySelector('label')?.textContent).toContain('Quantity');
  });

  it('sets defaultValue from value prop', () => {
    render(<IntegerInput field={makeField()} value={42} />, { wrapper: Wrapper });
    expect((document.querySelector('input') as HTMLInputElement).defaultValue).toBe('42');
  });

  it('calls onChange when user types', () => {
    const onChange = vi.fn();
    render(<IntegerInput field={makeField()} value="" onChange={onChange} />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '10' } });
    expect(onChange).toHaveBeenCalledWith('10');
  });

  it('does not crash when onChange is not provided', () => {
    render(<IntegerInput field={makeField()} value="" />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    expect(() => fireEvent.change(input, { target: { value: '5' } })).not.toThrow();
  });

  it('marks input as aria-invalid when external error is passed', () => {
    render(<IntegerInput field={makeField()} value="" error="Required" />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});
