/**
 * Vanilla JS field validator utility.
 * Replaces the React useFieldValidator hook.
 */
import { validateField } from '@formitiva/core';
import type { DefinitionPropertyField, FieldValueType } from '@formitiva/core';
import type { FormContext } from '../context/formitivaContext';

export type ValidationTrigger = 'change' | 'blur' | 'sync';

/**
 * Returns a validator function for the given field, honouring the validation mode
 * from the current FormContext.
 */
export function createFieldValidator(
  ctx: FormContext,
  field: DefinitionPropertyField,
  externalError?: string | null
): (value: FieldValueType, trigger?: ValidationTrigger) => string | null {
  return (value: FieldValueType, trigger: ValidationTrigger = 'change'): string | null => {
    const mode = ctx.fieldValidationMode;
    if (mode === 'onEdit' || mode === 'realTime') {
      return validateField(ctx.definitionName, field, value, ctx.t) ?? null;
    }
    if (mode === 'onBlur') {
      return trigger === 'blur'
        ? (validateField(ctx.definitionName, field, value, ctx.t) ?? null)
        : (externalError ?? null);
    }
    // 'onSubmission'
    return externalError ?? null;
  };
}

