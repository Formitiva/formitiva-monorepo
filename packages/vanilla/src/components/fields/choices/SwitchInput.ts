import type { DefinitionPropertyField, FieldValueType } from '@formitiva/core';
import type { FormContext } from '../../../context/formitivaContext';
import type { FieldWidget } from '../../../core/fieldWidget';
import { createFieldValidator, type ValidationTrigger } from '../../../hooks/useFieldValidator';
import { createStandardFieldLayout } from '../../layout/LayoutComponents';
import { CSS_CLASSES } from '@formitiva/core';

export default function createSwitchInput(
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

  let isOn = Boolean(initialValue ?? false);
  let prevError = initialError;

  const row = document.createElement('div');
  Object.assign(row.style, { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' });

  const fieldLabel = document.createElement('label');
  fieldLabel.className = CSS_CLASSES.label;
  fieldLabel.htmlFor = field.name;
  fieldLabel.textContent = ctx.t(field.displayName);
  fieldLabel.style.textAlign = 'left';

  // Switch track
  const track = document.createElement('span');
  track.role = 'switch';
  track.dataset.testid = 'switch';
  track.tabIndex = 0;
  track.setAttribute('aria-checked', String(isOn));
  track.setAttribute('aria-invalid', initialError ? 'true' : 'false');
  if (initialError) track.setAttribute('aria-describedby', `${field.name}-error`);

  function applyTrackStyle() {
    Object.assign(track.style, {
      display: 'inline-block',
      position: 'relative',
      width: '44px',
      height: '24px',
      borderRadius: '12px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background-color 0.3s',
      border: 'none',
      boxSizing: 'content-box',
      backgroundColor: isOn ? 'var(--formitiva-switch-on-bg, #22c55e)' : 'var(--formitiva-switch-off-bg, #ccc)',
    });
  }

  // Knob inside track
  const knob = document.createElement('span');
  Object.assign(knob.style, {
    position: 'absolute',
    height: '18px',
    width: '18px',
    top: '3px',
    left: '3px',
    backgroundColor: 'white',
    transition: 'transform 0.3s',
    borderRadius: '50%',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    transform: isOn ? 'translateX(20px)' : '',
  });
  track.appendChild(knob);

  if (field.name) {
    track.className = `formitiva-switch${isOn ? ' active checked on' : ''}`;
  }
  applyTrackStyle();

  function emitError(err: string | null) {
    if (err !== prevError) {
      prevError = err;
      layout.setError(err);
      track.setAttribute('aria-invalid', err ? 'true' : 'false');
      if (err) track.setAttribute('aria-describedby', `${field.name}-error`);
      else track.removeAttribute('aria-describedby');
      onError(err);
    }
  }

  function toggle() {
    if (disabled) return;
    isOn = !isOn;
    track.setAttribute('aria-checked', String(isOn));
    track.className = `formitiva-switch${isOn ? ' active checked on' : ''}`;
    knob.style.transform = isOn ? 'translateX(20px)' : 'translateX(0)';
    applyTrackStyle();
    emitError(validate(isOn, 'change'));
    onChange(isOn);
  }

  const handleClick = () => toggle();
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Space' || e.key === 'Enter') {
      e.preventDefault();
      toggle();
    }
  };
  const handleBlur = () => emitError(validate(isOn, 'blur'));

  track.addEventListener('click', handleClick);
  track.addEventListener('keydown', handleKeyDown);
  track.addEventListener('blur', handleBlur);

  row.appendChild(fieldLabel);
  row.appendChild(track);
  layout.slot.appendChild(row);
  if (initialError) layout.setError(initialError);
  emitError(validate(isOn, 'sync'));

  return {
    el: layout.el,
    update(value, error, dis) {
      errRef.current = error;
      isOn = Boolean(value ?? false);
      track.setAttribute('aria-checked', String(isOn));
      track.className = `formitiva-switch${isOn ? ' active checked on' : ''}`;
      knob.style.transform = isOn ? 'translateX(20px)' : '';
      applyTrackStyle();
      if (dis) { layout.setError(null); }
      else { emitError(validate(isOn, 'sync')); layout.setError(error); }
    },
    destroy() {
      track.removeEventListener('click', handleClick);
      track.removeEventListener('keydown', handleKeyDown);
      track.removeEventListener('blur', handleBlur);
    },
  };
}
