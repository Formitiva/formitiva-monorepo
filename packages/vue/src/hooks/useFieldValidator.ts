import useFormitivaContext from './useFormitivaContext';
import { resolveFieldValidation } from '@formitiva/core';
import type { DefinitionPropertyField, FieldValueType, ValidationTrigger } from '@formitiva/core';
export type { ValidationTrigger } from '@formitiva/core';

export function useFieldValidator(field: DefinitionPropertyField, externalError?: string | null) {
  const ctx = useFormitivaContext();

  return (value: FieldValueType, trigger: ValidationTrigger = 'change') =>
    resolveFieldValidation(ctx.fieldValidationMode, trigger, ctx.definitionName, field, value, ctx.t, externalError);
}
