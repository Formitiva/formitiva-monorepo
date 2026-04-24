/**
 * validation.component.ts — Form Validation Example
 *
 * Demonstrates two ways to add cross-field validation:
 *
 *  1. Via the definition's `validatorRef` property +
 *     `registerFormValidator()` (registered at module load time).
 *
 *  2. Via the `[onValidation]` @Input on <fv-formitiva> (inline handler).
 *
 * This example uses approach 1: registers a "rangeValidator" that ensures
 * lowerLimit < upperLimit before the form can submit.
 */
import { Component, signal } from '@angular/core';
import { FormitivaComponent, registerPlugin } from '@formitiva/angular';
import type { FormitivaPlugin, FormValidationHandler, FormSubmissionHandler } from '@formitiva/angular';

// ── Register the form-level validation handler (once, at module load) ─────────
// The handler is referenced by name in the definition's `validatorRef`.
const rangeValidator: FormValidationHandler = (valuesMap, t) => {
  const lower = Number(valuesMap['lowerLimit'] ?? NaN);
  const upper = Number(valuesMap['upperLimit'] ?? NaN);

  // If either is not a valid number, let field-level validators handle it.
  if (Number.isNaN(lower) || Number.isNaN(upper)) return undefined;

  if (!(lower < upper)) {
    return [t('Lower Limit must be less than Upper Limit.')];
  }
  return undefined;
};

const ValidationDemoPlugin: FormitivaPlugin = {
  name: 'validation-demo-plugin',
  version: '1.0.0',
  formValidators: { rangeValidator },
};
registerPlugin(ValidationDemoPlugin, { conflictResolution: 'skip' });

// ─────────────────────────────────────────────────────────────────────────────

const definition = {
  name: 'rangeForm',
  version: '1.0.0',
  displayName: 'Range Validation Demo',
  // References the handler registered above
  validatorRef: 'rangeValidator',
  properties: [
    {
      name: 'lowerLimit',
      displayName: 'Lower Limit',
      type: 'int',
      defaultValue: 0,
    },
    {
      name: 'upperLimit',
      displayName: 'Upper Limit',
      type: 'int',
      defaultValue: 10,
    },
    {
      name: 'description',
      displayName: 'Instructions',
      type: 'description',
      displayText:
        '<b>Instructions:</b><br/><br/>' +
        'This form demonstrates custom cross-field validation.<br/><br/>' +
        'Rule: <em>Lower Limit</em> must be strictly less than <em>Upper Limit</em>.<br/><br/>' +
        'Try setting Lower Limit ≥ Upper Limit and submitting — an error will appear.',
      allowHtml: true,
      defaultValue: '',
    },
  ],
};

@Component({
  selector: 'app-validation',
  standalone: true,
  imports: [FormitivaComponent],
  template: `
    <div class="page-content">
      <h2>Form Validation</h2>
      <p class="desc">
        Use a <code>FormitivaPlugin</code> with a <code>formValidators</code> map,
        then reference the validator name via <code>validatorRef</code> in the definition.
        The validator receives all field values and returns an array of error strings (or
        <code>undefined</code> for no errors).
      </p>

      <fv-formitiva
        [definitionData]="definition"
        [onSubmit]="handleSubmit"
        [displayInstanceName]="false"
        fieldValidationMode="onSubmission"
      ></fv-formitiva>

      @if (lastResult()) {
        <div class="result-box" [class.success]="!isError()" [class.error]="isError()">
          {{ lastResult() }}
        </div>
      }
    </div>
  `,
})
export class ValidationComponent {
  definition = definition;
  lastResult = signal('');
  isError = signal(false);

  handleSubmit: FormSubmissionHandler = (_def, _instanceName, values, _t) => {
    this.isError.set(false);
    this.lastResult.set(
      `Submitted successfully!\n\n${JSON.stringify(values, null, 2)}`
    );
    return undefined;
  };
}
