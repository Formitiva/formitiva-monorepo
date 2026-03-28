// @vitest-environment happy-dom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import FieldSeparator from './Separator';
import { FormitivaContext } from '../../../hooks/useFormitivaContext';
import type { FormitivaContextType } from '@formitiva/core';

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

describe('FieldSeparator (React)', () => {
  it('renders a div element', () => {
    const { container } = render(<FieldSeparator field={{}} />, { wrapper: Wrapper });
    expect(container.firstChild).not.toBeNull();
  });

  it('applies borderTop style', () => {
    const { container } = render(<FieldSeparator field={{ thickness: 2, color: 'red' }} />, { wrapper: Wrapper });
    const div = container.firstChild as HTMLElement;
    expect(div.style.borderTop).toContain('red');
    expect(div.style.borderTop).toContain('2px');
  });

  it('applies default margin "8px 0"', () => {
    const { container } = render(<FieldSeparator field={{}} />, { wrapper: Wrapper });
    const div = container.firstChild as HTMLElement;
    expect(div.style.margin).toContain('8px');
  });

  it('applies custom string margin', () => {
    const { container } = render(<FieldSeparator field={{ margin: '16px 0' }} />, { wrapper: Wrapper });
    const div = container.firstChild as HTMLElement;
    expect(div.style.margin).toContain('16px');
  });

  it('applies height 0', () => {
    const { container } = render(<FieldSeparator field={{}} />, { wrapper: Wrapper });
    const div = container.firstChild as HTMLElement;
    expect(div.style.height).toMatch(/^0(px)?$/);
  });

  it('applies default light-theme color #CCCCCC when no color specified', () => {
    const { container } = render(<FieldSeparator field={{}} />, { wrapper: Wrapper });
    const div = container.firstChild as HTMLElement;
    expect(div.style.borderTop.toLowerCase()).toContain('cccccc');
  });
});
