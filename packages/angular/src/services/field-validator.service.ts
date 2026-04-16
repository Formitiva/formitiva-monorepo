import { Injectable, inject } from '@angular/core';
import { resolveFieldValidation } from '@formitiva/core';
import { FormitivaContextService } from './formitiva-context.service';
import type { DefinitionPropertyField, FieldValueType, ValidationTrigger } from '@formitiva/core';
export type { ValidationTrigger } from '@formitiva/core';

@Injectable()
export class FieldValidatorService {
  private readonly ctx = inject(FormitivaContextService);

  validate(
    field: DefinitionPropertyField,
    value: FieldValueType,
    trigger: ValidationTrigger = 'change',
    externalError?: string | null
  ): string | null {
    return resolveFieldValidation(
      this.ctx.fieldValidationMode(),
      trigger,
      this.ctx.definitionName(),
      field,
      value,
      this.ctx.t(),
      externalError,
    );
  }
}
