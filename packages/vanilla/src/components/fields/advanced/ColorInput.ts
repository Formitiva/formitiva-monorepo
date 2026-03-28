import type { DefinitionPropertyField, FieldValueType } from '@formitiva/core';
import type { FormContext } from '../../../context/formitivaContext';
import type { FieldWidget } from '../../../core/fieldWidget';
import { createFieldValidator, type ValidationTrigger } from '../../../hooks/useFieldValidator';
import { createStandardFieldLayout } from '../../layout/LayoutComponents';
import { CSS_CLASSES, combineClasses } from '@formitiva/core';

const PREDEF_COLORS = [
  { label: 'Black', value: '#000000' }, { label: 'White', value: '#ffffff' },
  { label: 'Red', value: '#ff0000' }, { label: 'Green', value: '#008000' },
  { label: 'Blue', value: '#0000ff' }, { label: 'Yellow', value: '#ffff00' },
  { label: 'Cyan', value: '#00ffff' }, { label: 'Magenta', value: '#ff00ff' },
  { label: 'Orange', value: '#ffa500' }, { label: 'Purple', value: '#800080' },
  { label: 'Brown', value: '#a52a2a' }, { label: 'Gray', value: '#808080' },
  { label: 'Light Gray', value: '#d3d3d3' }, { label: 'Pink', value: '#ffc0cb' },
];
const HEX_RE = /^#([0-9A-F]{3}){1,2}$/i;

function normalize(c?: string): string {
  if (!c || !HEX_RE.test(c)) return '#000000';
  if (c.length === 4) return '#' + c.slice(1).split('').map(x => x + x).join('');
  return c.toLowerCase();
}

function toRGB(hex: string) {
  const v = parseInt(hex.slice(1), 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}

export default function createColorInput(
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

  let color = normalize(initialValue as string | undefined);
  let prevError = initialError;

  function emitError(err: string | null) {
    if (err !== prevError) { prevError = err; layout.setError(err); onError(err); }
  }

  function setColor(c: string, trigger: 'change' | 'blur') {
    color = normalize(c);
    swatch.style.backgroundColor = color;
    colorInput.value = color;
    populateSelect();
    emitError(validate(color, trigger));
    onChange(color);
  }

  const row = document.createElement('div');
  Object.assign(row.style, { display: 'flex', alignItems: 'center', gap: '8px', width: '100%' });

  const select = document.createElement('select');
  select.id = field.name;
  select.className = combineClasses(CSS_CLASSES.input, CSS_CLASSES.inputSelect);
  if (disabled) select.disabled = true;

  function populateSelect() {
    select.innerHTML = '';
    const isPred = PREDEF_COLORS.some(c => c.value === color);
    PREDEF_COLORS.forEach(opt => {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = ctx.t(opt.label);
      o.selected = color === opt.value;
      select.appendChild(o);
    });
    if (!isPred) {
      const { r, g, b } = toRGB(color);
      const o = document.createElement('option');
      o.value = color;
      o.textContent = `(${r}, ${g}, ${b})`;
      o.selected = true;
      select.appendChild(o);
    }
  }
  populateSelect();
  select.addEventListener('change', () => setColor(select.value, 'change'));
  select.addEventListener('blur', () => emitError(validate(color, 'blur')));

  // Swatch label wrapping hidden color input
  const swatch = document.createElement('label');
  Object.assign(swatch.style, { width: '2.5em', height: '1.8em', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: color, cursor: 'pointer', overflow: 'hidden', flexShrink: '0', display: 'block' });

  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.id = `${field.name}-color`;
  colorInput.value = color;
  Object.assign(colorInput.style, { opacity: '0', width: '100%', height: '100%', cursor: 'pointer' });
  if (disabled) colorInput.disabled = true;
  colorInput.addEventListener('input', () => setColor(colorInput.value, 'change'));
  colorInput.addEventListener('blur', () => emitError(validate(color, 'blur')));

  swatch.appendChild(colorInput);
  row.appendChild(select);
  row.appendChild(swatch);
  layout.slot.appendChild(row);
  if (initialError) layout.setError(initialError);
  emitError(validate(color, 'sync'));

  return {
    el: layout.el,
    update(value, error, dis) {
      errRef.current = error;
      color = normalize(value as string | undefined);
      swatch.style.backgroundColor = color;
      colorInput.value = color;
      populateSelect();
      select.disabled = dis ?? false;
      colorInput.disabled = dis ?? false;
      if (dis) layout.setError(null);
      else { emitError(validate(color, 'sync')); layout.setError(error); }
    },
    destroy() {},
  };
}
