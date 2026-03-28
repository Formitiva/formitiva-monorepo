import useFormitivaContext from './useFormitivaContext';
import { validateField } from '@formitiva/core';
import type { DefinitionPropertyField, FieldValueType } from '@formitiva/core';

export type ValidationTrigger = 'change' | 'blur' | 'sync';

export function useFieldValidator(field: DefinitionPropertyField, externalError?: string | null) {
  const ctx = useFormitivaContext();

  return (value: FieldValueType, trigger: ValidationTrigger = 'change') => {
    const mode = ctx.fieldValidationMode;
    // For edit/real-time modes, validate on change, blur, and sync
    if ((mode === 'onEdit' || mode === 'realTime') && (trigger === 'change' || trigger === 'blur' || trigger === 'sync')) {
      return validateField(ctx.definitionName, field, value, ctx.t);
    }

    // For onBlur mode, only validate on blur
    if (mode === 'onBlur' && trigger === 'blur') {
      return validateField(ctx.definitionName, field, value, ctx.t);
    }

    return externalError ?? null;
  };
}
