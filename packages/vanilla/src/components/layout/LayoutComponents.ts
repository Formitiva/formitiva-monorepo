/**
 * Vanilla JS layout components for Formitiva.
 * Replaces LayoutComponents.tsx (React).
 *
 * Provides helpers that create wrapper DOM elements with labels, tooltips,
 * and error display areas - the structural shell around each field input.
 */
import { CSS_CLASSES } from '@formitiva/core';
import type { DefinitionPropertyField } from '@formitiva/core';
import type { FormContext } from '../../context/formitivaContext';
import createTooltip from '../fields/base/Tooltip';

// ------------------------------------------------------------------
// FieldLayoutWidget
// ------------------------------------------------------------------
export interface FieldLayoutWidget {
  /** Root container element */
  el: HTMLElement;
  /** Slot element where the input element should be appended */
  slot: HTMLElement;
  /** Update the displayed error text (pass null to clear) */
  setError(error: string | null): void;
}

// ------------------------------------------------------------------
// createErrorEl
// ------------------------------------------------------------------
function createErrorEl(id: string): HTMLSpanElement {
  const span = document.createElement('span');
  span.id = id;
  span.className = 'formitiva-error';
  span.setAttribute('role', 'alert');
  span.style.cssText = [
    'color:var(--formitiva-color-error, #ef4444)',
    'font-size:0.875rem',
    'margin-top:var(--formitiva-space-xs,4px)',
    'display:none',
    'width:100%',
  ].join(';');
  return span;
}



// ------------------------------------------------------------------
// createRowFieldLayout
// ------------------------------------------------------------------
function createRowFieldLayout(
  field: DefinitionPropertyField,
  ctx: FormContext,
  rightAlign = false
): FieldLayoutWidget {
  const root = document.createElement('div');
  root.className = `${CSS_CLASSES.field} row-layout`;

  const label = document.createElement('label');
  label.id = `${field.name}-label`;
  label.className = CSS_CLASSES.label;
  label.htmlFor = field.name;
  label.style.textAlign = 'left';
  label.textContent = ctx.t(field.displayName);
  root.appendChild(label);

  const right = document.createElement('div');
  right.style.cssText = 'display:flex;flex-direction:column;flex:1';
  root.appendChild(right);

  const row = document.createElement('div');
  row.style.cssText = 'display:flex;align-items:center;width:100%';
  right.appendChild(row);

  const slotWrapper = document.createElement('div');
  slotWrapper.style.cssText = `display:flex;width:100%;justify-content:${rightAlign ? 'flex-end' : 'flex-start'}`;
  row.appendChild(slotWrapper);

  if (field.tooltip) {
    const tip = createTooltip(field.tooltip, ctx);
    tip.el.style.marginLeft = '8px';
    row.appendChild(tip.el);
  }

  const errorEl = createErrorEl(`${field.name}-error`);
  right.appendChild(errorEl);

  const setError = (error: string | null) => {
    if (error) {
      errorEl.textContent = error;
      errorEl.style.display = 'block';
    } else {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
  };

  return { el: root, slot: slotWrapper, setError };
}

// ------------------------------------------------------------------
// createColumnFieldLayout
// ------------------------------------------------------------------
function createColumnFieldLayout(
  field: DefinitionPropertyField,
  ctx: FormContext,
  showLabel: boolean
): FieldLayoutWidget {
  const alignment = field.labelLayout === 'column-center' ? 'center' : 'left';

  const root = document.createElement('div');
  root.className = `${CSS_CLASSES.field} column-layout`;
  root.style.cssText = [
    'display:flex',
    'flex-direction:column',
    `gap:var(--formitiva-label-gap,4px)`,
    `--label-align:${alignment}`,
  ].join(';');

  if (showLabel) {
    const label = document.createElement('label');
    label.id = `${field.name}-label`;
    label.className = CSS_CLASSES.label;
    label.htmlFor = field.name;
    label.style.cssText = `text-align:${alignment};width:100%;min-width:unset;display:block;margin-bottom:10px`;
    label.textContent = ctx.t(field.displayName);
    root.appendChild(label);
  }

  const row = document.createElement('div');
  row.style.cssText = 'display:flex;align-items:center;gap:var(--formitiva-inline-gap,8px);width:100%';
  root.appendChild(row);

  const slotWrapper = document.createElement('div');
  slotWrapper.style.cssText = 'flex:1;min-width:0';
  row.appendChild(slotWrapper);

  if (field.tooltip) {
    row.appendChild(createTooltip(field.tooltip, ctx).el);
  }

  const errorEl = createErrorEl(`${field.name}-error`);
  root.appendChild(errorEl);

  const setError = (error: string | null) => {
    if (error) {
      errorEl.textContent = error;
      errorEl.style.display = 'block';
    } else {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
  };

  return { el: root, slot: slotWrapper, setError };
}

// ------------------------------------------------------------------
// createStandardFieldLayout – smart dispatcher
// ------------------------------------------------------------------
export function createStandardFieldLayout(
  field: DefinitionPropertyField,
  ctx: FormContext,
  rightAlign = false
): FieldLayoutWidget {
  if (field.labelLayout === 'column-left' || field.labelLayout === 'column-center') {
    return createColumnFieldLayout(field, ctx, true);
  }
  if (field.type === 'checkbox' || field.type === 'switch') {
    return createColumnFieldLayout(field, ctx, false);
  }
  return createRowFieldLayout(field, ctx, rightAlign);
}

// ------------------------------------------------------------------
// InstanceName
// ------------------------------------------------------------------
export function createInstanceNameWidget(
  initialName: string,
  onChange: (name: string) => void
): { el: HTMLElement } {
  const wrap = document.createElement('div');
  wrap.className = 'formitiva-instance-name';
  wrap.style.cssText = 'margin-bottom:var(--formitiva-space-md,16px)';

  const input = document.createElement('input');
  input.type = 'text';
  input.value = initialName;
  input.className = 'formitiva-input formitiva-input--text formitiva-instance-name__input';
  input.style.cssText = 'width:100%';
  input.addEventListener('input', () => onChange(input.value));
  wrap.appendChild(input);

  return { el: wrap };
}

// ------------------------------------------------------------------
// ErrorDiv helper (used elsewhere)
// ------------------------------------------------------------------
export function createErrorDiv(id: string, text: string): HTMLElement {
  const div = document.createElement('div');
  div.id = id;
  div.className = 'formitiva-error';
  div.setAttribute('role', 'alert');
  div.textContent = text;
  return div;
}
