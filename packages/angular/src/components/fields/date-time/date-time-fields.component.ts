import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import type { OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ReactiveStringFieldComponent } from '../base/base-field.component';
import { StandardFieldLayoutComponent } from '../../layout/layout-components.component';
import { CSS_CLASSES, combineClasses } from '@formitiva/core';

function formatDateForInput(val?: string): string {
  if (!val) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const parsed = new Date(val);
  if (isNaN(parsed.getTime())) return '';
  const y = parsed.getUTCFullYear();
  const m = String(parsed.getUTCMonth() + 1).padStart(2, '0');
  const d = String(parsed.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ----------------------------
// DateInput (type=date)
// ----------------------------
@Component({
  selector: 'fv-date-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, StandardFieldLayoutComponent],
  template: `
    <fv-standard-field-layout [field]="field" [error]="errorSig()">
      <input
        [id]="field.name"
        type="date"
        [formControl]="control"
        (blur)="onBlur()"
        [attr.min]="field.minDate || null"
        [attr.max]="field.maxDate || null"
        [class]="inputClass"
        [attr.aria-invalid]="!!errorSig() || null"
        [attr.aria-describedby]="errorSig() ? field.name + '-error' : null"
      />
    </fv-standard-field-layout>
  `,
})
export class DateInputComponent extends ReactiveStringFieldComponent
  implements OnInit, OnChanges, OnDestroy {
  inputClass = combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput);

  override ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      const saved = this.value;
      this.value = formatDateForInput(String(this.value ?? '')) as unknown as string | number;
      super.ngOnChanges(changes);
      this.value = saved;
    } else {
      super.ngOnChanges(changes);
    }
  }
}

// ----------------------------
// TimeInput (type=time)
// ----------------------------
@Component({
  selector: 'fv-time-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, StandardFieldLayoutComponent],
  template: `
    <fv-standard-field-layout [field]="field" [error]="errorSig()">
      <input
        [id]="field.name"
        type="time"
        [formControl]="control"
        (blur)="onBlur()"
        [step]="field.includeSeconds ? 1 : 60"
        [attr.min]="minStr"
        [attr.max]="maxStr"
        [class]="inputClass"
        [attr.aria-invalid]="!!errorSig() || null"
        [attr.aria-describedby]="errorSig() ? field.name + '-error' : null"
      />
    </fv-standard-field-layout>
  `,
})
export class TimeInputComponent extends ReactiveStringFieldComponent {
  inputClass = combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput);
  get minStr(): string | null { return typeof this.field.min === 'string' ? this.field.min : null; }
  get maxStr(): string | null { return typeof this.field.max === 'string' ? this.field.max : null; }
}
