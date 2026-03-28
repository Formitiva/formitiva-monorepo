import type { DefinitionPropertyField, FieldValueType } from '@formitiva/core';
import type { FormContext } from '../../../context/formitivaContext';
import type { FieldWidget } from '../../../core/fieldWidget';
import { createFieldValidator, type ValidationTrigger } from '../../../hooks/useFieldValidator';
import { createStandardFieldLayout } from '../../layout/LayoutComponents';
import { CSS_CLASSES } from '@formitiva/core';

export default function createCheckboxInput(
  field: DefinitionPropertyField,
  ctx: FormContext,
  onChange: (v: FieldValueType) => void,
  onError: (e: string | null) => void,
  initialValue: FieldValueType,
  initialError: string | null,
  disabled: boolean
): FieldWidget {
  const layout = createStandardFieldLayout(field, ctx, false);
  const errRef: { current: string | null } = { current: initialError };
  const validate = (v: FieldValueType, trigger?: ValidationTrigger) =>
    createFieldValidator(ctx, field, errRef.current)(v, trigger);

  let checked = Boolean(initialValue ?? false);
  let prevError = initialError;

  const row = document.createElement('div');
  Object.assign(row.style, { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' });

  const label = document.createElement('label');
  label.className = CSS_CLASSES.label;
  label.htmlFor = field.name;
  label.textContent = ctx.t(field.displayName);
  label.style.textAlign = 'left';
  label.style.justifyContent = 'flex-start';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = field.name;
  input.dataset.testid = 'boolean-checkbox';
  input.checked = checked;
  input.setAttribute('aria-checked', String(checked));
  input.setAttribute('aria-invalid', initialError ? 'true' : 'false');
  if (initialError) input.setAttribute('aria-describedby', `${field.name}-error`);
  if (disabled) input.disabled = true;
  Object.assign(input.style, { cursor: 'pointer', margin: '8px 0', width: '1.2em', height: '1.2em', verticalAlign: 'middle', accentColor: '#0000FF' });

  function emitError(err: string | null) {
    if (err !== prevError) {
      prevError = err;
      layout.setError(err);
      input.setAttribute('aria-invalid', err ? 'true' : 'false');
      if (err) input.setAttribute('aria-describedby', `${field.name}-error`);
      else input.removeAttribute('aria-describedby');
      onError(err);
    }
  }

  const handleChange = () => {
    checked = input.checked;
    input.setAttribute('aria-checked', String(checked));
    emitError(validate(checked, 'change'));
    onChange(checked);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const isSpace = e.key === ' ' || e.key === 'Space' || e.key === 'Spacebar' || e.code === 'Space';
    if (isSpace || e.key === 'Enter') {
      e.preventDefault();
      checked = !checked;
      input.checked = checked;
      input.setAttribute('aria-checked', String(checked));
      emitError(validate(checked, 'change'));
      onChange(checked);
    }
  };

  const handleBlur = () => emitError(validate(input.checked, 'blur'));

  input.addEventListener('change', handleChange);
  input.addEventListener('keydown', handleKeyDown);
  input.addEventListener('blur', handleBlur);

  row.appendChild(label);
  row.appendChild(input);
  layout.slot.appendChild(row);
  if (initialError) layout.setError(initialError);
  emitError(validate(checked, 'sync'));

  return {
    el: layout.el,
    update(value, error, dis) {
      errRef.current = error;
      checked = Boolean(value ?? false);
      input.checked = checked;
      input.disabled = dis ?? false;
      input.setAttribute('aria-checked', String(checked));
      if (dis) { layout.setError(null); }
      else { emitError(validate(checked, 'sync')); layout.setError(error); }
    },
    destroy() {
      input.removeEventListener('change', handleChange);
      input.removeEventListener('keydown', handleKeyDown);
      input.removeEventListener('blur', handleBlur);
    },
  };
}
