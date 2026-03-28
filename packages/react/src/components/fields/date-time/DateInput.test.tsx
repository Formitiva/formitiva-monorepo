// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import DateInput from './DateInput';
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
  return { name: 'dob', displayName: 'Date of Birth', type: 'date', ...overrides } as DefinitionPropertyField;
}

describe('DateInput (React)', () => {
  it('renders input[type="date"]', () => {
    render(<DateInput field={makeField()} value="" />, { wrapper: Wrapper });
    expect(document.querySelector('input[type="date"]')).not.toBeNull();
  });

  it('sets id to field.name', () => {
    render(<DateInput field={makeField({ name: 'eventDate' })} value="" />, { wrapper: Wrapper });
    expect(document.getElementById('eventDate')).not.toBeNull();
  });

  it('renders a label with field.displayName', () => {
    render(<DateInput field={makeField({ displayName: 'Birth Date' })} value="" />, { wrapper: Wrapper });
    const label = document.querySelector('label');
    expect(label?.textContent).toContain('Birth Date');
  });

  it('accepts a valid YYYY-MM-DD initial value', () => {
    render(<DateInput field={makeField()} value="2024-06-15" />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    expect(input.defaultValue).toBe('2024-06-15');
  });

  it('sets empty string for invalid date value', () => {
    render(<DateInput field={makeField()} value="not-a-date" />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    expect(input.defaultValue).toBe('');
  });

  it('applies min date attribute', () => {
    render(<DateInput field={makeField({ minDate: '2020-01-01' } as any)} value="" />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    expect(input.min).toBe('2020-01-01');
  });

  it('applies max date attribute', () => {
    render(<DateInput field={makeField({ maxDate: '2030-12-31' } as any)} value="" />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    expect(input.max).toBe('2030-12-31');
  });

  it('calls onChange on user input', () => {
    const onChange = vi.fn();
    render(<DateInput field={makeField()} value="" onChange={onChange} />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '2025-03-14' } });
    expect(onChange).toHaveBeenCalledWith('2025-03-14');
  });
});
