// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
afterEach(cleanup);
import RatingInput from './RatingInput';
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
  return { name: 'rating', displayName: 'Rating', type: 'rating', max: 5, ...overrides } as DefinitionPropertyField;
}

describe('RatingInput (React)', () => {
  it('renders a radiogroup container', () => {
    render(<RatingInput field={makeField()} value={0} />, { wrapper: Wrapper });
    expect(document.querySelector('[role="radiogroup"]')).not.toBeNull();
  });

  it('renders max number of stars (default 5)', () => {
    render(<RatingInput field={makeField()} value={0} />, { wrapper: Wrapper });
    const stars = document.querySelectorAll('[role="radio"]');
    expect(stars.length).toBe(5);
  });

  it('renders correct number of stars when max is custom', () => {
    render(<RatingInput field={makeField({ max: 3 } as any)} value={0} />, { wrapper: Wrapper });
    const stars = document.querySelectorAll('[role="radio"]');
    expect(stars.length).toBe(3);
  });

  it('each star has aria-label "Rating N"', () => {
    render(<RatingInput field={makeField()} value={0} />, { wrapper: Wrapper });
    const stars = document.querySelectorAll('[role="radio"]');
    expect(stars[0].getAttribute('aria-label')).toBe('Rating 1');
    expect(stars[4].getAttribute('aria-label')).toBe('Rating 5');
  });

  it('calls onChange when a star is clicked', () => {
    const onChange = vi.fn();
    render(<RatingInput field={makeField()} value={0} onChange={onChange} />, { wrapper: Wrapper });
    const stars = document.querySelectorAll('[role="radio"]');
    fireEvent.click(stars[2]);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('renders label with displayName', () => {
    render(<RatingInput field={makeField({ displayName: 'Quality' })} value={0} />, { wrapper: Wrapper });
    expect(document.querySelector('label')?.textContent).toContain('Quality');
  });

  it('stars below value have aria-checked=true', () => {
    render(<RatingInput field={makeField()} value={3} />, { wrapper: Wrapper });
    const stars = document.querySelectorAll('[role="radio"]');
    expect(stars[0].getAttribute('aria-checked')).toBe('true');
    expect(stars[1].getAttribute('aria-checked')).toBe('true');
    expect(stars[2].getAttribute('aria-checked')).toBe('true');
    expect(stars[3].getAttribute('aria-checked')).toBe('false');
  });

  it('does not crash when onChange is not provided', () => {
    render(<RatingInput field={makeField()} value={0} />, { wrapper: Wrapper });
    const stars = document.querySelectorAll('[role="radio"]');
    expect(() => fireEvent.click(stars[0])).not.toThrow();
  });
});
