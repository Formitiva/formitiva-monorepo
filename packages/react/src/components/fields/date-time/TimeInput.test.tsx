// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
afterEach(cleanup);
import TimeInput from './TimeInput';
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
  return { name: 'startTime', displayName: 'Start Time', type: 'time', ...overrides } as DefinitionPropertyField;
}

describe('TimeInput (React)', () => {
  it('renders an input[type="time"]', () => {
    render(<TimeInput field={makeField()} value="09:00" />, { wrapper: Wrapper });
    expect(document.querySelector('input[type="time"]')).not.toBeNull();
  });

  it('sets the input id to field.name', () => {
    render(<TimeInput field={makeField({ name: 'meetingTime' })} value="09:00" />, { wrapper: Wrapper });
    expect(document.getElementById('meetingTime')).not.toBeNull();
  });

  it('renders a label containing field.displayName', () => {
    render(<TimeInput field={makeField({ displayName: 'Meeting Time' })} value="09:00" />, { wrapper: Wrapper });
    expect(document.querySelector('label')?.textContent).toContain('Meeting Time');
  });

  it('sets defaultValue from value prop', () => {
    render(<TimeInput field={makeField()} value="14:30" />, { wrapper: Wrapper });
    expect((document.querySelector('input') as HTMLInputElement).defaultValue).toBe('14:30');
  });

  it('calls onChange when user changes time', () => {
    const onChange = vi.fn();
    render(<TimeInput field={makeField()} value="09:00" onChange={onChange} />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '10:30' } });
    expect(onChange).toHaveBeenCalledWith('10:30');
  });

  it('does not crash when onChange is not provided', () => {
    render(<TimeInput field={makeField()} value="09:00" />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    expect(() => fireEvent.change(input, { target: { value: '11:00' } })).not.toThrow();
  });

  it('step is 1 when includeSeconds is true', () => {
    render(<TimeInput field={makeField({ includeSeconds: true } as any)} value="09:00" />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    expect(input.step).toBe('1');
  });

  it('step is 60 when includeSeconds is false', () => {
    render(<TimeInput field={makeField()} value="09:00" />, { wrapper: Wrapper });
    const input = document.querySelector('input') as HTMLInputElement;
    expect(input.step).toBe('60');
  });
});
