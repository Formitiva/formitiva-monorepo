import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import type { OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { ReactiveStringFieldComponent } from '../base/base-field.component';
import { StandardFieldLayoutComponent } from '../../layout/layout-components.component';
import { CSS_CLASSES, combineClasses } from '@formitiva/core';

// ----------------------------
// TextInput (type=text/string)
// ----------------------------
@Component({
  selector: 'fv-text-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, StandardFieldLayoutComponent],
  template: `
    <fv-standard-field-layout [field]="field" [error]="errorSig()">
      <input
        [id]="field.name"
        type="text"
        [formControl]="control"
        (blur)="onBlur()"
        [class]="inputClass"
        [placeholder]="field.placeholder || ''"
        [attr.aria-invalid]="!!errorSig() || null"
        [attr.aria-describedby]="errorSig() ? field.name + '-error' : null"
      />
    </fv-standard-field-layout>
  `,
})
export class TextInputComponent extends ReactiveStringFieldComponent {
  inputClass = combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput);
}

// ----------------------------
// IntegerInput (type=int)
// ----------------------------
@Component({
  selector: 'fv-integer-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, StandardFieldLayoutComponent],
  template: `
    <fv-standard-field-layout [field]="field" [error]="errorSig()">
      <input
        [id]="field.name"
        type="text"
        [formControl]="control"
        (blur)="onBlur()"
        [class]="inputClass"
        [attr.aria-invalid]="!!errorSig() || null"
        [attr.aria-describedby]="errorSig() ? field.name + '-error' : null"
      />
    </fv-standard-field-layout>
  `,
})
export class IntegerInputComponent extends ReactiveStringFieldComponent {
  inputClass = combineClasses(CSS_CLASSES.input, CSS_CLASSES.inputNumber);
}

// ----------------------------
// FloatInput (type=float)
// ----------------------------
@Component({
  selector: 'fv-float-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, StandardFieldLayoutComponent],
  template: `
    <fv-standard-field-layout [field]="field" [error]="errorSig()">
      <input
        [id]="field.name"
        type="text"
        [formControl]="control"
        (blur)="onBlur()"
        [class]="inputClass"
        [attr.aria-invalid]="!!errorSig() || null"
        [attr.aria-describedby]="errorSig() ? field.name + '-error' : null"
      />
    </fv-standard-field-layout>
  `,
})
export class FloatInputComponent extends ReactiveStringFieldComponent {
  inputClass = combineClasses(CSS_CLASSES.input, CSS_CLASSES.inputNumber);
}

// ----------------------------
// MultilineTextInput (type=multiline)
// ----------------------------
@Component({
  selector: 'fv-multiline-text-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, StandardFieldLayoutComponent],
  template: `
    <fv-standard-field-layout [field]="field" [error]="errorSig()">
      <textarea
        [id]="field.name"
        [formControl]="control"
        (blur)="onBlur()"
        [style.min-height]="field.minHeight || '80px'"
        style="resize:vertical;width:100%;box-sizing:border-box"
        [class]="inputClass"
        [attr.aria-invalid]="!!errorSig() || null"
        [attr.aria-describedby]="errorSig() ? field.name + '-error' : null"
      ></textarea>
    </fv-standard-field-layout>
  `,
})
export class MultilineTextInputComponent extends ReactiveStringFieldComponent {
  inputClass = combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput);
}

// ----------------------------
// IntegerArrayInput (type=int-array)
// ----------------------------
@Component({
  selector: 'fv-integer-array-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, StandardFieldLayoutComponent],
  template: `
    <fv-standard-field-layout [field]="field" [error]="errorSig()">
      <input
        [id]="field.name"
        type="text"
        [formControl]="control"
        (blur)="onBlur()"
        [class]="inputClass"
        style="flex:1"
        [attr.aria-invalid]="!!errorSig() || null"
        [attr.aria-describedby]="errorSig() ? field.name + '-error' : null"
      />
    </fv-standard-field-layout>
  `,
})
export class IntegerArrayInputComponent extends ReactiveStringFieldComponent
  implements OnInit, OnChanges, OnDestroy {
  inputClass = combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput);

  override ngOnChanges(changes: SimpleChanges): void {
    // Convert array to comma-separated string before syncing to FormControl
    if (changes['value']) {
      const raw = this.value;
      const asStr = Array.isArray(raw) ? (raw as unknown[]).join(', ') : String(raw ?? '');
      // Temporarily swap value so parent can do its init check
      const saved = this.value;
      this.value = asStr as unknown as string | number;
      super.ngOnChanges(changes);
      this.value = saved;
    } else {
      super.ngOnChanges(changes);
    }
  }
}

