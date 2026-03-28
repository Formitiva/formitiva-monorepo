import { createTextareaField } from '../_fieldHelpers';
import { CSS_CLASSES, combineClasses } from '@formitiva/core';
import type { DefinitionPropertyField, FieldValueType } from '@formitiva/core';
import type { FormContext } from '../../../context/formitivaContext';
import type { FieldWidget } from '../../../core/fieldWidget';

export default function createMultilineTextInput(f: DefinitionPropertyField, ctx: FormContext, onChange: (v: FieldValueType) => void, onError: (e: string | null) => void, iv: FieldValueType, ie: string | null, dis: boolean): FieldWidget {
  return createTextareaField(f, ctx, onChange, onError, iv, ie, dis, combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput));
}
