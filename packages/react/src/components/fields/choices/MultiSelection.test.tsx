// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
afterEach(cleanup);
import MultiSelection from './MultiSelection';
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
  return {
    name: 'colors',
    displayName: 'Colors',
    type: 'multi-selection',
    options: [
      { value: 'red', label: 'Red' },
      { value: 'green', label: 'Green' },
      { value: 'blue', label: 'Blue' },
    ],
    ...overrides,
  } as unknown as DefinitionPropertyField;
}

describe('MultiSelection (React)', () => {
  it('renders a control with role="button"', () => {
    render(<MultiSelection field={makeField()} value={[]} />, { wrapper: Wrapper });
    expect(document.querySelector('[role="button"]')).not.toBeNull();
  });

  it('control has aria-haspopup="listbox"', () => {
    render(<MultiSelection field={makeField()} value={[]} />, { wrapper: Wrapper });
    const control = document.querySelector('[role="button"]') as HTMLElement;
    expect(control.getAttribute('aria-haspopup')).toBe('listbox');
  });

  it('aria-expanded is false initially', () => {
    render(<MultiSelection field={makeField()} value={[]} />, { wrapper: Wrapper });
    const control = document.querySelector('[role="button"]') as HTMLElement;
    expect(control.getAttribute('aria-expanded')).toBe('false');
  });

  it('shows "0 / 3 selected" with empty value', () => {
    render(<MultiSelection field={makeField()} value={[]} />, { wrapper: Wrapper });
    const control = document.querySelector('[role="button"]') as HTMLElement;
    expect(control.textContent).toContain('0 / 3 selected');
  });

  it('shows selected count in summary text', () => {
    render(<MultiSelection field={makeField()} value={['red', 'blue']} />, { wrapper: Wrapper });
    const control = document.querySelector('[role="button"]') as HTMLElement;
    expect(control.textContent).toContain('2 / 3 selected');
  });

  it('renders label with displayName', () => {
    render(<MultiSelection field={makeField({ displayName: 'Pick Colors' })} value={[]} />, { wrapper: Wrapper });
    expect(document.querySelector('label')?.textContent).toContain('Pick Colors');
  });

  it('aria-expanded becomes true when control is clicked', () => {
    render(<MultiSelection field={makeField()} value={[]} />, { wrapper: Wrapper });
    const control = document.querySelector('[role="button"]') as HTMLElement;
    fireEvent.click(control);
    expect(control.getAttribute('aria-expanded')).toBe('true');
  });

  it('does not crash without onChange', () => {
    expect(() =>
      render(<MultiSelection field={makeField()} value={[]} />, { wrapper: Wrapper })
    ).not.toThrow();
  });
});
