import type { DefinitionPropertyField, FieldValueType } from '@formitiva/core';
import type { FormContext } from '../../../context/formitivaContext';
import type { FieldWidget } from '../../../core/fieldWidget';
import { createFieldValidator, type ValidationTrigger } from '../../../hooks/useFieldValidator';
import { createStandardFieldLayout } from '../../layout/LayoutComponents';
import { createPopupOptionMenu } from '../base/PopupOptionMenu';
import { getUnitFactors, convertTemperature } from '@formitiva/core';
import { CSS_CLASSES, combineClasses } from '@formitiva/core';

interface UnitOption { label: string; value: string; unit: string; }

export default function createUnitValueInput(
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
  const dimension = field.dimension as string | undefined;
  const unitFactors = dimension ? getUnitFactors(dimension) : null;

  if (!dimension || !unitFactors) {
    const msg = document.createElement('div');
    msg.textContent = ctx.t('No unit dimension configured');
    layout.slot.appendChild(msg);
    return { el: layout.el, update() {}, destroy() {} };
  }

  const arr = Array.isArray(initialValue) ? initialValue as [string, string] : ['', unitFactors.default];
  let inputVal = String(arr[0] ?? '');
  let selectedUnit = String(arr[1] ?? unitFactors.default);

  const validate = (v: FieldValueType, trigger?: ValidationTrigger) =>
    createFieldValidator(ctx, field, errRef.current)(v, trigger);

  let prevError = initialError;
  function emitError(err: string | null) {
    if (err !== prevError) { prevError = err; layout.setError(err); onError(err); }
  }

  let popupDestroy: (() => void) | null = null;

  const row = document.createElement('div');
  Object.assign(row.style, { display: 'flex', alignItems: 'center', gap: 'var(--formitiva-unit-gap, 8px)', width: '100%' });

  const textInput = document.createElement('input');
  textInput.type = 'text';
  textInput.id = field.name;
  textInput.value = inputVal;
  textInput.className = combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput);
  Object.assign(textInput.style, { flex: '1' });
  if (disabled) textInput.disabled = true;

  const select = document.createElement('select');
  select.className = combineClasses(CSS_CLASSES.input, CSS_CLASSES.inputSelect);
  Object.assign(select.style, { width: 'var(--formitiva-unit-select-width, 8em)' });
  if (disabled) select.disabled = true;

  function populateSelect() {
    select.innerHTML = '';
    unitFactors!.units.forEach(u => {
      const o = document.createElement('option');
      o.value = u;
      o.textContent = ctx.t(u);
      o.selected = u === selectedUnit;
      select.appendChild(o);
    });
  }
  populateSelect();

  const convBtn = document.createElement('button');
  convBtn.type = 'button';
  convBtn.textContent = '\u21C4';
  Object.assign(convBtn.style, {
    width: 'var(--formitiva-unit-btn-width, 2.5em)',
    padding: 'var(--formitiva-input-padding)',
    border: 'none',
    borderRadius: 'var(--formitiva-button-border-radius, var(--formitiva-border-radius, 0.25em))',
    backgroundColor: 'var(--formitiva-button-bg, var(--formitiva-success-color))',
    color: 'var(--formitiva-button-text, #ffffff)',
    cursor: 'pointer',
    alignSelf: 'center',
  });
  if (disabled) { convBtn.disabled = true; Object.assign(convBtn.style, { opacity: '0.6', cursor: 'not-allowed' }); }

  textInput.addEventListener('input', () => {
    inputVal = textInput.value;
    emitError(validate([inputVal, selectedUnit], 'change'));
    onChange([inputVal, selectedUnit]);
    updateConvBtn();
  });
  textInput.addEventListener('blur', () => emitError(validate([inputVal, selectedUnit], 'blur')));

  select.addEventListener('change', () => {
    selectedUnit = select.value;
    emitError(validate([inputVal, selectedUnit], 'change'));
    onChange([inputVal, selectedUnit]);
    updateConvBtn();
  });

  function updateConvBtn() {
    const parsed = parseFloat(inputVal);
    const hasErr = !!prevError;
    convBtn.disabled = disabled || hasErr || !Number.isFinite(parsed);
    convBtn.style.opacity = convBtn.disabled ? '0.6' : '1';
    convBtn.style.cursor = convBtn.disabled ? 'not-allowed' : 'pointer';
  }

  convBtn.addEventListener('click', () => {
    if (convBtn.disabled) return;
    const parsed = parseFloat(inputVal);
    if (!Number.isFinite(parsed)) return;
    if (popupDestroy) { popupDestroy(); popupDestroy = null; }

    const options: UnitOption[] = [];
    const isTemp = dimension === 'temperature';
    if (isTemp) {
      unitFactors!.units.forEach(toUnit => {
        const converted = convertTemperature(selectedUnit, toUnit, parsed);
        if (Number.isFinite(converted)) {
          options.push({ label: `${converted.toFixed(6)} ${ctx.t(toUnit)}`, value: converted.toString(), unit: toUnit });
        }
      });
    } else {
      const fromFactor = unitFactors!.factors[selectedUnit];
      if (fromFactor !== undefined) {
        Object.entries(unitFactors!.factors).forEach(([toUnit, toFactor]) => {
          const converted = (parsed / fromFactor) * toFactor;
          if (Number.isFinite(converted)) {
            options.push({ label: `${converted.toFixed(6)} ${ctx.t(toUnit)}`, value: converted.toString(), unit: toUnit });
          }
        });
      }
    }
    if (!options.length) return;

    const rect = convBtn.getBoundingClientRect();
    const popup = createPopupOptionMenu<UnitOption>(
      { x: rect.left, y: rect.bottom },
      options,
      () => { popupDestroy = null; },
      (opt) => {
        popupDestroy = null;
        inputVal = opt.value;
        selectedUnit = opt.unit;
        textInput.value = inputVal;
        populateSelect();
        emitError(validate([inputVal, selectedUnit], 'change'));
        onChange([inputVal, selectedUnit]);
        updateConvBtn();
      }
    );
    if (popup) popupDestroy = popup.destroy;
  });

  row.appendChild(textInput);
  row.appendChild(select);
  row.appendChild(convBtn);
  layout.slot.appendChild(row);
  if (initialError) layout.setError(initialError);
  emitError(validate([inputVal, selectedUnit], 'sync'));
  updateConvBtn();

  return {
    el: layout.el,
    update(value, error, dis) {
      errRef.current = error;
      const v = Array.isArray(value) ? value as [string, string] : ['', unitFactors!.default];
      inputVal = String(v[0] ?? '');
      selectedUnit = String(v[1] ?? unitFactors!.default);
      textInput.value = inputVal;
      populateSelect();
      const d = dis ?? false;
      disabled = d;
      textInput.disabled = d;
      select.disabled = d;
      if (d) { layout.setError(null); } else { emitError(validate([inputVal, selectedUnit], 'sync')); layout.setError(error); }
      updateConvBtn();
    },
    destroy() { if (popupDestroy) { popupDestroy(); popupDestroy = null; } },
  };
}
