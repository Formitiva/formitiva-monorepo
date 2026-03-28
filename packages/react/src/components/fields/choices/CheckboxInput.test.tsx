// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import CheckboxInput from './CheckboxInput';
import { FormitivaContext } from '../../../hooks/useFormitivaContext';
import type { FormitivaContextType } from '@formitiva/core';
import type { DefinitionPropertyField } from '@formitiva/core';

afterEach(cleanup);

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
  return { name: 'accept', displayName: 'Accept Terms', type: 'boolean', ...overrides } as DefinitionPropertyField;
}

describe('CheckboxInput (React)', () => {
  it('renders a checkbox input', () => {
    render(<CheckboxInput field={makeField()} value={false} />, { wrapper: Wrapper });
    expect(document.querySelector('input[type="checkbox"]')).not.toBeNull();
  });

  it('sets data-testid="boolean-checkbox"', () => {
    render(<CheckboxInput field={makeField()} value={false} />, { wrapper: Wrapper });
    expect(document.querySelector('[data-testid="boolean-checkbox"]')).not.toBeNull();
  });

  it('reflects checked=false when value prop is false', () => {
    render(<CheckboxInput field={makeField()} value={false} />, { wrapper: Wrapper });
    expect((document.querySelector('input[type="checkbox"]') as HTMLInputElement).checked).toBe(false);
  });

  it('reflects checked=true when value prop is true', () => {
    render(<CheckboxInput field={makeField()} value={true} />, { wrapper: Wrapper });
    expect((document.querySelector('input[type="checkbox"]') as HTMLInputElement).checked).toBe(true);
  });

  it('renders a label containing field.displayName', () => {
    render(<CheckboxInput field={makeField({ displayName: 'I agree' })} value={false} />, { wrapper: Wrapper });
    expect(document.body.textContent).toContain('I agree');
  });

  it('calls onChange with true when checked', () => {
    const onChange = vi.fn();
    render(<CheckboxInput field={makeField()} value={false} onChange={onChange} />, { wrapper: Wrapper });
    fireEvent.click(document.querySelector('input[type="checkbox"]')!);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when unchecked', () => {
    const onChange = vi.fn();
    render(<CheckboxInput field={makeField()} value={true} onChange={onChange} />, { wrapper: Wrapper });
    fireEvent.click(document.querySelector('input[type="checkbox"]')!);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('calls onChange on Space keydown', () => {
    const onChange = vi.fn();
    render(<CheckboxInput field={makeField()} value={false} onChange={onChange} />, { wrapper: Wrapper });
    fireEvent.keyDown(document.querySelector('input[type="checkbox"]')!, { key: ' ' });
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('sets aria-invalid="true" when external error is provided', () => {
    render(<CheckboxInput field={makeField()} value={false} error="Required" />, { wrapper: Wrapper });
    expect((document.querySelector('input[type="checkbox"]') as HTMLInputElement).getAttribute('aria-invalid')).toBe('true');
  });

  it('sets aria-checked attribute to match value', () => {
    render(<CheckboxInput field={makeField()} value={true} />, { wrapper: Wrapper });
    const input = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input.getAttribute('aria-checked')).toBe('true');
  });
});
