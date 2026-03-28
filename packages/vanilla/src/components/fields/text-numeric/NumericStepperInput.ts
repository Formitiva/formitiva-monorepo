import { createSimpleField } from '../_fieldHelpers';
import { CSS_CLASSES } from '@formitiva/core';
import type { DefinitionPropertyField, FieldValueType } from '@formitiva/core';
import type { FormContext } from '../../../context/formitivaContext';
import type { FieldWidget } from '../../../core/fieldWidget';

export default function createNumericStepperInput(f: DefinitionPropertyField, ctx: FormContext, onChange: (v: FieldValueType) => void, onError: (e: string | null) => void, iv: FieldValueType, ie: string | null, dis: boolean): FieldWidget {
  const step = Math.max(1, Math.round(f.step ?? 1));
  return createSimpleField(f, ctx, onChange, onError, iv, ie, dis, {
    type: 'number',
    className: CSS_CLASSES.input,
    configure(input) {
      if (f.min != null) input.min = String(f.min);
      if (f.max != null) input.max = String(f.max);
      input.step = String(step);
      input.style.width = '100%';
      input.style.height = '100%';
    },
  });
}
