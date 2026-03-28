// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
afterEach(cleanup);
import NumericStepperInput from './NumericStepperInput';
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
  return { name: 'count', displayName: 'Count', type: 'integer', min: 0, max: 100, step: 1, ...overrides } as DefinitionPropertyField;
}

describe('NumericStepperInput (React)', () => {
  it('renders an input[type="number"]', () => {
    render(<NumericStepperInput field={makeField()} value={0} />, { wrapper: Wrapper });
    expect(document.querySelector('input[type="number"]')).not.toBeNull();
  });

  it('sets the input id to field.name', () => {
    render(<NumericStepperInput field={makeField({ name: 'steps' })} value={0} />, { wrapper: Wrapper });
    expect(document.getElementById('steps')).not.toBeNull();
  });

  it('renders a label containing field.displayName', () => {
    render(<NumericStepperInput field={makeField({ displayName: 'Steps' })} value={0} />, { wrapper: Wrapper });
    expect(document.querySelector('label')?.textContent).toContain('Steps');
  });

  it('sets defaultValue from value prop', () => {
    render(<NumericStepperInput field={makeField()} value={5} />, { wrapper: Wrapper });
    expect((document.querySelector('input') as HTMLInputElement).defaultValue).toBe('5');
  });

  it('sets min/max from field', () => {
    render(<NumericStepperInput field={makeField({ min: 10, max: 90 } as any)} value={50} />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    expect(input.min).toBe('10');
    expect(input.max).toBe('90');
  });

  it('calls onChange when user types', () => {
    const onChange = vi.fn();
    render(<NumericStepperInput field={makeField()} value={0} onChange={onChange} />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '7' } });
    expect(onChange).toHaveBeenCalledWith('7');
  });

  it('does not crash when onChange is not provided', () => {
    render(<NumericStepperInput field={makeField()} value={0} />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    expect(() => fireEvent.change(input, { target: { value: '3' } })).not.toThrow();
  });
});
