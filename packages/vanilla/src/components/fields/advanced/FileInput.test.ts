// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import createFileInput from './FileInput';
import { createDefaultContext } from '../../../context/formitivaContext';
import type { DefinitionPropertyField } from '@formitiva/core';

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'doc', displayName: 'Document', type: 'file', ...overrides } as DefinitionPropertyField;
}

function noValCtx() {
  return { ...createDefaultContext(), fieldValidationMode: 'onSubmission' as const };
}

describe('createFileInput', () => {
  it('creates a hidden input[type="file"]', () => {
    const w = createFileInput(makeField(), noValCtx(), vi.fn(), vi.fn(), null, null, false);
    expect(w.el.querySelector('input[type="file"]')).not.toBeNull();
  });

  it('file input id is field.name', () => {
    const w = createFileInput(makeField({ name: 'upload' }), noValCtx(), vi.fn(), vi.fn(), null, null, false);
    expect(w.el.querySelector('input[type="file"]')!.id).toBe('upload');
  });

  it('renders a drop zone with role="button"', () => {
    const w = createFileInput(makeField(), noValCtx(), vi.fn(), vi.fn(), null, null, false);
    expect(w.el.querySelector('[role="button"]')).not.toBeNull();
  });

  it('drop zone has tabindex="0"', () => {
    const w = createFileInput(makeField(), noValCtx(), vi.fn(), vi.fn(), null, null, false);
    const zone = w.el.querySelector('[role="button"]') as HTMLElement;
    expect(zone.getAttribute('tabindex')).toBe('0');
  });

  it('drop zone aria-label mentions "Choose File" for single file', () => {
    const w = createFileInput(makeField(), noValCtx(), vi.fn(), vi.fn(), null, null, false);
    const zone = w.el.querySelector('[role="button"]') as HTMLElement;
    expect(zone.getAttribute('aria-label')).toContain('Choose File');
  });

  it('drop zone aria-label mentions "Choose Files" for multiple files', () => {
    const w = createFileInput(makeField({ multiple: true } as any), noValCtx(), vi.fn(), vi.fn(), null, null, false);
    const zone = w.el.querySelector('[role="button"]') as HTMLElement;
    expect(zone.getAttribute('aria-label')).toContain('Choose Files');
  });

  it('sets accept attribute when field.accept is provided', () => {
    const w = createFileInput(makeField({ accept: 'image/*' } as any), noValCtx(), vi.fn(), vi.fn(), null, null, false);
    expect((w.el.querySelector('input[type="file"]') as HTMLInputElement).accept).toBe('image/*');
  });

  it('sets multiple attribute when field.multiple is true', () => {
    const w = createFileInput(makeField({ multiple: true } as any), noValCtx(), vi.fn(), vi.fn(), null, null, false);
    expect((w.el.querySelector('input[type="file"]') as HTMLInputElement).multiple).toBe(true);
  });

  it('renders label with displayName', () => {
    const w = createFileInput(makeField({ displayName: 'Upload Doc' }), noValCtx(), vi.fn(), vi.fn(), null, null, false);
    expect(w.el.textContent).toContain('Upload Doc');
  });

  it('destroy() does not throw', () => {
    const w = createFileInput(makeField(), noValCtx(), vi.fn(), vi.fn(), null, null, false);
    expect(() => w.destroy()).not.toThrow();
  });
});
