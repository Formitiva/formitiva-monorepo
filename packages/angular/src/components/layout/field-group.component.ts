import {
  ChangeDetectionStrategy,
  Component,
  Input,
  signal,
  inject,
} from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import type { DefinitionPropertyField, FieldValueType, ErrorType } from '@formitiva/core';
import { FieldRendererComponent } from './field-renderer.component';
import { FormitivaContextService } from '../../services/formitiva-context.service';

@Component({
  selector: 'fv-field-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, NgFor, FieldRendererComponent],
  template: `
    <fieldset class="formitiva-group">
      <legend (click)="toggle()" class="formitiva-group_legend">
        <span>{{ ctx.t()(groupName) }}</span>
        <span class="formitiva-group_legend_arrow">{{ isOpen() ? '▼' : '▶' }}</span>
      </legend>
      <ng-container *ngIf="isOpen()">
        <fv-field-renderer
          *ngFor="let field of fields; trackBy: trackByName"
          [field]="field"
          [valuesMap]="valuesMap"
          [handleChange]="handleChange"
          [handleError]="handleError"
          [errorsMap]="errorsMap"
          [disabledByRef]="disabledByRef"
        ></fv-field-renderer>
      </ng-container>
    </fieldset>
  `,
})
export class FieldGroupComponent {
  @Input({ required: true }) groupName!: string;
  @Input() defaultOpen = true;
  @Input({ required: true }) fields!: DefinitionPropertyField[];
  @Input({ required: true }) valuesMap!: Record<string, FieldValueType>;
  @Input({ required: true }) handleChange!: (name: string, value: FieldValueType) => void;
  @Input() handleError?: (name: string, error: ErrorType) => void;
  @Input() errorsMap?: Record<string, string>;
  @Input() disabledByRef?: Record<string, boolean>;

  readonly ctx = inject(FormitivaContextService);
  readonly isOpen = signal(true);

  toggle(): void {
    this.isOpen.update(v => !v);
  }

  trackByName(_: number, f: DefinitionPropertyField): string {
    return f.name;
  }
}
