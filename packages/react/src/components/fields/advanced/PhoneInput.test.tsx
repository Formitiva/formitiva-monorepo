// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
afterEach(cleanup);
import { PhoneInput } from './PhoneInput';
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
  return { name: 'phone', displayName: 'Phone', type: 'phone', ...overrides } as DefinitionPropertyField;
}

describe('PhoneInput (React)', () => {
  it('renders an input[type="tel"]', () => {
    render(<PhoneInput field={makeField()} value="" />, { wrapper: Wrapper });
    expect(document.querySelector('input[type="tel"]')).not.toBeNull();
  });

  it('sets the input id to field.name', () => {
    render(<PhoneInput field={makeField({ name: 'mobile' })} value="" />, { wrapper: Wrapper });
    expect(document.getElementById('mobile')).not.toBeNull();
  });

  it('renders a label containing field.displayName', () => {
    render(<PhoneInput field={makeField({ displayName: 'Mobile Number' })} value="" />, { wrapper: Wrapper });
    expect(document.querySelector('label')?.textContent).toContain('Mobile Number');
  });

  it('sets defaultValue from value prop', () => {
    render(<PhoneInput field={makeField()} value="+1-555-1234" />, { wrapper: Wrapper });
    expect((document.querySelector('input') as HTMLInputElement).defaultValue).toBe('+1-555-1234');
  });

  it('calls onChange when user types', () => {
    const onChange = vi.fn();
    render(<PhoneInput field={makeField()} value="" onChange={onChange} />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '555-1234' } });
    expect(onChange).toHaveBeenCalledWith('555-1234');
  });

  it('does not crash when onChange is not provided', () => {
    render(<PhoneInput field={makeField()} value="" />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    expect(() => fireEvent.change(input, { target: { value: '555' } })).not.toThrow();
  });
});
