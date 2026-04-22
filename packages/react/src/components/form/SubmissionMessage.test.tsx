// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import * as React from 'react';
import { FormitivaContext } from '../../hooks/useFormitivaContext';

afterEach(cleanup);
import { SubmissionMessage } from './SubmissionMessage';

const identity = (s: string) => s;

const minimalContext = {
  definitionName: 'test',
  language: 'en',
  theme: 'default',
  formStyle: {},
  fieldStyle: {},
  t: identity,
  fieldValidationMode: 'onBlur' as const,
  displayInstanceName: false,
};

const wrap = (ui: React.ReactElement, tFn = identity) => (
  <FormitivaContext.Provider value={{ ...minimalContext, t: tFn }}>
    {ui}
  </FormitivaContext.Provider>
);

describe('SubmissionMessage', () => {
  it('renders nothing when message is null', () => {
    const { container } = render(
      wrap(<SubmissionMessage message={null} success={null} onDismiss={vi.fn()} />)
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders a status role element when message is provided', () => {
    render(
      wrap(<SubmissionMessage message="Something went wrong" success={false} onDismiss={vi.fn()} />)
    );
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('displays the message text', () => {
    render(
      wrap(<SubmissionMessage message="Upload failed" success={false} onDismiss={vi.fn()} />)
    );
    expect(screen.getByText('Upload failed')).toBeTruthy();
  });

  it('renders a dismiss button', () => {
    render(
      wrap(<SubmissionMessage message="Error" success={false} onDismiss={vi.fn()} />)
    );
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('calls onDismiss when the dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(
      wrap(<SubmissionMessage message="Error" success={false} onDismiss={onDismiss} />)
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('uses t() for the dismiss button aria-label', () => {
    const t = vi.fn((s: string) => s);
    render(
      wrap(<SubmissionMessage message="Done" success={true} onDismiss={vi.fn()} />, t)
    );
    expect(t).toHaveBeenCalledWith('Dismiss');
  });

  it('applies success background for success=true', () => {
    render(
      wrap(<SubmissionMessage message="Saved!" success={true} onDismiss={vi.fn()} />)
    );
    const statusEl = screen.getByRole('status') as HTMLElement;
    expect(statusEl.style.backgroundColor).toContain('rgba(76');
  });

  it('applies error background for success=false', () => {
    render(
      wrap(<SubmissionMessage message="Failed!" success={false} onDismiss={vi.fn()} />)
    );
    const statusEl = screen.getByRole('status') as HTMLElement;
    expect(statusEl.style.backgroundColor).toContain('rgba(225');
  });

  it('removes the component after dismiss dismisses the message (re-render with null)', () => {
    const { rerender, container } = render(
      wrap(<SubmissionMessage message="Error" success={false} onDismiss={vi.fn()} />)
    );
    expect(container.firstChild).not.toBeNull();
    rerender(
      wrap(<SubmissionMessage message={null} success={null} onDismiss={vi.fn()} />)
    );
    expect(container.firstChild).toBeNull();
  });
});
