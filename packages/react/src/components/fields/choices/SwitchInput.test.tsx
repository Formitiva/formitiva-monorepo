// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import SwitchInput from './SwitchInput';
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
  return { name: 'notify', displayName: 'Enable Notifications', type: 'boolean', ...overrides } as DefinitionPropertyField;
}

describe('SwitchInput (React)', () => {
  it('renders the switch element with data-testid="switch"', () => {
    render(<SwitchInput field={makeField()} value={false} />, { wrapper: Wrapper });
    expect(document.querySelector('[data-testid="switch"]')).not.toBeNull();
  });

  it('aria-checked is false when value=false', () => {
    render(<SwitchInput field={makeField()} value={false} />, { wrapper: Wrapper });
    const sw = document.querySelector('[data-testid="switch"]') as HTMLElement;
    expect(sw.getAttribute('aria-checked')).toBe('false');
  });

  it('aria-checked is true when value=true', () => {
    render(<SwitchInput field={makeField()} value={true} />, { wrapper: Wrapper });
    const sw = document.querySelector('[data-testid="switch"]') as HTMLElement;
    expect(sw.getAttribute('aria-checked')).toBe('true');
  });

  it('renders label with field.displayName', () => {
    render(<SwitchInput field={makeField({ displayName: 'Dark Mode' })} value={false} />, { wrapper: Wrapper });
    expect(document.body.textContent).toContain('Dark Mode');
  });

  it('has role="switch" on the switch span', () => {
    render(<SwitchInput field={makeField()} value={false} />, { wrapper: Wrapper });
    expect(document.querySelector('[role="switch"]')).not.toBeNull();
  });

  it('calls onChange(true) when clicked from off state', () => {
    const onChange = vi.fn();
    render(<SwitchInput field={makeField()} value={false} onChange={onChange} />, { wrapper: Wrapper });
    const sw = document.querySelector('[data-testid="switch"]') as HTMLElement;
    fireEvent.click(sw);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange(false) when clicked from on state', () => {
    const onChange = vi.fn();
    render(<SwitchInput field={makeField()} value={true} onChange={onChange} />, { wrapper: Wrapper });
    const sw = document.querySelector('[data-testid="switch"]') as HTMLElement;
    fireEvent.click(sw);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('calls onChange on Space keydown', () => {
    const onChange = vi.fn();
    render(<SwitchInput field={makeField()} value={false} onChange={onChange} />, { wrapper: Wrapper });
    const sw = document.querySelector('[data-testid="switch"]') as HTMLElement;
    fireEvent.keyDown(sw, { key: ' ' });
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange on Enter keydown', () => {
    const onChange = vi.fn();
    render(<SwitchInput field={makeField()} value={false} onChange={onChange} />, { wrapper: Wrapper });
    const sw = document.querySelector('[data-testid="switch"]') as HTMLElement;
    fireEvent.keyDown(sw, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
