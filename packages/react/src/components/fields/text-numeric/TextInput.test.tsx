// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

afterEach(cleanup);
import TextInput from './TextInput';
import { FormitivaContext } from '../../../hooks/useFormitivaContext';
import type { FormitivaContextType } from '@formitiva/core';
import type { DefinitionPropertyField } from '@formitiva/core';

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
  return (
    <FormitivaContext.Provider value={mockCtx}>
      {children}
    </FormitivaContext.Provider>
  );
}

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'title', displayName: 'Title', type: 'string', ...overrides } as DefinitionPropertyField;
}

describe('TextInput (React)', () => {
  it('renders an input[type="text"]', () => {
    render(<TextInput field={makeField()} value="" />, { wrapper: Wrapper });
    expect(document.querySelector('input[type="text"]')).not.toBeNull();
  });

  it('sets the input id to field.name', () => {
    render(<TextInput field={makeField({ name: 'myField' })} value="" />, { wrapper: Wrapper });
    expect(document.getElementById('myField')).not.toBeNull();
  });

  it('renders a label containing field.displayName', () => {
    render(<TextInput field={makeField({ displayName: 'Full Name' })} value="" />, { wrapper: Wrapper });
    const label = document.querySelector('label');
    expect(label?.textContent).toContain('Full Name');
  });

  it('sets defaultValue from the value prop', () => {
    render(<TextInput field={makeField()} value="initial text" />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    expect(input.defaultValue).toBe('initial text');
  });

  it('sets placeholder text', () => {
    render(<TextInput field={makeField({ placeholder: 'Enter title' })} value="" />, { wrapper: Wrapper });
    expect((document.querySelector('input') as HTMLInputElement).placeholder).toBe('Enter title');
  });

  it('does not apply HTML disabled attribute (disabling is a parent FieldRenderer concern)', () => {
    render(<TextInput field={makeField()} value="" disabled />, { wrapper: Wrapper });
    // TextInput leaves native disabled to the parent wrapper; the input itself stays interactive
    expect((document.querySelector('input') as HTMLInputElement).disabled).toBe(false);
  });

  it('calls onChange when user types', () => {
    const onChange = vi.fn();
    render(<TextInput field={makeField()} value="" onChange={onChange} />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalledWith('hello');
  });

  it('does not crash when onChange is not provided', () => {
    render(<TextInput field={makeField()} value="test" />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    expect(() => fireEvent.change(input, { target: { value: 'x' } })).not.toThrow();
  });

  it('marks input as aria-invalid when external error is provided', () => {
    render(<TextInput field={makeField()} value="" error="Required field" />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('calls onError with validation result in onEdit mode', () => {
    const editCtx: FormitivaContextType = { ...mockCtx, fieldValidationMode: 'onEdit' };
    const onError = vi.fn();
    function EditWrapper({ children }: { children: React.ReactNode }) {
      return (
        <FormitivaContext.Provider value={editCtx}>
          {children}
        </FormitivaContext.Provider>
      );
    }
    render(
      <TextInput field={makeField({ required: true })} value="" onError={onError} />,
      { wrapper: EditWrapper }
    );
    const input = document.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '' } });
    expect(onError).toHaveBeenCalledWith(expect.any(String));
  });
});
