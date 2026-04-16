/**
 * Vanilla JS field validator utility.
 * Replaces the React useFieldValidator hook.
 */
import { resolveFieldValidation } from '@formitiva/core';
import type { DefinitionPropertyField, FieldValueType, ValidationTrigger } from '@formitiva/core';
export type { ValidationTrigger } from '@formitiva/core';
import type { FormContext } from '../context/formitivaContext';

/**
 * Returns a validator function for the given field, honouring the validation mode
 * from the current FormContext.
 */
export function createFieldValidator(
  ctx: FormContext,
  field: DefinitionPropertyField,
  externalError?: string | null
): (value: FieldValueType, trigger?: ValidationTrigger) => string | null {
  return (value: FieldValueType, trigger: ValidationTrigger = 'change'): string | null =>
    resolveFieldValidation(ctx.fieldValidationMode, trigger, ctx.definitionName, field, value, ctx.t, externalError);
}

