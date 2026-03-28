import type { DefinitionPropertyField, FieldValueType } from '@formitiva/core';
import type { FormContext } from '../../../context/formitivaContext';
import type { FieldWidget } from '../../../core/fieldWidget';
import { createFieldValidator, type ValidationTrigger } from '../../../hooks/useFieldValidator';
import { createStandardFieldLayout } from '../../layout/LayoutComponents';
import { CSS_CLASSES, combineClasses } from '@formitiva/core';

export default function createSliderInput(
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

  const min = field.min ?? 0;
  const max = field.max ?? 100;
  let prevError = initialError;
  let inputValue = !isNaN(Number(initialValue)) ? String(Number(initialValue)) : String(min);

  function emitError(err: string | null) {
    if (err !== prevError) { prevError = err; layout.setError(err); onError(err); }
  }

  const row = document.createElement('div');
  Object.assign(row.style, { display: 'flex', alignItems: 'center', gap: '8px', width: '100%' });

  const range = document.createElement('input');
  range.type = 'range';
  range.id = `${field.name}-range`;
  range.className = CSS_CLASSES.rangeInput;
  range.min = String(min);
  range.max = String(max);
  range.step = '1';
  range.value = inputValue;
  range.style.flex = '1';
  range.style.padding = '0';
  if (disabled) range.disabled = true;

  const text = document.createElement('input');
  text.type = 'text';
  text.id = field.name;
  text.className = combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput);
  text.value = inputValue;
  Object.assign(text.style, { width: '40px', minWidth: '40px', height: '2.3em', textAlign: 'center', flexShrink: '0' });
  if (disabled) text.disabled = true;

  function syncBoth(val: string, trigger: 'change' | 'blur') {
    inputValue = val;
    range.value = val;
    text.value = val;
    emitError(validate(val, trigger));
    onChange(val);
  }

  range.addEventListener('input', (e) => syncBoth((e.target as HTMLInputElement).value, 'change'));
  range.addEventListener('blur', () => emitError(validate(inputValue, 'blur')));
  text.addEventListener('input', (e) => syncBoth((e.target as HTMLInputElement).value, 'change'));
  text.addEventListener('blur', () => emitError(validate(inputValue, 'blur')));

  row.appendChild(range);
  row.appendChild(text);
  layout.slot.appendChild(row);
  if (initialError) layout.setError(initialError);
  emitError(validate(inputValue, 'sync'));

  return {
    el: layout.el,
    update(value, error, dis) {
      errRef.current = error;
      inputValue = !isNaN(Number(value)) ? String(Number(value)) : String(min);
      range.value = inputValue;
      text.value = inputValue;
      range.disabled = dis ?? false;
      text.disabled = dis ?? false;
      if (dis) layout.setError(null);
      else { emitError(validate(inputValue, 'sync')); layout.setError(error); }
    },
    destroy() {},
  };
}
