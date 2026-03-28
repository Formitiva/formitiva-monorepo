// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

afterEach(cleanup);
import { SubmissionMessage } from './SubmissionMessage';

describe('SubmissionMessage', () => {
  it('renders nothing when message is null', () => {
    const { container } = render(
      <SubmissionMessage message={null} success={null} onDismiss={vi.fn()} t={(s) => s} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders a status role element when message is provided', () => {
    render(
      <SubmissionMessage message="Something went wrong" success={false} onDismiss={vi.fn()} t={(s) => s} />
    );
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('displays the message text', () => {
    render(
      <SubmissionMessage message="Upload failed" success={false} onDismiss={vi.fn()} t={(s) => s} />
    );
    expect(screen.getByText('Upload failed')).toBeTruthy();
  });

  it('renders a dismiss button', () => {
    render(
      <SubmissionMessage message="Error" success={false} onDismiss={vi.fn()} t={(s) => s} />
    );
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('calls onDismiss when the dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(
      <SubmissionMessage message="Error" success={false} onDismiss={onDismiss} t={(s) => s} />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('uses t() for the dismiss button aria-label', () => {
    const t = vi.fn((s: string) => s);
    render(
      <SubmissionMessage message="Done" success={true} onDismiss={vi.fn()} t={t} />
    );
    expect(t).toHaveBeenCalledWith('Dismiss');
  });

  it('applies success background for success=true', () => {
    render(
      <SubmissionMessage message="Saved!" success={true} onDismiss={vi.fn()} t={(s) => s} />
    );
    const statusEl = screen.getByRole('status') as HTMLElement;
    expect(statusEl.style.backgroundColor).toContain('rgba(76');
  });

  it('applies error background for success=false', () => {
    render(
      <SubmissionMessage message="Failed!" success={false} onDismiss={vi.fn()} t={(s) => s} />
    );
    const statusEl = screen.getByRole('status') as HTMLElement;
    expect(statusEl.style.backgroundColor).toContain('rgba(225');
  });

  it('removes the component after dismiss dismisses the message (re-render with null)', () => {
    const { rerender, container } = render(
      <SubmissionMessage message="Error" success={false} onDismiss={vi.fn()} t={(s) => s} />
    );
    expect(container.firstChild).not.toBeNull();
    rerender(
      <SubmissionMessage message={null} success={null} onDismiss={vi.fn()} t={(s) => s} />
    );
    expect(container.firstChild).toBeNull();
  });
});
