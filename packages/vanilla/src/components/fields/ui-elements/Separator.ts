import type { DefinitionPropertyField, FieldValueType } from '@formitiva/core';
import type { FormContext } from '../../../context/formitivaContext';
import type { FieldWidget } from '../../../core/fieldWidget';
import { isDarkTheme } from '@formitiva/core';

export default function createSeparator(
  field: DefinitionPropertyField,
  ctx: FormContext,
  _onChange: (v: FieldValueType) => void,
  _onError: (e: string | null) => void,
  _initialValue: FieldValueType,
  _initialError: string | null,
  _disabled: boolean
): FieldWidget {
  const f = field as { color?: string; thickness?: number; margin?: string | number; label?: string };
  const defaultColor = isDarkTheme(ctx.theme) ? '#444444' : '#CCCCCC';
  const color = f.color ?? defaultColor;
  const thickness = f.thickness ?? 1;
  const margin = f.margin != null ? (typeof f.margin === 'number' ? `${f.margin}px` : f.margin) : '8px 0';

  const el = document.createElement('div');
  // Expose theme-sensitive default as a CSS custom property for stylesheet overrides
  el.style.setProperty('--formitiva-separator-color', defaultColor);
  Object.assign(el.style, { width: 'auto', height: '0', borderTop: `${thickness}px solid ${color}`, margin });

  return { el, update() {}, destroy() {} };
}