// ----------------------------
// FloatArrayInput (type=float-array)
// ----------------------------
@Component({
  selector: 'fv-float-array-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, StandardFieldLayoutComponent],
  template: `
    <fv-standard-field-layout [field]="field" [error]="errorSig()">
      <input
        [id]="field.name"
        type="text"
        [formControl]="control"
        (blur)="onBlur()"
        [class]="inputClass"
        style="flex:1"
        [attr.aria-invalid]="!!errorSig() || null"
        [attr.aria-describedby]="errorSig() ? field.name + '-error' : null"
      />
    </fv-standard-field-layout>
  `,
})
export class FloatArrayInputComponent extends ReactiveStringFieldComponent
  implements OnInit, OnChanges, OnDestroy {
  inputClass = combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput);

  override ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      const raw = this.value;
      const asStr = Array.isArray(raw) ? (raw as unknown[]).join(', ') : String(raw ?? '');
      const saved = this.value;
      this.value = asStr as unknown as string | number;
      super.ngOnChanges(changes);
      this.value = saved;
    } else {
      super.ngOnChanges(changes);
    }
  }
}

// ----------------------------
// NumericStepperInput (type=stepper)
// ----------------------------
@Component({
  selector: 'fv-numeric-stepper-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, StandardFieldLayoutComponent],
  template: `
    <fv-standard-field-layout [field]="field" [error]="errorSig()">
      <input
        [id]="field.name"
        type="number"
        [formControl]="control"
        (blur)="onBlur()"
        [min]="field.min ?? null"
        [max]="field.max ?? null"
        [step]="step"
        style="width:100%;height:100%"
        [class]="CSS_CLASSES.input"
        [attr.aria-invalid]="!!errorSig() || null"
        [attr.aria-describedby]="errorSig() ? field.name + '-error' : null"
      />
    </fv-standard-field-layout>
  `,
})
export class NumericStepperInputComponent extends ReactiveStringFieldComponent {
  CSS_CLASSES = CSS_CLASSES;
  get step(): number { return Math.max(1, Math.round(this.field.step ?? 1)); }
}

// ----------------------------
// PasswordInput (type=password)
// ----------------------------
@Component({
  selector: 'fv-password-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, ReactiveFormsModule, StandardFieldLayoutComponent],
  template: `
    <fv-standard-field-layout [field]="field" [error]="errorSig()">
      <div style="display:flex;align-items:center;gap:8px;width:100%;min-width:0">
        <input
          [id]="field.name"
          [type]="showPassword ? 'text' : 'password'"
          [formControl]="control"
          (blur)="onBlur()"
          [class]="inputClass"
          [placeholder]="field.placeholder || ''"
          [attr.aria-invalid]="!!errorSig() || null"
          [attr.aria-describedby]="errorSig() ? field.name + '-error' : null"
          style="flex:1;min-width:0"
        />
        <button
          type="button"
          (click)="togglePasswordVisibility()"
          [disabled]="disabled"
          [attr.aria-label]="showPassword ? ctx.t()('Hide password') : ctx.t()('Show password')"
          [title]="showPassword ? ctx.t()('Hide password') : ctx.t()('Show password')"
          style="flex:none;display:inline-flex;align-items:center;justify-content:center;width:var(--formitiva-input-height, 2.5em);height:var(--formitiva-input-height, 2.5em);padding:0;border:1px solid var(--formitiva-border-color, #ccc);border-radius:var(--formitiva-border-radius, 4px);background:var(--formitiva-secondary-bg, #fff);color:var(--formitiva-text-color, #111);line-height:0;cursor:pointer"
        >
          <svg
            *ngIf="!showPassword"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            focusable="false"
            style="display:block"
          >
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <svg
            *ngIf="showPassword"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            focusable="false"
            style="display:block"
          >
            <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3-11-8 1.02-2.35 2.77-4.28 4.78-5.54"></path>
            <path d="M1 1l22 22"></path>
            <path d="M9.88 9.88A3 3 0 0 0 14.12 14.12"></path>
          </svg>
        </button>
      </div>
    </fv-standard-field-layout>
  `,
})
export class PasswordInputComponent extends ReactiveStringFieldComponent {
  inputClass = combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput);
  showPassword = false;

  togglePasswordVisibility(): void {
    if (this.disabled) return;
    this.showPassword = !this.showPassword;
  }
}
