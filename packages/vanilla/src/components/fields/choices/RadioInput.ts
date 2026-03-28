import type { DefinitionPropertyField, FieldValueType } from '@formitiva/core';
import type { FormContext } from '../../../context/formitivaContext';
import type { FieldWidget } from '../../../core/fieldWidget';
import { createFieldValidator, type ValidationTrigger } from '../../../hooks/useFieldValidator';
import { createStandardFieldLayout } from '../../layout/LayoutComponents';

export default function createRadioInput(
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

  const options = field.options ?? [];
  const layout2: 'row' | 'column' =
    (field.layout as string | undefined)?.toLowerCase() === 'horizontal' ? 'row' : 'column';
  let currentValue = initialValue != null ? String(initialValue) : '';
  let prevError = initialError;

  const container = document.createElement('div');
  Object.assign(container.style, {
    display: 'flex',
    flexDirection: layout2,
    flexWrap: layout2 === 'row' ? 'wrap' : 'nowrap',
    gap: '4px',
    width: '100%',
  });

  function emitError(err: string | null) {
    if (err !== prevError) {
      prevError = err;
      layout.setError(err);
      onError(err);
    }
  }

  const inputs: HTMLInputElement[] = [];

  options.forEach((opt) => {
    const optVal = String(opt.value);
    const id = `${field.name}-${optVal}`;

    const item = document.createElement('label');
    Object.assign(item.style, { display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px 8px' });

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = field.name;
    radio.id = id;
    radio.value = optVal;
    radio.checked = currentValue === optVal;
    radio.style.cssText = 'flex-shrink:0;cursor:pointer;margin:0;';
    if (disabled) radio.disabled = true;

    radio.addEventListener('change', () => {
      if (radio.checked) {
        currentValue = optVal;
        emitError(validate(optVal, 'change'));
        onChange(optVal);
      }
    });
    radio.addEventListener('blur', () => emitError(validate(radio.value, 'blur')));

    const lbl = document.createElement('span');
    lbl.textContent = ctx.t(String(opt.label));

    item.appendChild(radio);
    item.appendChild(lbl);
    container.appendChild(item);
    inputs.push(radio);
  });

  layout.slot.appendChild(container);
  if (initialError) layout.setError(initialError);

  // Auto-select first option if current value is invalid
  const initialErr = validate(currentValue, 'sync');
  if (initialErr && options.length > 0) {
    const firstVal = String(options[0].value);
    currentValue = firstVal;
    inputs[0].checked = true;
    onChange(firstVal);
  }
  emitError(validate(currentValue, 'sync'));

  return {
    el: layout.el,
    update(value, error, dis) {
      errRef.current = error;
      currentValue = value != null ? String(value) : '';
      inputs.forEach((radio) => {
        radio.checked = radio.value === currentValue;
        radio.disabled = dis ?? false;
      });
      if (dis) { layout.setError(null); }
      else { emitError(validate(currentValue, 'sync')); layout.setError(error); }
    },
    destroy() {
      // inputs removed with container automatically
    },
  };
}
