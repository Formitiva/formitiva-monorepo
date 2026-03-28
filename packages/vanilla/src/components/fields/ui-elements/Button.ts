import type { DefinitionPropertyField, FieldValueType, ErrorType } from '@formitiva/core';
import type { FormContext } from '../../../context/formitivaContext';
import type { ButtonFieldWidget } from '../../../core/fieldWidget';
import { CSS_CLASSES } from '@formitiva/core';
import { getButtonHandler } from '@formitiva/core';
import { createStandardFieldLayout } from '../../layout/LayoutComponents';

export default function createButton(
  field: DefinitionPropertyField,
  ctx: FormContext,
  valuesMap: Record<string, FieldValueType>,
  handleChange: (fieldName: string, value: FieldValueType) => void,
  handleError: (fieldName: string, error: ErrorType) => void
): ButtonFieldWidget {
  let currentValuesMap = valuesMap;
  let isProcessing = false;

  // Use the standard field layout so the button is rendered inside the
  // input slot (right column) rather than becoming the first child of the
  // grid (which would land in the label column).
  const layout = createStandardFieldLayout(field, ctx);
  const slot = layout.slot;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = CSS_CLASSES.button;

  const label = field.buttonText || field.displayName || '';
  btn.textContent = ctx.t(label);
  btn.setAttribute('aria-label', ctx.t(label));

  // Width
  if (field.width) {
    if (typeof field.width === 'number' && field.width > 0) {
      btn.style.width = `${field.width}px`;
    } else if (typeof field.width === 'string' && field.width.trim()) {
      btn.style.width = field.width;
    }
  }

  const alignment = (field.alignment || 'right') as 'left' | 'center' | 'right';
  const justifyMap: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' };
  slot.style.justifyContent = justifyMap[alignment] || 'flex-end';

  slot.appendChild(btn);

  function setProcessing(p: boolean) {
    isProcessing = p;
    btn.disabled = p;
    btn.style.cursor = p ? 'wait' : 'pointer';
    btn.style.opacity = p ? '0.6' : '1';
    btn.setAttribute('aria-busy', String(p));
    btn.textContent = p ? ctx.t('Processing...') : ctx.t(label);
  }

  function showError(msg: string | null) {
    layout.setError(msg);
  }

  btn.addEventListener('click', async () => {
    if (isProcessing) return;
    if (!field.action) {
      console.warn(`Button "${field.name}" has no action defined`);
      return;
    }
    const handler = getButtonHandler(field.action as string);
    if (!handler) {
      const msg = `Button handler "${field.action}" not found`;
      console.error(msg);
      showError(msg);
      return;
    }
    setProcessing(true);
    showError(null);
    try {
      await handler(currentValuesMap, handleChange, handleError, ctx.t);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Button handler "${field.action}" failed:`, msg);
      showError(msg);
    } finally {
      setProcessing(false);
    }
  });

  return {
    el: layout.el,
    update(_value, error, disabled) {
      layout.setError(error);
      btn.disabled = Boolean(disabled) || isProcessing;
      btn.style.cursor = btn.disabled ? 'not-allowed' : 'pointer';
      btn.style.opacity = btn.disabled ? '0.6' : '1';
    },
    updateValuesMap(vm) { currentValuesMap = vm; },
    destroy() {},
  };
}
