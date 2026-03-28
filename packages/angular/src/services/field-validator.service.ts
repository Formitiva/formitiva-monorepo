import { Injectable, inject } from '@angular/core';
import { validateField } from '@formitiva/core';
import { FormitivaContextService } from './formitiva-context.service';
import type { DefinitionPropertyField, FieldValueType } from '@formitiva/core';

export type ValidationTrigger = 'change' | 'blur' | 'sync';

@Injectable()
export class FieldValidatorService {
  private readonly ctx = inject(FormitivaContextService);

  validate(
    field: DefinitionPropertyField,
    value: FieldValueType,
    trigger: ValidationTrigger = 'change',
    externalError?: string | null
  ): string | null {
    const mode = this.ctx.fieldValidationMode();
    const t = this.ctx.t();
    const definitionName = this.ctx.definitionName();

    if (mode === 'onEdit' || mode === 'realTime') {
      return validateField(definitionName, field, value, t) ?? null;
    }

    if (mode === 'onBlur') {
      return trigger === 'blur'
        ? (validateField(definitionName, field, value, t) ?? null)
        : (externalError ?? null);
    }

    return externalError ?? null;
  }
}
