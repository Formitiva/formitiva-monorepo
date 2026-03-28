// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import MultilineTextInput from './MultilineTextInput';
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
  return { name: 'bio', displayName: 'Biography', type: 'multiline', ...overrides } as DefinitionPropertyField;
}

describe('MultilineTextInput (React)', () => {
  it('renders a textarea element', () => {
    render(<MultilineTextInput field={makeField()} value="" />, { wrapper: Wrapper });
    expect(document.querySelector('textarea')).not.toBeNull();
  });

  it('sets the textarea id to field.name', () => {
    render(<MultilineTextInput field={makeField({ name: 'notes' })} value="" />, { wrapper: Wrapper });
    expect(document.getElementById('notes')?.tagName).toBe('TEXTAREA');
  });

  it('renders a label with field.displayName', () => {
    render(<MultilineTextInput field={makeField({ displayName: 'Your notes' })} value="" />, { wrapper: Wrapper });
    const label = document.querySelector('label');
    expect(label?.textContent).toContain('Your notes');
  });

  it('sets defaultValue from value prop', () => {
    render(<MultilineTextInput field={makeField()} value="Initial text" />, { wrapper: Wrapper });
    expect((document.querySelector('textarea') as HTMLTextAreaElement).defaultValue).toBe('Initial text');
  });

  it('has resize:vertical style', () => {
    render(<MultilineTextInput field={makeField()} value="" />, { wrapper: Wrapper });
    expect((document.querySelector('textarea') as HTMLTextAreaElement).style.resize).toBe('vertical');
  });

  it('applies minHeight from field.minHeight', () => {
    render(<MultilineTextInput field={makeField({ minHeight: '150px' })} value="" />, { wrapper: Wrapper });
    expect((document.querySelector('textarea') as HTMLTextAreaElement).style.minHeight).toBe('150px');
  });

  it('calls onChange when user types', () => {
    const onChange = vi.fn();
    render(<MultilineTextInput field={makeField()} value="" onChange={onChange} />, { wrapper: Wrapper });
    fireEvent.change(document.querySelector('textarea')!, { target: { value: 'Hello' } });
    expect(onChange).toHaveBeenCalledWith('Hello');
  });

  it('sets aria-invalid when external error provided', () => {
    render(<MultilineTextInput field={makeField()} value="" error="Required" />, { wrapper: Wrapper });
    expect((document.querySelector('textarea') as HTMLTextAreaElement).getAttribute('aria-invalid')).toBe('true');
  });
});
