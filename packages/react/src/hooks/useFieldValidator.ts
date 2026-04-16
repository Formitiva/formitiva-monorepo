import * as React from 'react';
import useFormitivaContext from './useFormitivaContext';
import { resolveFieldValidation } from '@formitiva/core';
import type { DefinitionPropertyField, FieldValueType, ValidationTrigger } from '@formitiva/core';
export type { ValidationTrigger } from '@formitiva/core';

export function useFieldValidator(field: DefinitionPropertyField, externalError?: string | null) {
  const { definitionName, t, fieldValidationMode } = useFormitivaContext();
  return React.useCallback(
    (value: FieldValueType, trigger: ValidationTrigger = 'change') =>
      resolveFieldValidation(fieldValidationMode, trigger, definitionName, field, value, t, externalError),
    [definitionName, field, t, fieldValidationMode, externalError]
  );
}
