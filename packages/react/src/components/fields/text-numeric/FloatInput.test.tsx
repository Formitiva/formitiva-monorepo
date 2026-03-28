// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
afterEach(cleanup);
import FloatInput from './FloatInput';
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
  return { name: 'price', displayName: 'Price', type: 'float', ...overrides } as DefinitionPropertyField;
}

describe('FloatInput (React)', () => {
  it('renders an input[type="text"]', () => {
    render(<FloatInput field={makeField()} value="" />, { wrapper: Wrapper });
    expect(document.querySelector('input[type="text"]')).not.toBeNull();
  });

  it('sets the input id to field.name', () => {
    render(<FloatInput field={makeField({ name: 'myFloat' })} value="" />, { wrapper: Wrapper });
    expect(document.getElementById('myFloat')).not.toBeNull();
  });

  it('renders a label containing field.displayName', () => {
    render(<FloatInput field={makeField({ displayName: 'Amount' })} value="" />, { wrapper: Wrapper });
    expect(document.querySelector('label')?.textContent).toContain('Amount');
  });

  it('sets defaultValue from value prop', () => {
    render(<FloatInput field={makeField()} value={3.14} />, { wrapper: Wrapper });
    expect((document.querySelector('input') as HTMLInputElement).defaultValue).toBe('3.14');
  });

  it('calls onChange when user types', () => {
    const onChange = vi.fn();
    render(<FloatInput field={makeField()} value="" onChange={onChange} />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1.5' } });
    expect(onChange).toHaveBeenCalledWith('1.5');
  });

  it('does not crash when onChange is not provided', () => {
    render(<FloatInput field={makeField()} value="" />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    expect(() => fireEvent.change(input, { target: { value: '2.5' } })).not.toThrow();
  });

  it('marks input as aria-invalid when external error is passed', () => {
    render(<FloatInput field={makeField()} value="" error="Invalid" />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});
