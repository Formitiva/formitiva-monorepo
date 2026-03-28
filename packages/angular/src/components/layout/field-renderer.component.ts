import {
  ChangeDetectionStrategy,
  Component,
  Type,
  Input,
  Output,
  EventEmitter,
  inject,
} from '@angular/core';
import type { OnChanges, SimpleChanges } from '@angular/core';
import { NgIf, NgStyle, NgComponentOutlet } from '@angular/common';
import type { DefinitionPropertyField, FieldValueType, ErrorType } from '@formitiva/core';
import { getComponent } from '../../core/registries/component-registry';
import { FormitivaContextService } from '../../services/formitiva-context.service';

@Component({
  selector: 'fv-field-renderer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, NgStyle, NgComponentOutlet],
  template: `
    <div
      *ngIf="componentType"
      [attr.aria-disabled]="isDisabled || null"
      [ngStyle]="isDisabled ? { opacity: '0.6', pointerEvents: 'none' } : null"
    >
      <ng-container
        *ngComponentOutlet="componentType; inputs: componentInputs"
      ></ng-container>
    </div>
  `,
})
export class FieldRendererComponent implements OnChanges {
  @Input({ required: true }) field!: DefinitionPropertyField;
  @Input({ required: true }) valuesMap!: Record<string, FieldValueType>;
  @Input({ required: true }) handleChange!: (name: string, value: FieldValueType) => void;
  @Input() handleError?: (name: string, error: ErrorType) => void;
  @Input() errorsMap?: Record<string, string>;

  componentType: Type<unknown> | null = null;
  isDisabled = false;
  componentInputs: Record<string, unknown> = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['field'] || !this.componentType) {
      this.componentType = getComponent(this.field.type) ?? null;
    }
    this.isDisabled = Boolean(this.field.disabled);
    this.updateInputs();
  }

  private updateInputs(): void {
    const value = this.valuesMap[this.field.name];
    const error = this.errorsMap ? (this.errorsMap[this.field.name] ?? null) : null;

    if (this.field.type === 'button') {
      this.componentInputs = {
        field: this.field,
        value: null,
        disabled: this.isDisabled,
        valuesMap: this.valuesMap,
        handleChange: this.handleChange,
        handleError: this.handleError ?? (() => {}),
      };
    } else {
      this.componentInputs = {
        field: this.field,
        value,
        disabled: this.isDisabled,
        onChange: (v: FieldValueType) => this.handleChange(this.field.name, v),
        onError: (err: ErrorType) => this.handleError?.(this.field.name, err),
        error,
      };
    }
  }
}
