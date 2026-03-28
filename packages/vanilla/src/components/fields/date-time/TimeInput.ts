import { createSimpleField } from '../_fieldHelpers';
import { CSS_CLASSES, combineClasses } from '@formitiva/core';
import type { DefinitionPropertyField, FieldValueType } from '@formitiva/core';
import type { FormContext } from '../../../context/formitivaContext';
import type { FieldWidget } from '../../../core/fieldWidget';

export default function createTimeInput(f: DefinitionPropertyField, ctx: FormContext, onChange: (v: FieldValueType) => void, onError: (e: string | null) => void, iv: FieldValueType, ie: string | null, dis: boolean): FieldWidget {
  return createSimpleField(f, ctx, onChange, onError, iv, ie, dis, {
    type: 'time',
    className: combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput),
    getStrValue: (v) => String(v ?? ''),
    configure(input) {
      input.step = String(f.includeSeconds ? 1 : 60);
      if (typeof f.min === 'string') input.min = f.min;
      if (typeof f.max === 'string') input.max = f.max;
    },
  });
}
