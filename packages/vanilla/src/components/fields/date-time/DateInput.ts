import { createSimpleField } from '../_fieldHelpers';
import { CSS_CLASSES, combineClasses } from '@formitiva/core';
import type { DefinitionPropertyField, FieldValueType } from '@formitiva/core';
import type { FormContext } from '../../../context/formitivaContext';
import type { FieldWidget } from '../../../core/fieldWidget';

function formatDateForInput(v?: string): string {
  if (!v) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const d = new Date(v);
    return isNaN(d.getTime()) ? '' : v;
  }
  const d = new Date(v);
  if (isNaN(d.getTime())) return '';
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export default function createDateInput(f: DefinitionPropertyField, ctx: FormContext, onChange: (v: FieldValueType) => void, onError: (e: string | null) => void, iv: FieldValueType, ie: string | null, dis: boolean): FieldWidget {
  return createSimpleField(f, ctx, onChange, onError, iv, ie, dis, {
    type: 'date',
    className: combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput),
    getStrValue: (v) => formatDateForInput(v as string | undefined),
    configure(input) {
      if (f.minDate) input.min = f.minDate;
      if (f.maxDate) input.max = f.maxDate;
    },
  });
}
