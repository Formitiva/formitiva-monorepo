/**
 * custom-component.component.ts — Custom Component Registration Example
 *
 * Shows the full workflow for registering a custom Angular component as a
 * Formitiva field type:
 *
 *  1. Create a component that extends `BaseFieldComponent<T>`.
 *  2. Register it with `registerComponent('type-name', ComponentClass)`.
 *  3. Register field-level and form-level validators as needed.
 *  4. Use `type: 'point2d'` in the definition and Formitiva will render
 *     the custom component.
 */
import { Component, signal } from '@angular/core';
import { FormitivaComponent } from '@formitiva/angular';
import {
  registerComponent,
  registerFieldCustomValidationHandler,
  registerFormValidationHandler,
} from '@formitiva/angular';
import type {
  FormSubmissionHandler,
  FormValidationHandler,
  FieldValueType,
  TranslationFunction,
} from '@formitiva/angular';
import { Point2DInputComponent } from './point2d-input.component';

// ── Register the custom component ─────────────────────────────────────────────
registerComponent('point2d', Point2DInputComponent);

// ── Field-level custom validator ──────────────────────────────────────────────
// Ensures coordinates are non-negative.
// Category key must match the definition name; handler key must match the
// field's `validationHandlerName` array: ["point2d", "nonNegativePoint"].
registerFieldCustomValidationHandler(
  'point2d',
  'nonNegativePoint',
  (_fieldName: string, value: FieldValueType | unknown, t: TranslationFunction) => {
    const [x, y] = value as unknown as [unknown, unknown];
    const xn = Number(x);
    const yn = Number(y);
    if (!Number.isFinite(xn)) return t('X must be a valid number');
    if (!Number.isFinite(yn)) return t('Y must be a valid number');
    if (xn < 0) return t('X must be ≥ 0');
    if (yn < 0) return t('Y must be ≥ 0');
    return undefined;
  }
);

// ── Form-level validator ──────────────────────────────────────────────────────
// Ensures top-left (pos2d_1) is geometrically above and to the left of
// bottom-right (pos2d_2).
const regionValidator: FormValidationHandler = (valuesMap, t) => {
  const p1 = valuesMap['pos2d_1'] as [unknown, unknown] | undefined;
  const p2 = valuesMap['pos2d_2'] as [unknown, unknown] | undefined;
  const x1 = Number(p1?.[0]);
  const y1 = Number(p1?.[1]);
  const x2 = Number(p2?.[0]);
  const y2 = Number(p2?.[1]);
  const errors: string[] = [];
  if (x1 > x2) errors.push(t('Top-Left X must be ≤ Bottom-Right X'));
  if (y1 > y2) errors.push(t('Top-Left Y must be ≤ Bottom-Right Y'));
  return errors.length > 0 ? errors : undefined;
};

registerFormValidationHandler('point2d:regionValidator', regionValidator);
// ─────────────────────────────────────────────────────────────────────────────

const definition = {
  name: 'RectangleRegion',
  displayName: 'Rectangle Region',
  version: '1.0.0',
  validationHandlerName: 'point2d:regionValidator',
  properties: [
    {
      type: 'point2d',
      name: 'pos2d_1',
      displayName: 'Top-Left Position',
      defaultValue: ['0', '0'],
      required: true,
      // References: category='point2d', handler='nonNegativePoint'
      validationHandlerName: ['point2d', 'nonNegativePoint'],
    },
    {
      type: 'point2d',
      name: 'pos2d_2',
      displayName: 'Bottom-Right Position',
      defaultValue: ['100', '100'],
      required: true,
    },
    {
      name: 'submitBtn',
      displayName: 'Save Region',
      type: 'button',
      action: 'submit',
    },
  ],
};

const initialInstance = {
  name: 'region1',
  version: '1.0.0',
  definition: 'RectangleRegion',
  values: {
    pos2d_1: ['10', '20'],
    pos2d_2: ['100', '200'],
  },
};

@Component({
  selector: 'app-custom-component',
  standalone: true,
  imports: [FormitivaComponent],
  template: `
    <div class="page-content">
      <h2>Custom Field Component</h2>
      <p class="desc">
        Extend <code>BaseFieldComponent&lt;T&gt;</code> to create a custom field,
        then call <code>registerComponent('point2d', MyComponent)</code>.
        Any field with <code>type: 'point2d'</code> will render your component.
        Field-level and form-level validators are registered separately.
      </p>

      <fv-formitiva
        [definitionData]="definition"
        [instance]="initialInstance"
        [onSubmit]="handleSubmit"
        theme="material"
      ></fv-formitiva>

      @if (lastSubmission()) {
        <div class="result-box success">{{ lastSubmission() }}</div>
      }
    </div>
  `,
})
export class CustomComponentComponent {
  definition = definition;
  initialInstance = initialInstance;
  lastSubmission = signal('');

  handleSubmit: FormSubmissionHandler = (_def, _instanceName, values, _t) => {
    this.lastSubmission.set(JSON.stringify(values, null, 2));
    return undefined;
  };
}
