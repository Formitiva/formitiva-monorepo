// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
afterEach(cleanup);
import Button from './Button';
import { FormitivaContext } from '../../../hooks/useFormitivaContext';
import { CSS_CLASSES } from '@formitiva/core';
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
  return { name: 'submit', displayName: 'Submit', type: 'button', ...overrides } as DefinitionPropertyField;
}

describe('Button (React)', () => {
  it('renders a button element', () => {
    render(
      <Button field={makeField()} valuesMap={{}} handleChange={vi.fn()} handleError={vi.fn()} />,
      { wrapper: Wrapper }
    );
    expect(document.querySelector('button')).not.toBeNull();
  });

  it('button has CSS_CLASSES.button class', () => {
    render(
      <Button field={makeField()} valuesMap={{}} handleChange={vi.fn()} handleError={vi.fn()} />,
      { wrapper: Wrapper }
    );
    const btn = document.querySelector('button') as HTMLButtonElement;
    expect(btn.className).toContain(CSS_CLASSES.button);
  });

  it('button text comes from field.displayName', () => {
    render(
      <Button field={makeField({ displayName: 'Send Form' })} valuesMap={{}} handleChange={vi.fn()} handleError={vi.fn()} />,
      { wrapper: Wrapper }
    );
    const btn = document.querySelector('button') as HTMLButtonElement;
    expect(btn.textContent).toContain('Send Form');
  });

  it('uses field.buttonText over displayName when provided', () => {
    render(
      <Button field={makeField({ buttonText: 'Go!', displayName: 'Submit' } as any)} valuesMap={{}} handleChange={vi.fn()} handleError={vi.fn()} />,
      { wrapper: Wrapper }
    );
    const btn = document.querySelector('button') as HTMLButtonElement;
    expect(btn.textContent).toContain('Go!');
  });

  it('aria-label is set', () => {
    render(
      <Button field={makeField({ displayName: 'Send' })} valuesMap={{}} handleChange={vi.fn()} handleError={vi.fn()} />,
      { wrapper: Wrapper }
    );
    const btn = document.querySelector('button') as HTMLButtonElement;
    expect(btn.getAttribute('aria-label')).toBe('Send');
  });

  it('aria-busy is false initially', () => {
    render(
      <Button field={makeField()} valuesMap={{}} handleChange={vi.fn()} handleError={vi.fn()} />,
      { wrapper: Wrapper }
    );
    const btn = document.querySelector('button') as HTMLButtonElement;
    expect(btn.getAttribute('aria-busy')).toBe('false');
  });

  it('button is not disabled initially', () => {
    render(
      <Button field={makeField()} valuesMap={{}} handleChange={vi.fn()} handleError={vi.fn()} />,
      { wrapper: Wrapper }
    );
    const btn = document.querySelector('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it('renders label with displayName', () => {
    render(
      <Button field={makeField({ displayName: 'Confirm' })} valuesMap={{}} handleChange={vi.fn()} handleError={vi.fn()} />,
      { wrapper: Wrapper }
    );
    expect(document.querySelector('label')?.textContent).toContain('Confirm');
  });
});
