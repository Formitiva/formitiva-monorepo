// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
afterEach(cleanup);
import PasswordInput from './PasswordInput';
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
  return { name: 'password', displayName: 'Password', type: 'password', ...overrides } as DefinitionPropertyField;
}

describe('PasswordInput (React)', () => {
  it('renders an input[type="password"] by default', () => {
    render(<PasswordInput field={makeField()} value="" />, { wrapper: Wrapper });
    expect(document.querySelector('input[type="password"]')).not.toBeNull();
  });

  it('sets the input id to field.name', () => {
    render(<PasswordInput field={makeField({ name: 'secret' })} value="" />, { wrapper: Wrapper });
    expect(document.getElementById('secret')).not.toBeNull();
  });

  it('renders a label containing field.displayName', () => {
    render(<PasswordInput field={makeField({ displayName: 'Secret Key' })} value="" />, { wrapper: Wrapper });
    expect(document.querySelector('label')?.textContent).toContain('Secret Key');
  });

  it('sets defaultValue from value prop', () => {
    render(<PasswordInput field={makeField()} value="mypassword" />, { wrapper: Wrapper });
    expect((document.querySelector('input') as HTMLInputElement).defaultValue).toBe('mypassword');
  });

  it('has a toggle visibility button', () => {
    render(<PasswordInput field={makeField()} value="" />, { wrapper: Wrapper });
    expect(document.querySelector('button')).not.toBeNull();
  });

  it('toggles to input[type="text"] when toggle button is clicked', () => {
    render(<PasswordInput field={makeField()} value="" />, { wrapper: Wrapper });
    const button = document.querySelector('button') as HTMLButtonElement;
    fireEvent.click(button);
    expect(document.querySelector('input[type="text"]')).not.toBeNull();
  });

  it('toggles back to input[type="password"] on second click', () => {
    render(<PasswordInput field={makeField()} value="" />, { wrapper: Wrapper });
    const button = document.querySelector('button') as HTMLButtonElement;
    fireEvent.click(button);
    fireEvent.click(button);
    expect(document.querySelector('input[type="password"]')).not.toBeNull();
  });

  it('calls onChange when user types', () => {
    const onChange = vi.fn();
    render(<PasswordInput field={makeField()} value="" onChange={onChange} />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'secret123' } });
    expect(onChange).toHaveBeenCalledWith('secret123');
  });

  it('does not crash when onChange is not provided', () => {
    render(<PasswordInput field={makeField()} value="" />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    expect(() => fireEvent.change(input, { target: { value: 'x' } })).not.toThrow();
  });
});
