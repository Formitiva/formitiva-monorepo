import type { DefinitionPropertyField, FieldValueType } from '@formitiva/core';
import type { FormContext } from '../../../context/formitivaContext';
import type { FieldWidget } from '../../../core/fieldWidget';
import { createFieldValidator, type ValidationTrigger } from '../../../hooks/useFieldValidator';
import { createStandardFieldLayout } from '../../layout/LayoutComponents';

function isDuplicateFile(file: File, list: File[]): boolean {
  return list.some(f => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified);
}

export default function createFileInput(
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

  let currentValue: File | File[] | null = initialValue as File | File[] | null;
  let prevError = initialError;

  function emitError(err: string | null) {
    if (err !== prevError) { prevError = err; layout.setError(err); onError(err); }
  }

  const wrapper = document.createElement('div');
  Object.assign(wrapper.style, { width: '100%' });

  // Hidden file input
  const hiddenInput = document.createElement('input');
  hiddenInput.type = 'file';
  hiddenInput.id = field.name;
  hiddenInput.style.display = 'none';
  if (field.accept) hiddenInput.accept = String(field.accept);
  if (field.multiple) hiddenInput.multiple = true;

  // Drop zone
  const zone = document.createElement('div');
  zone.className = 'formitiva-input';
  zone.setAttribute('role', 'button');
  zone.setAttribute('tabindex', '0');
  zone.setAttribute('aria-label', field.multiple ? ctx.t('Choose Files or Drag & Drop') : ctx.t('Choose File or Drag & Drop'));
  Object.assign(zone.style, {
    position: 'relative', borderStyle: 'dashed', borderWidth: '1px',
    borderRadius: 'var(--formitiva-border-radius, 4px)',
    padding: '8px 12px', textAlign: 'center',
    transition: 'all 0.2s ease', cursor: 'pointer',
    minHeight: 'var(--formitiva-input-height, 34px)', width: '100%',
    maxWidth: '100%', boxSizing: 'border-box',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    userSelect: 'none',
  });

  const icon = document.createElement('div');
  icon.textContent = '\uD83D\uDCC1';
  Object.assign(icon.style, { fontSize: '1.25rem', opacity: '0.6', lineHeight: '1', flexShrink: '0' });

  const label = document.createElement('div');
  Object.assign(label.style, { fontSize: '0.875rem', fontWeight: '400', color: 'var(--formitiva-text-color, #111827)', flex: '1', textAlign: 'left' });
  label.textContent = field.multiple ? ctx.t('Choose Files or Drag & Drop') : ctx.t('Choose File or Drag & Drop');

  zone.appendChild(hiddenInput);
  zone.appendChild(icon);
  zone.appendChild(label);

  // File list
  const fileList = document.createElement('div');
  Object.assign(fileList.style, { marginTop: '8px', marginLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' });

  function renderFileList() {
    const fragment = document.createDocumentFragment();
    const files = Array.isArray(currentValue) ? currentValue : currentValue ? [currentValue] : [];
    files.forEach((file, index) => {
      const row = document.createElement('div');
      Object.assign(row.style, { display: 'flex', gap: '8px', alignItems: 'center' });
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = file.name;
      nameInput.disabled = true;
      nameInput.readOnly = true;
      nameInput.title = file.name;
      nameInput.className = 'formitiva-input';
      Object.assign(nameInput.style, { flex: '1', cursor: 'default', opacity: '0.8', minWidth: '0' });
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = '\u00D7';
      removeBtn.setAttribute('aria-label', ctx.t('Remove file'));
      Object.assign(removeBtn.style, {
        background: 'transparent', border: 'none',
        color: 'var(--formitiva-color-error, #ef4444)',
        cursor: 'pointer', padding: '2px 6px', fontSize: '1.125rem', lineHeight: '1',
        borderRadius: '4px', transition: 'background-color 0.2s', flexShrink: '0',
      });
      removeBtn.addEventListener('mouseenter', () => { removeBtn.style.backgroundColor = 'var(--formitiva-bg-hover, #fee)'; });
      removeBtn.addEventListener('mouseleave', () => { removeBtn.style.backgroundColor = 'transparent'; });
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (Array.isArray(currentValue)) {
          const newFiles = (currentValue as File[]).filter((_, i) => i !== index);
          const selected = newFiles.length > 0 ? newFiles : null;
          currentValue = selected;
          emitError(validate(selected ?? [], 'change'));
          onChange(selected as FieldValueType);
        } else {
          currentValue = null;
          emitError(validate([], 'change'));
          onChange(null as unknown as FieldValueType);
        }
        renderFileList();
      });
      row.appendChild(nameInput);
      row.appendChild(removeBtn);
      fragment.appendChild(row);
    });
    fileList.replaceChildren(fragment);
  }

  function handleFiles(newFiles: File[]) {
    let selected: File | File[] | null = null;
    if (field.multiple) {
      const existing = Array.isArray(currentValue) ? currentValue as File[] : [];
      const unique = newFiles.filter(f => !isDuplicateFile(f, existing));
      selected = [...existing, ...unique];
    } else {
      selected = newFiles[0];
    }
    currentValue = selected;
    emitError(validate(selected ?? [], 'change'));
    onChange(selected as FieldValueType);
    renderFileList();
  }

  hiddenInput.addEventListener('change', (e) => {
    const input = (e.target as HTMLInputElement).files;
    if (input && input.length > 0) handleFiles(Array.from(input));
    (e.target as HTMLInputElement).value = '';
  });

  zone.addEventListener('click', () => { if (!disabled) hiddenInput.click(); });
  zone.addEventListener('keydown', (e) => {
    const key = (e as KeyboardEvent).key;
    if (key === 'Enter' || key === ' ') { e.preventDefault(); if (!disabled) hiddenInput.click(); }
  });
  zone.addEventListener('dragover', (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!disabled) { zone.style.borderColor = 'var(--formitiva-color-primary, #2563eb)'; label.textContent = ctx.t('Drop files here'); }
  });
  zone.addEventListener('dragleave', (e) => {
    e.preventDefault(); e.stopPropagation();
    zone.style.borderColor = '';
    label.textContent = field.multiple ? ctx.t('Choose Files or Drag & Drop') : ctx.t('Choose File or Drag & Drop');
  });
  zone.addEventListener('drop', (e) => {
    e.preventDefault(); e.stopPropagation();
    zone.style.borderColor = '';
    label.textContent = field.multiple ? ctx.t('Choose Files or Drag & Drop') : ctx.t('Choose File or Drag & Drop');
    if (!disabled) {
      const dt = (e as DragEvent).dataTransfer;
      if (dt && dt.files.length > 0) handleFiles(Array.from(dt.files));
    }
  });
  zone.addEventListener('blur', () => emitError(validate(currentValue ?? [], 'blur')));

  wrapper.appendChild(zone);
  wrapper.appendChild(fileList);
  layout.slot.appendChild(wrapper);

  if (initialError) layout.setError(initialError);
  emitError(validate(currentValue ?? [], 'sync'));
  renderFileList();

  return {
    el: layout.el,
    update(value, error, dis) {
      errRef.current = error;
      currentValue = value as File | File[] | null;
      disabled = dis ?? false;
      hiddenInput.disabled = disabled;
      zone.style.opacity = disabled ? '0.6' : '1';
      zone.style.cursor = disabled ? 'default' : 'pointer';
      if (disabled) layout.setError(null);
      else { emitError(validate(currentValue ?? [], 'sync')); layout.setError(error); }
      renderFileList();
    },
    destroy() {},
  };
}
