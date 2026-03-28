/**
 * Shared helper for simple text/number/date input fields.
 * Each simple field just calls createSimpleField with different options.
 */
import type { DefinitionPropertyField, FieldValueType } from '@formitiva/core';
import type { FormContext } from '../../context/formitivaContext';
import type { FieldWidget } from '../../core/fieldWidget';
import { createFieldValidator, type ValidationTrigger } from '../../hooks/useFieldValidator';
import { UncontrolledValidatedInput } from '../../hooks/useUncontrolledValidatedInput';
import { createStandardFieldLayout } from '../layout/LayoutComponents';

export interface SimpleFieldOptions {
  /** HTML input type */
  type: string;
  /** CSS class(es) to apply to the input */
  className: string;
  /** Convert the fieldValueType to a string for the input (default: String(v ?? '')) */
  getStrValue?: (v: FieldValueType) => string;
  /** Extra configuration after the input is created */
  configure?: (input: HTMLInputElement, field: DefinitionPropertyField) => void;
}

/** Returns a validate function that always reads the latest externalError via closure ref */
function makeValidate(
  ctx: FormContext,
  field: DefinitionPropertyField,
  errRef: { current: string | null }
) {
  return (v: FieldValueType, trigger?: ValidationTrigger) =>
    createFieldValidator(ctx, field, errRef.current)(v, trigger);
}

export function createSimpleField(
  field: DefinitionPropertyField,
  ctx: FormContext,
  onChange: (v: FieldValueType) => void,
  onError: (e: string | null) => void,
  initialValue: FieldValueType,
  initialError: string | null,
  disabled: boolean,
  opts: SimpleFieldOptions
): FieldWidget {
  const layout = createStandardFieldLayout(field, ctx);
  const errRef: { current: string | null } = { current: initialError };
  const validate = makeValidate(ctx, field, errRef);

  const input = document.createElement('input');
  input.type = opts.type;
  input.id = field.name;
  input.className = opts.className;

  const strOf = opts.getStrValue ?? ((v) => String(v ?? ''));
  const strValue = strOf(initialValue);
  input.value = strValue;
  if (disabled) input.disabled = true;
  if (field.placeholder) input.placeholder = field.placeholder;
  input.setAttribute('aria-invalid', initialError ? 'true' : 'false');
  if (initialError) input.setAttribute('aria-describedby', `${field.name}-error`);

  opts.configure?.(input, field);

  const uvi = new UncontrolledValidatedInput({ validate, onChange, onError });
  uvi.setRef(input, 0);

  const unsubError = uvi.onErrorChange((err) => {
    layout.setError(err);
    input.setAttribute('aria-invalid', err ? 'true' : 'false');
    if (err) input.setAttribute('aria-describedby', `${field.name}-error`);
    else input.removeAttribute('aria-describedby');
  });

  layout.slot.appendChild(input);
  if (initialError) layout.setError(initialError);

  const detach = uvi.attachListeners(strValue);

  return {
    el: layout.el,
    update(value, error, dis) {
      errRef.current = error;
      input.disabled = dis ?? false;
      const sv = strOf(value);
      if (dis) {
        input.value = sv;
        layout.setError(null);
      } else {
        layout.setError(error);
        uvi.syncValue(sv, false);
      }
    },
    destroy() {
      detach();
      unsubError();
    },
  };
}

/** Variant for textarea elements */
export function createTextareaField(
  field: DefinitionPropertyField,
  ctx: FormContext,
  onChange: (v: FieldValueType) => void,
  onError: (e: string | null) => void,
  initialValue: FieldValueType,
  initialError: string | null,
  disabled: boolean,
  className: string
): FieldWidget {
  const layout = createStandardFieldLayout(field, ctx);
  const errRef: { current: string | null } = { current: initialError };
  const validate = makeValidate(ctx, field, errRef);

  const textarea = document.createElement('textarea');
  textarea.id = field.name;
  textarea.className = className;
  textarea.value = String(initialValue ?? '');
  textarea.style.resize = 'vertical';
  textarea.style.minHeight = field.minHeight ?? '80px';
  textarea.style.width = '100%';
  textarea.style.boxSizing = 'border-box';
  if (disabled) textarea.disabled = true;

  const uvi = new UncontrolledValidatedInput<HTMLTextAreaElement>({ validate, onChange, onError });
  uvi.setRef(textarea, 0);

  const unsubError = uvi.onErrorChange((err) => layout.setError(err));
  layout.slot.appendChild(textarea);
  if (initialError) layout.setError(initialError);

  const detach = uvi.attachListeners(String(initialValue ?? ''));

  return {
    el: layout.el,
    update(value, error, dis) {
      errRef.current = error;
      textarea.disabled = dis ?? false;
      if (dis) { textarea.value = String(value ?? ''); layout.setError(null); }
      else { layout.setError(error); uvi.syncValue(String(value ?? ''), false); }
    },
    destroy() { detach(); unsubError(); },
  };
}
