/**
 * fieldValidatorUtils.ts
 *
 * Shared field validation trigger type and mode-routing helper.
 * Previously duplicated in:
 *   - packages/react/src/hooks/useFieldValidator.ts
 *   - packages/vue/src/hooks/useFieldValidator.ts
 *   - packages/vanilla/src/hooks/useFieldValidator.ts
 *   - packages/angular/src/services/field-validator.service.ts
 */

import { validateField } from '../validation/validation';
import type { DefinitionPropertyField, FieldValueType, TranslationFunction } from '../core/formitivaTypes';

export type ValidationTrigger = 'change' | 'blur' | 'sync';

/**
 * Runs `validateField` or returns `externalError` depending on the active
 * validation mode and the trigger that fired.
 *
 * @param mode           - The form's fieldValidationMode ('onEdit' | 'realTime' | 'onBlur' | 'onSubmission')
 * @param trigger        - What triggered this validation call
 * @param definitionName - Form definition name (passed through to validateField)
 * @param field          - Field descriptor
 * @param value          - Current field value
 * @param t              - Translation function
 * @param externalError  - Error injected from the outside (e.g., server-side error)
 */
export function resolveFieldValidation(
  mode: string,
  trigger: ValidationTrigger,
  definitionName: string,
  field: DefinitionPropertyField,
  value: FieldValueType,
  t: TranslationFunction,
  externalError?: string | null,
): string | null {
  if (mode === 'onEdit' || mode === 'realTime') {
    return validateField(definitionName, field, value, t) ?? null;
  }

  if (mode === 'onBlur') {
    return trigger === 'blur'
      ? (validateField(definitionName, field, value, t) ?? null)
      : (externalError ?? null);
  }

  // 'onSubmission' or any unknown mode — rely on externally-injected error
  return externalError ?? null;
}
