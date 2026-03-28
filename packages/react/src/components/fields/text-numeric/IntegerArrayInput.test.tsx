// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
afterEach(cleanup);
import IntegerArrayInput from './IntegerArrayInput';
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
  return { name: 'nums', displayName: 'Numbers', type: 'integer-array', ...overrides } as DefinitionPropertyField;
}

describe('IntegerArrayInput (React)', () => {
  it('renders an input[type="text"]', () => {
    render(<IntegerArrayInput field={makeField()} value={[1, 2, 3]} />, { wrapper: Wrapper });
    expect(document.querySelector('input[type="text"]')).not.toBeNull();
  });

  it('input id is field.name', () => {
    render(<IntegerArrayInput field={makeField({ name: 'items' })} value={[]} />, { wrapper: Wrapper });
    expect(document.querySelector('input')!.id).toBe('items');
  });

  it('displays array values as comma-separated string', () => {
    render(<IntegerArrayInput field={makeField()} value={[1, 2, 3]} />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    expect(input.defaultValue).toBe('1, 2, 3');
  });

  it('renders label with displayName', () => {
    render(<IntegerArrayInput field={makeField({ displayName: 'Tags' })} value={[]} />, { wrapper: Wrapper });
    expect(document.querySelector('label')?.textContent).toContain('Tags');
  });

  it('does not crash with empty array', () => {
    expect(() =>
      render(<IntegerArrayInput field={makeField()} value={[]} />, { wrapper: Wrapper })
    ).not.toThrow();
  });

  it('does not crash with null value', () => {
    expect(() =>
      render(<IntegerArrayInput field={makeField()} value={null as any} />, { wrapper: Wrapper })
    ).not.toThrow();
  });
});
