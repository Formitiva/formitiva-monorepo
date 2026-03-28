import type { DefinitionPropertyField, FieldValueType } from '@formitiva/core';
import type { FormContext } from '../../../context/formitivaContext';
import type { FieldWidget } from '../../../core/fieldWidget';
import { createFieldValidator, type ValidationTrigger } from '../../../hooks/useFieldValidator';
import { createStandardFieldLayout } from '../../layout/LayoutComponents';

export default function createRatingInput(
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

  const max = (field as { max?: number }).max ?? 5;
  const iconChar = ((field as { icon?: string }).icon?.trim()) || '\u2605';
  let rating = Math.min(Math.max(Number(initialValue ?? 0), 0), max);
  let hoverIdx = -1;
  let prevError = initialError;

  function emitError(err: string | null) {
    if (err !== prevError) { prevError = err; layout.setError(err); onError(err); }
  }

  const group = document.createElement('div');
  group.setAttribute('role', 'radiogroup');
  group.setAttribute('aria-labelledby', `${field.name}-label`);
  Object.assign(group.style, { display: 'flex', gap: '4px' });

  const stars: HTMLSpanElement[] = [];

  function updateStars() {
    stars.forEach((star, i) => {
      const active = i < rating;
      const hover = hoverIdx >= 0 && i <= hoverIdx;
      star.style.color = active || hover ? 'gold' : 'lightgray';
      star.setAttribute('aria-checked', String(active));
      star.tabIndex = rating > 0 ? (i === rating - 1 ? 0 : -1) : i === 0 ? 0 : -1;
    });
  }

  function select(val: number) {
    if (disabled) return;
    rating = Math.min(Math.max(val, 0), max);
    updateStars();
    emitError(validate(rating, 'change'));
    onChange(rating);
  }

  for (let i = 0; i < max; i++) {
    const star = document.createElement('span');
    star.setAttribute('role', 'radio');
    star.setAttribute('aria-label', `Rating ${i + 1}`);
    star.title = ctx.t(`${field.displayName} ${i + 1}`);
    star.textContent = iconChar;
    Object.assign(star.style, { cursor: 'pointer', fontSize: '1.5rem', lineHeight: '1', display: 'inline-block', marginRight: '0.25rem', userSelect: 'none', transition: 'color 0.12s ease' });

    const idx = i;
    star.addEventListener('click', () => select(idx + 1));
    star.addEventListener('mouseenter', () => { hoverIdx = idx; updateStars(); });
    star.addEventListener('mouseleave', () => { hoverIdx = -1; updateStars(); });
    star.addEventListener('keydown', (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Enter': case ' ': e.preventDefault(); select(idx + 1); break;
        case 'ArrowRight': case 'ArrowUp': e.preventDefault(); stars[Math.min(max - 1, idx + 1)]?.focus(); break;
        case 'ArrowLeft': case 'ArrowDown': e.preventDefault(); stars[Math.max(0, idx - 1)]?.focus(); break;
      }
    });
    stars.push(star);
    group.appendChild(star);
  }

  group.addEventListener('blur', (e: FocusEvent) => {
    if (!group.contains(e.relatedTarget as Node)) emitError(validate(rating, 'blur'));
  });

  updateStars();
  layout.slot.appendChild(group);
  if (initialError) layout.setError(initialError);
  emitError(validate(rating, 'sync'));

  return {
    el: layout.el,
    update(value, error, dis) {
      errRef.current = error;
      rating = Math.min(Math.max(Number(value ?? 0), 0), max);
      updateStars();
      if (dis) layout.setError(null);
      else { emitError(validate(rating, 'sync')); layout.setError(error); }
    },
    destroy() {},
  };
}
