/**
 * point2d-input.component.ts — Custom Field Component Demo
 *
 * Implements a `point2d` field type: two paired numeric inputs for X and Y.
 *
 * Key patterns shown:
 *  - Extend `BaseFieldComponent<T>` to integrate with Formitiva's validation
 *    pipeline and field validation mode (onEdit / onBlur / onSubmission).
 *  - Read `this.field`, `this.value`, `this.error`, `this.disabled` from the
 *    base class @Input properties.
 *  - Emit value changes via `this.emitChange(newValue)`.
 *  - Drive error display through `this.updateError(msg)` / `this.errorSig()`.
 *  - Register a type-level validation handler with
 *    `registerFieldTypeValidationHandler` so any `point2d` field is
 *    automatically validated.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  BaseFieldComponent,
  registerFieldTypeValidationHandler,
  StandardFieldLayoutComponent,
} from '@formitiva/angular';
import type {
  DefinitionPropertyField,
  FieldValueType,
  TranslationFunction,
} from '@formitiva/angular';

// ── Type-level validator (runs according to fieldValidationMode) ──────────────
registerFieldTypeValidationHandler(
  'point2d',
  (
    _field: DefinitionPropertyField,
    input: FieldValueType,
    t: TranslationFunction
  ) => {
    if (!Array.isArray(input) || input.length !== 2) {
      return t('Value must be a 2D point [x, y]');
    }
    const [x, y] = input;
    if (!Number.isFinite(Number(x))) return t('X must be a valid number');
    if (!Number.isFinite(Number(y))) return t('Y must be a valid number');
    return undefined;
  }
);
// ─────────────────────────────────────────────────────────────────────────────

export type Point2DValue = [string, string];

@Component({
  selector: 'app-point2d-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StandardFieldLayoutComponent],
  styles: [`
    .point2d-inputs {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      min-width: 0;
    }
    .point2d-inputs label {
      font-size: 0.82rem;
      color: #666;
      min-width: 16px;
    }
    .point2d-inputs input {
      width: 90px;
      padding: 6px 8px;
      border: 1px solid #d0d5dd;
      border-radius: 6px;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.15s;
    }
    .point2d-inputs input:focus {
      border-color: #6c63ff;
    }
  `],
  template: `
    <fv-standard-field-layout [field]="field" [error]="errorSig()">
      <div class="point2d-inputs">
        <label>X:</label>
        <input
          type="number"
          [value]="xVal"
          [disabled]="disabled"
          (input)="onXInput($event)"
          (blur)="onXBlur($event)"
        />
        <label>Y:</label>
        <input
          type="number"
          [value]="yVal"
          [disabled]="disabled"
          (input)="onYInput($event)"
          (blur)="onYBlur($event)"
        />
      </div>
    </fv-standard-field-layout>
  `,
})
export class Point2DInputComponent extends BaseFieldComponent<Point2DValue> {
  get xVal(): string {
    return Array.isArray(this.value) ? String(this.value[0] ?? '') : '';
  }

  get yVal(): string {
    return Array.isArray(this.value) ? String(this.value[1] ?? '') : '';
  }

  private emit(x: string, y: string, trigger: 'change' | 'blur' | 'sync'): void {
    const val: Point2DValue = [x, y];
    this.emitChange(val);
    this.updateError(this.doValidate(val, trigger));
  }

  onXInput(e: Event): void {
    this.emit((e.target as HTMLInputElement).value, this.yVal, 'change');
  }

  onXBlur(e: Event): void {
    this.emit((e.target as HTMLInputElement).value, this.yVal, 'blur');
  }

  onYInput(e: Event): void {
    this.emit(this.xVal, (e.target as HTMLInputElement).value, 'change');
  }

  onYBlur(e: Event): void {
    this.emit(this.xVal, (e.target as HTMLInputElement).value, 'blur');
  }
}
