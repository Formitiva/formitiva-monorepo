// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import RadioInput from './RadioInput';
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

const OPTIONS = [
  { label: 'Red', value: 'red' },
  { label: 'Green', value: 'green' },
  { label: 'Blue', value: 'blue' },
];

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'colour', displayName: 'Colour', type: 'radio', options: OPTIONS, ...overrides } as DefinitionPropertyField;
}

describe('RadioInput (React)', () => {
  it('renders one radio per option', () => {
    render(<RadioInput field={makeField()} value="red" />, { wrapper: Wrapper });
    expect(document.querySelectorAll('input[type="radio"]').length).toBe(3);
  });

  it('checks the radio matching the value prop', () => {
    render(<RadioInput field={makeField()} value="green" />, { wrapper: Wrapper });
    const radios = Array.from(document.querySelectorAll('input[type="radio"]')) as HTMLInputElement[];
    expect(radios.find(r => r.value === 'green')!.checked).toBe(true);
    expect(radios.find(r => r.value === 'red')!.checked).toBe(false);
  });

  it('all radios share field.name as name attribute', () => {
    render(<RadioInput field={makeField({ name: 'theme' })} value="red" />, { wrapper: Wrapper });
    const radios = Array.from(document.querySelectorAll('input[type="radio"]')) as HTMLInputElement[];
    expect(radios.every(r => r.name === 'theme')).toBe(true);
  });

  it('renders option labels', () => {
    render(<RadioInput field={makeField()} value="red" />, { wrapper: Wrapper });
    expect(document.body.textContent).toContain('Red');
    expect(document.body.textContent).toContain('Green');
    expect(document.body.textContent).toContain('Blue');
  });

  it('calls onChange when a label is clicked', () => {
    const onChange = vi.fn();
    render(<RadioInput field={makeField()} value="red" onChange={onChange} />, { wrapper: Wrapper });
    const labels = document.querySelectorAll('label');
    const blueLabel = Array.from(labels).find(l => l.textContent?.includes('Blue'));
    blueLabel?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith('blue');
  });

  it('sets aria-invalid on the container when external error provided', () => {
    render(<RadioInput field={makeField()} value="red" error="Please select" />, { wrapper: Wrapper });
    const container = document.querySelector('[aria-invalid="true"]');
    expect(container).not.toBeNull();
  });
});
