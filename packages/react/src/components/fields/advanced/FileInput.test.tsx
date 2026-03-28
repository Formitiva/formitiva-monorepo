// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
afterEach(cleanup);
import FileInput from './FileInput';
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
  return { name: 'attachment', displayName: 'Attachment', type: 'file', ...overrides } as DefinitionPropertyField;
}

describe('FileInput (React)', () => {
  it('renders a drop zone with role="button"', () => {
    render(<FileInput field={makeField()} value={null} />, { wrapper: Wrapper });
    expect(document.querySelector('[role="button"]')).not.toBeNull();
  });

  it('renders a hidden input[type="file"]', () => {
    render(<FileInput field={makeField()} value={null} />, { wrapper: Wrapper });
    expect(document.querySelector('input[type="file"]')).not.toBeNull();
  });

  it('drop zone aria-label contains "Choose File" for single file', () => {
    render(<FileInput field={makeField()} value={null} />, { wrapper: Wrapper });
    const zone = document.querySelector('[role="button"]') as HTMLElement;
    expect(zone.getAttribute('aria-label')).toContain('Choose File');
  });

  it('drop zone aria-label contains "Choose Files" when field.multiple=true', () => {
    render(<FileInput field={makeField({ multiple: true } as any)} value={null} />, { wrapper: Wrapper });
    const zone = document.querySelector('[role="button"]') as HTMLElement;
    expect(zone.getAttribute('aria-label')).toContain('Choose Files');
  });

  it('input[type="file"] has multiple attribute when field.multiple=true', () => {
    render(<FileInput field={makeField({ multiple: true } as any)} value={null} />, { wrapper: Wrapper });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput.multiple).toBe(true);
  });

  it('input[type="file"] respects field.accept', () => {
    render(<FileInput field={makeField({ accept: 'image/*' } as any)} value={null} />, { wrapper: Wrapper });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput.accept).toBe('image/*');
  });

  it('renders label with displayName', () => {
    render(<FileInput field={makeField({ displayName: 'Upload Document' })} value={null} />, { wrapper: Wrapper });
    expect(document.querySelector('label')?.textContent).toContain('Upload Document');
  });

  it('does not crash without onChange', () => {
    expect(() =>
      render(<FileInput field={makeField()} value={null} />, { wrapper: Wrapper })
    ).not.toThrow();
  });
});
