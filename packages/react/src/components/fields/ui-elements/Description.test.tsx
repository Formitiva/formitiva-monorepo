// @vitest-environment happy-dom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import Description from './Description';
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

describe('Description (React)', () => {
  it('renders a description element', () => {
    const { container } = render(<Description field={{ displayText: 'Hello' }} />, { wrapper: Wrapper });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders plain text content', () => {
    const { container } = render(<Description field={{ displayText: 'Welcome to the form' }} />, { wrapper: Wrapper });
    expect(container.textContent?.replace(/\u00A0/g, ' ')).toContain('Welcome to the form');
  });

  it('applies textAlign="center"', () => {
    const { container } = render(<Description field={{ displayText: 'Centered', textAlign: 'center' }} />, { wrapper: Wrapper });
    const inner = container.querySelector('[style]') as HTMLElement;
    expect(inner?.style.textAlign).toBe('center');
  });

  it('renders array of strings joined by newlines', () => {
    const { container } = render(
      <Description field={{ displayText: ['Line one', 'Line two'] }} />,
      { wrapper: Wrapper }
    );
    const text = container.textContent?.replace(/\u00A0/g, ' ') ?? '';
    expect(text).toContain('Line one');
    expect(text).toContain('Line two');
  });

  it('renders HTML when allowHtml=true', () => {
    const { container } = render(
      <Description field={{ displayText: '<strong>Bold text</strong>', allowHtml: true }} />,
      { wrapper: Wrapper }
    );
    expect(container.querySelector('strong')).not.toBeNull();
  });

  it('does not render HTML tags when allowHtml is false', () => {
    const { container } = render(
      <Description field={{ displayText: '<em>Italic</em>', allowHtml: false }} />,
      { wrapper: Wrapper }
    );
    expect(container.querySelector('em')).toBeNull();
  });

  it('calls t() on the display text', () => {
    const tFn = (s: string) => `[${s}]`;
    const ctx: FormitivaContextType = { ...mockCtx, t: tFn };
    function CustomWrapper({ children }: { children: React.ReactNode }) {
      return <FormitivaContext.Provider value={ctx}>{children}</FormitivaContext.Provider>;
    }
    const { container } = render(<Description field={{ displayText: 'Greet' }} />, { wrapper: CustomWrapper });
    expect(container.textContent).toContain('[Greet]');
  });

  it('renders empty when no displayText provided', () => {
    const { container } = render(<Description field={{}} />, { wrapper: Wrapper });
    // Should render without crashing, and the container should exist
    expect(container).not.toBeNull();
  });
});
