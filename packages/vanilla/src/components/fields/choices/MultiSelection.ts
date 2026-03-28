import type { DefinitionPropertyField, FieldValueType } from '@formitiva/core';
import type { FormContext } from '../../../context/formitivaContext';
import type { FieldWidget } from '../../../core/fieldWidget';
import { createFieldValidator, type ValidationTrigger } from '../../../hooks/useFieldValidator';
import { createStandardFieldLayout } from '../../layout/LayoutComponents';

export default function createMultiSelection(
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

  const options = (field.options ?? []).map(o => ({ value: String(o.value), label: ctx.t(String(o.label)) }));
  const toSet = (val: FieldValueType): Set<string> => {
    const arr = Array.isArray(val) ? val : [];
    const allowed = new Set(options.map(o => o.value));
    return new Set(arr.filter(v => allowed.has(String(v))).map(String));
  };

  let selected = toSet(initialValue);
  let prevError = initialError;
  let popupEl: HTMLElement | null = null;
  let popupCleanup: (() => void) | null = null;

  function emitError(err: string | null) {
    if (err !== prevError) {
      prevError = err;
      layout.setError(err);
      onError(err);
    }
  }

  // Control button showing selected count
  const control = document.createElement('div');
  control.className = 'formitiva-input';
  control.tabIndex = 0;
  control.setAttribute('role', 'combobox');
  control.setAttribute('aria-haspopup', 'listbox');
  control.setAttribute('aria-expanded', 'false');
  Object.assign(control.style, { height: 'var(--formitiva-input-height, 2.5em)', display: 'flex', alignItems: 'center', boxSizing: 'border-box', padding: '0 0.75em', cursor: 'pointer', position: 'relative', userSelect: 'none' });

  const summary = document.createElement('span');
  summary.style.flex = '1';
  const chevron = document.createElement('span');
  chevron.innerHTML = '&#x25BC;';
  chevron.setAttribute('aria-hidden', 'true');
  Object.assign(chevron.style, { marginLeft: '6px', fontSize: '0.8em', color: 'var(--formitiva-text-muted, #999)' });
  control.appendChild(summary);
  control.appendChild(chevron);

  function updateSummary() {
    const count = selected.size;
    summary.textContent = count === 0 ? ctx.t('None selected') : count === options.length ? ctx.t('All selected') : `${count} ${ctx.t('selected')}`;
  }
  updateSummary();

  function closePopup() {
    popupCleanup?.();
    popupCleanup = null;
    popupEl?.remove();
    popupEl = null;
    control.setAttribute('aria-expanded', 'false');
  }

  function openPopup() {
    if (popupEl) { closePopup(); return; }
    control.setAttribute('aria-expanded', 'true');
    const rect = control.getBoundingClientRect();

    let root = document.getElementById('popup-root');
    if (!root) { root = document.createElement('div'); root.id = 'popup-root'; document.body.appendChild(root); }

    const popup = document.createElement('div');
    popup.setAttribute('role', 'listbox');
    popup.setAttribute('aria-multiselectable', 'true');
    Object.assign(popup.style, {
      position: 'fixed', top: `${rect.bottom}px`, left: `${rect.left}px`, width: `${Math.max(80, rect.width)}px`,
      maxHeight: '200px', overflowY: 'auto', background: 'var(--formitiva-secondary-bg, #fff)',
      border: '1px solid var(--formitiva-border-color, #ccc)', borderRadius: '4px', zIndex: '2000',
      boxShadow: 'var(--formitiva-shadow, 0 2px 8px rgba(0,0,0,0.15))', pointerEvents: 'auto',
    });
    popupEl = popup;

    options.forEach((opt) => {
      const row = document.createElement('label');
      Object.assign(row.style, { display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', cursor: 'pointer' });
      row.addEventListener('mouseenter', () => { row.style.background = 'var(--formitiva-option-menu-hover-bg, #eee)'; });
      row.addEventListener('mouseleave', () => { row.style.background = ''; });

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = selected.has(opt.value);
      cb.addEventListener('change', () => {
        if (cb.checked) selected.add(opt.value); else selected.delete(opt.value);
        updateSummary();
        const arr = [...selected];
        emitError(validate(arr, 'change'));
        onChange(arr);
      });

      const lbl = document.createElement('span');
      lbl.textContent = opt.label;
      row.appendChild(cb);
      row.appendChild(lbl);
      popup.appendChild(row);
    });

    root.appendChild(popup);

    function posUpdate() {
      if (!control.isConnected) { closePopup(); return; }
      const r = control.getBoundingClientRect();
      popup.style.top = `${Math.min(r.bottom, window.innerHeight - 220)}px`;
      popup.style.left = `${Math.min(r.left, window.innerWidth - Math.max(80, r.width))}px`;
    }
    window.addEventListener('scroll', posUpdate, true);
    window.addEventListener('resize', posUpdate);
    function outsideClick(e: MouseEvent) {
      if (!popup.contains(e.target as Node) && !control.contains(e.target as Node)) closePopup();
    }
    document.addEventListener('mousedown', outsideClick);
    popupCleanup = () => {
      window.removeEventListener('scroll', posUpdate, true);
      window.removeEventListener('resize', posUpdate);
      document.removeEventListener('mousedown', outsideClick);
    };
  }

  const handleClick = () => { if (!disabled) openPopup(); };
  const handleKeyDown = (e: KeyboardEvent) => { if ((e.key === 'Enter' || e.key === ' ') && !disabled) { e.preventDefault(); openPopup(); } };
  const handleBlur = (e: FocusEvent) => { if (!popupEl?.contains(e.relatedTarget as Node)) emitError(validate([...selected], 'blur')); };

  control.addEventListener('click', handleClick);
  control.addEventListener('keydown', handleKeyDown);
  control.addEventListener('blur', handleBlur);
  layout.slot.appendChild(control);
  if (initialError) layout.setError(initialError);
  emitError(validate([...selected], 'sync'));

  return {
    el: layout.el,
    update(value, error, dis) {
      errRef.current = error;
      selected = toSet(value);
      updateSummary();
      if (dis) { layout.setError(null); closePopup(); }
      else { emitError(validate([...selected], 'sync')); layout.setError(error); }
    },
    destroy() {
      closePopup();
      control.removeEventListener('click', handleClick);
      control.removeEventListener('keydown', handleKeyDown);
      control.removeEventListener('blur', handleBlur);
    },
  };
}
