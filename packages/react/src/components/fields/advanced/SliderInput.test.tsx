// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
afterEach(cleanup);
import SliderInput from './SliderInput';
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
  return { name: 'volume', displayName: 'Volume', type: 'slider', min: 0, max: 100, ...overrides } as DefinitionPropertyField;
}

describe('SliderInput (React)', () => {
  it('renders a range input', () => {
    render(<SliderInput field={makeField()} value={50} />, { wrapper: Wrapper });
    expect(document.querySelector('input[type="range"]')).not.toBeNull();
  });

  it('renders a text input for direct entry', () => {
    render(<SliderInput field={makeField()} value={50} />, { wrapper: Wrapper });
    expect(document.querySelector('input[type="text"]')).not.toBeNull();
  });

  it('range input id is field.name + "-range"', () => {
    render(<SliderInput field={makeField({ name: 'vol' })} value={50} />, { wrapper: Wrapper });
    expect(document.querySelector('input[type="range"]')!.id).toBe('vol-range');
  });

  it('text input id is field.name', () => {
    render(<SliderInput field={makeField({ name: 'vol' })} value={50} />, { wrapper: Wrapper });
    expect(document.querySelector('input[type="text"]')!.id).toBe('vol');
  });

  it('sets min and max on range input from field', () => {
    render(<SliderInput field={makeField({ min: 10, max: 90 } as any)} value={50} />, { wrapper: Wrapper });
    const range = document.querySelector('input[type="range"]') as HTMLInputElement;
    expect(range.min).toBe('10');
    expect(range.max).toBe('90');
  });

  it('renders label with displayName', () => {
    render(<SliderInput field={makeField({ displayName: 'Brightness' })} value={50} />, { wrapper: Wrapper });
    expect(document.querySelector('label')?.textContent).toContain('Brightness');
  });

  it('calls onChange when range is changed', () => {
    const onChange = vi.fn();
    render(<SliderInput field={makeField()} value={0} onChange={onChange} />, { wrapper: Wrapper });
    const range = document.querySelector('input[type="range"]') as HTMLInputElement;
    fireEvent.change(range, { target: { value: '50' } });
    expect(onChange).toHaveBeenCalledWith('50');
  });

  it('calls onChange when text input is changed', () => {
    const onChange = vi.fn();
    render(<SliderInput field={makeField()} value={0} onChange={onChange} />, { wrapper: Wrapper });
    const text = document.querySelector('input[type="text"]') as HTMLInputElement;
    fireEvent.change(text, { target: { value: '75' } });
    expect(onChange).toHaveBeenCalledWith('75');
  });

  it('does not crash when onChange is not provided', () => {
    render(<SliderInput field={makeField()} value={0} />, { wrapper: Wrapper });
    const range = document.querySelector('input[type="range"]') as HTMLInputElement;
    expect(() => fireEvent.change(range, { target: { value: '25' } })).not.toThrow();
  });
});
