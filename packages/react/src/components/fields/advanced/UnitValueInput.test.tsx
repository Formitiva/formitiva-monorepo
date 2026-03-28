// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
afterEach(cleanup);
import UnitValueInput from './UnitValueInput';
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
  return { name: 'length', displayName: 'Length', type: 'unit-value', dimension: 'length', ...overrides } as DefinitionPropertyField;
}

describe('UnitValueInput (React)', () => {
  it('renders input[type="text"] with id=field.name when dimension is valid', () => {
    render(<UnitValueInput field={makeField()} value={['10', 'm']} />, { wrapper: Wrapper });
    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.id).toBe('length');
  });

  it('renders a select element for units', () => {
    render(<UnitValueInput field={makeField()} value={['10', 'm']} />, { wrapper: Wrapper });
    expect(document.querySelector('select')).not.toBeNull();
  });

  it('renders label with displayName', () => {
    render(<UnitValueInput field={makeField({ displayName: 'Height' })} value={['5', 'ft']} />, { wrapper: Wrapper });
    expect(document.querySelector('label')?.textContent).toContain('Height');
  });

  it('renders nothing when dimension is missing', () => {
    const { container } = render(
      <UnitValueInput field={makeField({ dimension: undefined } as any)} value={null} />,
      { wrapper: Wrapper }
    );
    expect(container.querySelector('input')).toBeNull();
    expect(container.querySelector('select')).toBeNull();
  });

  it('sets text input value from value array[0]', () => {
    render(<UnitValueInput field={makeField()} value={['42', 'cm']} />, { wrapper: Wrapper });
    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
    expect(input.value).toBe('42');
  });

  it('does not crash with null value', () => {
    expect(() =>
      render(<UnitValueInput field={makeField()} value={null as any} />, { wrapper: Wrapper })
    ).not.toThrow();
  });
});
