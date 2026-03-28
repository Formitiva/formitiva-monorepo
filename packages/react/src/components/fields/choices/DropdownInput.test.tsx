// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
afterEach(cleanup);
import DropdownInput from './DropdownInput';
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
    name: 'status',
    displayName: 'Status',
    type: 'dropdown',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' },
    ],
    ...overrides,
  } as unknown as DefinitionPropertyField;
}

describe('DropdownInput (React)', () => {
  it('renders a control with role="combobox"', () => {
    render(<DropdownInput field={makeField()} value="active" />, { wrapper: Wrapper });
    expect(document.querySelector('[role="combobox"]')).not.toBeNull();
  });

  it('control has aria-haspopup="listbox"', () => {
    render(<DropdownInput field={makeField()} value="active" />, { wrapper: Wrapper });
    const control = document.querySelector('[role="combobox"]') as HTMLElement;
    expect(control.getAttribute('aria-haspopup')).toBe('listbox');
  });

  it('aria-expanded is false initially', () => {
    render(<DropdownInput field={makeField()} value="active" />, { wrapper: Wrapper });
    const control = document.querySelector('[role="combobox"]') as HTMLElement;
    expect(control.getAttribute('aria-expanded')).toBe('false');
  });

  it('displays selected label text in control', () => {
    render(<DropdownInput field={makeField()} value="inactive" />, { wrapper: Wrapper });
    const control = document.querySelector('[role="combobox"]') as HTMLElement;
    expect(control.textContent).toContain('Inactive');
  });

  it('renders label with displayName', () => {
    render(<DropdownInput field={makeField({ displayName: 'User Status' })} value="active" />, { wrapper: Wrapper });
    expect(document.querySelector('label')?.textContent).toContain('User Status');
  });

  it('aria-expanded becomes true when control is clicked', () => {
    render(<DropdownInput field={makeField()} value="active" />, { wrapper: Wrapper });
    const control = document.querySelector('[role="combobox"]') as HTMLElement;
    fireEvent.click(control);
    expect(control.getAttribute('aria-expanded')).toBe('true');
  });

  it('does not crash without onChange', () => {
    expect(() =>
      render(<DropdownInput field={makeField()} value="active" />, { wrapper: Wrapper })
    ).not.toThrow();
  });
});
