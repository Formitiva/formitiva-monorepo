/**
 * PasswordInput - text input with show/hide toggle button
 */
import type { DefinitionPropertyField, FieldValueType } from '@formitiva/core';
import type { FormContext } from '../../../context/formitivaContext';
import type { FieldWidget } from '../../../core/fieldWidget';
import { createFieldValidator, type ValidationTrigger } from '../../../hooks/useFieldValidator';
import { UncontrolledValidatedInput } from '../../../hooks/useUncontrolledValidatedInput';
import { createStandardFieldLayout } from '../../layout/LayoutComponents';
import { CSS_CLASSES, combineClasses } from '@formitiva/core';

const SHOW_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>`;
const HIDE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3-11-8 1.02-2.35 2.77-4.28 4.78-5.54"/><path d="M1 1l22 22"/><path d="M9.88 9.88A3 3 0 0 0 14.12 14.12"/></svg>`;

export default function createPasswordInput(
  field: DefinitionPropertyField,
  ctx: FormContext,
  onChange: (v: FieldValueType) => void,
  onError: (e: string | null) => void,
  initialValue: FieldValueType,
  initialError: string | null,
  disabled: boolean
): FieldWidget {
  const layout = createStandardFieldLayout(field, ctx);
  const errRef: { current: string | null } = { current: initialError };
  const validate = (v: FieldValueType, trigger?: ValidationTrigger) =>
    createFieldValidator(ctx, field, errRef.current)(v, trigger);

  const input = document.createElement('input');
  input.type = 'password';
  input.id = field.name;
  input.className = combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput);
  input.value = String(initialValue ?? '');
  input.style.flex = '1';
  input.style.minWidth = '0';
  if (disabled) input.disabled = true;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.innerHTML = SHOW_SVG;
  btn.setAttribute('aria-label', ctx.t('Show password'));
  Object.assign(btn.style, { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', lineHeight: '1', padding: '4px 6px', flexShrink: '0' });

  let showPassword = false;
  btn.addEventListener('click', () => {
    showPassword = !showPassword;
    input.type = showPassword ? 'text' : 'password';
    btn.innerHTML = showPassword ? HIDE_SVG : SHOW_SVG;
    btn.setAttribute('aria-label', ctx.t(showPassword ? 'Hide password' : 'Show password'));
  });

  const row = document.createElement('div');
  Object.assign(row.style, { display: 'flex', alignItems: 'center', gap: '8px', width: '100%' });
  row.appendChild(input);
  row.appendChild(btn);

  const uvi = new UncontrolledValidatedInput({ validate, onChange, onError });
  uvi.setRef(input, 0);
  const unsubError = uvi.onErrorChange((err) => layout.setError(err));
  layout.slot.appendChild(row);
  if (initialError) layout.setError(initialError);
  const detach = uvi.attachListeners(String(initialValue ?? ''));

  return {
    el: layout.el,
    update(value, error, dis) {
      errRef.current = error;
      input.disabled = dis ?? false;
      btn.disabled = dis ?? false;
      if (dis) { input.value = String(value ?? ''); layout.setError(null); }
      else { layout.setError(error); uvi.syncValue(String(value ?? ''), false); }
    },
    destroy() { detach(); unsubError(); },
  };
}
