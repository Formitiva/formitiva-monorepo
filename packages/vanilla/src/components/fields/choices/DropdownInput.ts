import type { DefinitionPropertyField, FieldValueType } from '@formitiva/core';
import type { FormContext } from '../../../context/formitivaContext';
import type { FieldWidget } from '../../../core/fieldWidget';
import { createFieldValidator, type ValidationTrigger } from '../../../hooks/useFieldValidator';
import { createStandardFieldLayout } from '../../layout/LayoutComponents';
import { isDarkTheme } from '@formitiva/core';

export default function createDropdownInput(
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
  let currentValue = String(initialValue ?? (options[0]?.value ?? ''));
  let prevError = initialError;
  let popupEl: HTMLElement | null = null;
  let popupCleanup: (() => void) | null = null;

  function emitError(err: string | null) {
    if (err !== prevError) {
      prevError = err;
      layout.setError(err);
      control.setAttribute('aria-invalid', err ? 'true' : 'false');
      if (err) control.setAttribute('aria-describedby', `${field.name}-error`);
      else control.removeAttribute('aria-describedby');
      onError(err);
    }
  }

  // Validate + auto-correct initial value
  const initialErr = validate(currentValue, 'sync');
  if (initialErr && options.length > 0) {
    currentValue = String(options[0].value);
    onChange(currentValue);
  }

  // Custom dropdown control
  const control = document.createElement('div');
  control.className = 'formitiva-input';
  control.tabIndex = 0;
  control.setAttribute('role', 'combobox');
  control.setAttribute('aria-haspopup', 'listbox');
  control.setAttribute('aria-expanded', 'false');
  control.setAttribute('aria-invalid', initialError ? 'true' : 'false');
  if (initialError) control.setAttribute('aria-describedby', `${field.name}-error`);
  Object.assign(control.style, {
    height: 'var(--formitiva-input-height, 2.5em)',
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    padding: '0 0.75em',
    cursor: 'pointer',
    position: 'relative',
    textAlign: 'left',
  });

  const selectedSpan = document.createElement('span');
  Object.assign(selectedSpan.style, { flex: '1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '1.8em', display: 'block' });

  const arrow = document.createElement('span');
  arrow.innerHTML = '&#x25BC;';
  arrow.setAttribute('aria-hidden', 'true');
  Object.assign(arrow.style, { position: 'absolute', right: '0.7em', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '0.8em', color: 'var(--formitiva-text-muted, #999)' });

  control.appendChild(selectedSpan);
  control.appendChild(arrow);

  function getLabel(val: string): string {
    const opt = options.find(o => String(o.value) === val);
    return opt ? ctx.t(String(opt.label)) : '';
  }

  function updateLabel() {
    selectedSpan.textContent = getLabel(currentValue);
  }
  updateLabel();

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

    const isThemeDark = isDarkTheme(ctx.theme);
    const rect = control.getBoundingClientRect();

    let root = document.getElementById('popup-root');
    if (!root) { root = document.createElement('div'); root.id = 'popup-root'; document.body.appendChild(root); }

    // Sync CSS vars
    const formEl = control.closest('[data-formitiva-theme]');
    if (formEl && root) {
      const sts = getComputedStyle(formEl);
      ['--formitiva-secondary-bg','--formitiva-text-color','--formitiva-option-menu-hover-bg','--formitiva-border-color'].forEach(v => {
        root!.style.setProperty(v, sts.getPropertyValue(v));
      });
    }

    const popup = document.createElement('div');
    popup.setAttribute('role', 'listbox');
    popup.dataset.formitivaTheme = ctx.theme ?? 'light';
    Object.assign(popup.style, {
      position: 'fixed', top: `${rect.bottom}px`, left: `${rect.left}px`, width: `${Math.max(80, rect.width)}px`,
      maxHeight: '200px', overflowY: 'auto', background: 'var(--formitiva-secondary-bg, #fff)',
      border: '1px solid var(--formitiva-border-color, #ccc)', borderRadius: '4px', zIndex: '2000',
      boxShadow: 'var(--formitiva-shadow, 0 2px 8px rgba(0,0,0,0.15))', pointerEvents: 'auto',
      color: 'var(--formitiva-text-color, #000)', fontSize: 'var(--formitiva-popup-font-size, 0.875rem)',
    });
    popupEl = popup;

    let activeIdx = options.findIndex(o => String(o.value) === currentValue);
    if (activeIdx < 0) activeIdx = 0;

    const hoverBg = isThemeDark ? 'var(--formitiva-option-menu-hover-bg, rgba(255,255,255,0.08))' : 'var(--formitiva-option-menu-hover-bg, #eee)';

    const optEls: HTMLElement[] = options.map((opt, idx) => {
      const div = document.createElement('div');
      div.id = `${field.name}-opt-${idx}`;
      div.setAttribute('role', 'option');
      div.setAttribute('aria-selected', String(String(opt.value) === currentValue));
      div.tabIndex = idx === activeIdx ? 0 : -1;
      div.textContent = ctx.t(String(opt.label));
      Object.assign(div.style, { padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: String(opt.value) === currentValue ? 'bold' : 'normal', background: idx === activeIdx ? hoverBg : 'transparent' });

      div.addEventListener('mousedown', (e) => { e.stopPropagation(); selectOption(String(opt.value)); });
      div.addEventListener('mouseenter', () => { activeIdx = idx; setActive(idx); });
      div.addEventListener('mouseleave', () => { if (activeIdx === idx) setActive(-1); });
      return div;
    });

    function setActive(i: number) {
      optEls.forEach((el, j) => {
        el.tabIndex = j === i ? 0 : -1;
        el.style.background = j === i ? hoverBg : 'transparent';
      });
      if (i >= 0) requestAnimationFrame(() => optEls[i]?.focus());
    }

    popup.addEventListener('keydown', (e) => {
      const len = options.length;
      switch (e.key) {
        case 'ArrowDown': e.preventDefault(); activeIdx = (activeIdx + 1) % len; setActive(activeIdx); break;
        case 'ArrowUp': e.preventDefault(); activeIdx = (activeIdx - 1 + len) % len; setActive(activeIdx); break;
        case 'Home': e.preventDefault(); activeIdx = 0; setActive(0); break;
        case 'End': e.preventDefault(); activeIdx = len - 1; setActive(len - 1); break;
        case 'Enter': case ' ': e.preventDefault(); e.stopPropagation(); if (activeIdx >= 0) selectOption(String(options[activeIdx].value)); break;
        case 'Escape': e.preventDefault(); closePopup(); control.focus(); break;
      }
    });

    optEls.forEach(el => popup.appendChild(el));
    root.appendChild(popup);

    requestAnimationFrame(() => { setActive(activeIdx); });

    function posUpdate() {
      if (!control.isConnected) { closePopup(); return; }
      const r = control.getBoundingClientRect();
      popup.style.top = `${Math.min(r.bottom, window.innerHeight - 200)}px`;
      popup.style.left = `${Math.min(r.left, window.innerWidth - Math.max(80, r.width))}px`;
      popup.style.width = `${Math.max(80, r.width)}px`;
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

  function selectOption(val: string) {
    currentValue = val;
    updateLabel();
    const err = validate(val, 'change');
    emitError(err);
    onChange(val);
    closePopup();
  }

  const handleClick = () => { if (!disabled) openPopup(); };
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) { e.preventDefault(); openPopup(); }
  };
  const handleBlur = (e: FocusEvent) => {
    if (!popupEl?.contains(e.relatedTarget as Node)) emitError(validate(currentValue, 'blur'));
  };

  control.addEventListener('click', handleClick);
  control.addEventListener('keydown', handleKeyDown);
  control.addEventListener('blur', handleBlur);
  layout.slot.appendChild(control);
  if (initialError) layout.setError(initialError);
  emitError(validate(currentValue, 'sync'));

  return {
    el: layout.el,
    update(value, error, dis) {
      errRef.current = error;
      const val = String(value ?? (options[0]?.value ?? ''));
      if (val !== currentValue) { currentValue = val; updateLabel(); }
      if (dis) { layout.setError(null); closePopup(); }
      else { emitError(validate(currentValue, 'sync')); layout.setError(error); }
    },
    destroy() {
      closePopup();
      control.removeEventListener('click', handleClick);
      control.removeEventListener('keydown', handleKeyDown);
      control.removeEventListener('blur', handleBlur);
    },
  };
}
