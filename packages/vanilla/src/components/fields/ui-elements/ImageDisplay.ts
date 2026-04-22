import type { DefinitionPropertyField, FieldValueType } from '@formitiva/core';
import type { FormContext } from '../../../context/formitivaContext';
import type { FieldWidget } from '../../../core/fieldWidget';

function getBaseUrl(): string {
  try { const m = (import.meta as { env?: { BASE_URL?: string } })?.env?.BASE_URL; if (typeof m === 'string') return m; } catch { /* ok */ }
  try { if (typeof process !== 'undefined' && process?.env?.PUBLIC_URL) return process.env.PUBLIC_URL; } catch { /* ok */ }
  return '/';
}

function resolveUrl(raw: string): string {
  if (!raw || raw.startsWith('/') || raw.startsWith('http')) return raw;
  return `${getBaseUrl()}${raw}`;
}

export default function createImageDisplay(
  field: DefinitionPropertyField,
  ctx: FormContext,
  _onChange: (v: FieldValueType) => void,
  _onError: (e: string | null) => void,
  initialValue: FieldValueType,
  _initialError: string | null,
  _disabled: boolean
): FieldWidget {
  const alignment = (field.alignment || 'center') as string;
  const alignMap: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' };
  const langs = (field as { localized?: string }).localized?.split(';').map(v => v.trim());
  const { width, height } = field as { width?: number; height?: number };

  const outer = document.createElement('div');
  const wrapper = document.createElement('div');
  Object.assign(wrapper.style, { display: 'flex', justifyContent: alignMap[alignment] || 'center', margin: '0 0' });
  wrapper.setAttribute('data-testid', 'image-wrapper');
  outer.appendChild(wrapper);

  const img = document.createElement('img');
  img.alt = ctx.t(field.displayName || 'Image');
  Object.assign(img.style, { borderRadius: '8px', objectFit: 'contain', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', margin: '0 0 8px 0' });
  if (width && height) { img.width = width; img.height = height; img.style.width = `${width}px`; img.style.height = `${height}px`; }
  else if (width) { img.width = width; img.style.width = `${width}px`; img.style.height = 'auto'; }
  else if (height) { img.height = height; img.style.width = 'auto'; img.style.height = `${height}px`; }

  let abortCtrl: AbortController | null = null;

  function loadImage(url: string) {
    if (!url) { img.remove(); return; }
    if (!wrapper.contains(img)) wrapper.appendChild(img);
    if (abortCtrl) abortCtrl.abort();
    abortCtrl = new AbortController();
    const controller = abortCtrl;
    const parts = url.split('/');
    const fileName = parts.pop()!;
    const dot = fileName.lastIndexOf('.');
    if (dot === -1) { img.src = url; return; }
    const base = fileName.substring(0, dot);
    const ext = fileName.substring(dot);
    if (langs?.includes(ctx.language)) {
      const localPath = [...parts, `${base}_${ctx.language}${ext}`].join('/');
      fetch(localPath, { method: 'HEAD', signal: controller.signal })
        .then(res => { if (!controller.signal.aborted) img.src = res.ok ? localPath : url; })
          .catch(() => { if (!controller.signal.aborted) img.src = url; })
          .finally(() => { if (abortCtrl === controller) abortCtrl = null; });
    } else {
      img.src = url;
    }
  }

  function getUrl(value: FieldValueType): string {
    const vs = typeof value === 'string' ? value.trim() : '';
    const raw = vs || (typeof field.defaultValue === 'string' ? field.defaultValue : '');
    return resolveUrl(raw);
  }

  loadImage(getUrl(initialValue));

  return {
    el: outer,
    update(value) { loadImage(getUrl(value)); },
    destroy() { if (abortCtrl) { abortCtrl.abort(); abortCtrl = null; } },
  };
}
