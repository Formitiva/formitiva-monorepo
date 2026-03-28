import type { DefinitionPropertyField, FieldValueType } from '@formitiva/core';
import type { FormContext } from '../../../context/formitivaContext';
import type { FieldWidget } from '../../../core/fieldWidget';
import { CSS_CLASSES } from '@formitiva/core';

export default function createDescription(
  field: DefinitionPropertyField,
  ctx: FormContext,
  _onChange: (v: FieldValueType) => void,
  _onError: (e: string | null) => void,
  _initialValue: FieldValueType,
  _initialError: string | null,
  _disabled: boolean
): FieldWidget {
  const { displayText = '', textAlign = 'left', allowHtml = false } = field as { displayText?: string | string[]; textAlign?: string; allowHtml?: boolean };

  function translate(dt: string | string[]): string {
    if (Array.isArray(dt)) {
      const mapped = dt.map(d => ctx.t(d));
      return allowHtml ? mapped.join('') : mapped.join('\n');
    }
    return ctx.t(dt as string);
  }

  const el = document.createElement('div');
  el.className = CSS_CLASSES.description;
  el.style.textAlign = textAlign as string;

  function render() {
    el.innerHTML = '';
    const translated = translate(displayText);
    if (allowHtml) {
      el.innerHTML = translated;
    } else {
      const lines = translated.split(/\r\n|\r|\n/);
      lines.forEach(line => {
        const div = document.createElement('div');
        if (line === '') {
          div.appendChild(document.createElement('br'));
        } else {
          const normalized = line.replace(/\t/g, '\u00A0\u00A0\u00A0\u00A0').replace(/ /g, '\u00A0');
          div.textContent = normalized;
        }
        el.appendChild(div);
      });
    }
  }
  render();

  return {
    el,
    update() {},
    destroy() {},
  };
}
