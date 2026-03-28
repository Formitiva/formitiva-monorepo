// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
afterEach(cleanup);
import { EmailInput } from './EmailInput';
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
  return { name: 'email', displayName: 'Email', type: 'email', ...overrides } as DefinitionPropertyField;
}

describe('EmailInput (React)', () => {
  it('renders an input[type="email"]', () => {
    render(<EmailInput field={makeField()} value="" />, { wrapper: Wrapper });
    expect(document.querySelector('input[type="email"]')).not.toBeNull();
  });

  it('sets the input id to field.name', () => {
    render(<EmailInput field={makeField({ name: 'userEmail' })} value="" />, { wrapper: Wrapper });
    expect(document.getElementById('userEmail')).not.toBeNull();
  });

  it('renders a label containing field.displayName', () => {
    render(<EmailInput field={makeField({ displayName: 'Your Email' })} value="" />, { wrapper: Wrapper });
    expect(document.querySelector('label')?.textContent).toContain('Your Email');
  });

  it('sets defaultValue from value prop', () => {
    render(<EmailInput field={makeField()} value="user@example.com" />, { wrapper: Wrapper });
    expect((document.querySelector('input') as HTMLInputElement).defaultValue).toBe('user@example.com');
  });

  it('calls onChange when user types', () => {
    const onChange = vi.fn();
    render(<EmailInput field={makeField()} value="" onChange={onChange} />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test@test.com' } });
    expect(onChange).toHaveBeenCalledWith('test@test.com');
  });

  it('does not crash when onChange is not provided', () => {
    render(<EmailInput field={makeField()} value="" />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    expect(() => fireEvent.change(input, { target: { value: 'a@b.com' } })).not.toThrow();
  });

  it('marks input as aria-invalid when external error is passed', () => {
    render(<EmailInput field={makeField()} value="" error="Invalid email" />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});
