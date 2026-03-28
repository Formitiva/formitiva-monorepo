import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
} from '@angular/core';
import { NgIf, NgStyle } from '@angular/common';
import { CSS_CLASSES } from '@formitiva/core';
import { FormitivaContextService } from '../../services/formitiva-context.service';
import type { DefinitionPropertyField } from '@formitiva/core';
import { TooltipComponent } from '../fields/base/tooltip.component';

/**
 * ErrorDiv - displays a field-level error message
 */
@Component({
  selector: 'fv-error-div',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [id]="id" [ngStyle]="style"><ng-content></ng-content></div>
  `,
  imports: [NgStyle],
})
export class ErrorDivComponent {
  @Input() id?: string;
  style = {
    color: 'var(--formitiva-error-color, red)',
    fontSize: '13px',
    marginTop: '4px',
    fontWeight: 'var(--formitiva-font-weight)',
    display: 'flex',
    flex: '1',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    userSelect: 'none',
  };
}

/**
 * ColumnFieldLayout - vertical label-above layout
 */
@Component({
  selector: 'fv-column-field-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [':host { display:block; width:100%; }'],
  imports: [NgIf, NgStyle, ErrorDivComponent, TooltipComponent],
  template: `
    <div [class]="fieldClass" [ngStyle]="rootStyle">
      <label
        *ngIf="showLabel"
        [id]="field.name + '-label'"
        [class]="labelClass"
        [attr.for]="field.name"
        [ngStyle]="labelStyle"
      >{{ ctx.t()(field.displayName) }}</label>
      <div [ngStyle]="rowStyle">
        <div style="flex:1;min-width:0">
          <ng-content></ng-content>
        </div>
        <fv-tooltip *ngIf="field.tooltip" [content]="field.tooltip"></fv-tooltip>
      </div>
      <fv-error-div *ngIf="error" [id]="field.name + '-error'">{{ error }}</fv-error-div>
    </div>
  `,
})
export class ColumnFieldLayoutComponent {
  @Input({ required: true }) field!: DefinitionPropertyField;
  @Input() error?: string | null;
  @Input() showLabel = true;

  readonly ctx = inject(FormitivaContextService);

  get labelAlignment(): 'center' | 'left' {
    return this.field.labelLayout === 'column-center' ? 'center' : 'left';
  }

  get fieldClass() { return `${CSS_CLASSES.field} column-layout`; }
  get labelClass() { return CSS_CLASSES.label; }

  get rootStyle() {
    return {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      gap: 'var(--formitiva-label-gap, 4px)',
    };
  }

  get labelStyle() {
    return {
      textAlign: this.labelAlignment,
      width: '100%',
      minWidth: 'unset',
      display: 'block',
      marginBottom: '10px',
    };
  }

  rowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--formitiva-inline-gap, 8px)',
    width: '100%',
  };
}

/**
 * RowFieldLayout - horizontal label-left layout
 */
@Component({
  selector: 'fv-row-field-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [':host { display:block; width:100%; }'],
  imports: [NgIf, ErrorDivComponent, TooltipComponent],
  template: `
    <div [class]="fieldClass">
      <label
        [id]="field.name + '-label'"
        [class]="labelClass"
        [attr.for]="field.name"
        style="text-align:left"
      >{{ ctx.t()(field.displayName) }}</label>
      <div style="display:flex;flex-direction:column;flex:1;min-width:0">
        <div style="display:flex;align-items:center;width:100%">
          <div style="flex:1;display:flex;align-items:center;min-width:0">
            <div [style.justifyContent]="rightAlign ? 'flex-end' : 'flex-start'"
                 style="display:flex;width:100%;min-width:0">
              <ng-content></ng-content>
            </div>
          </div>
          <div *ngIf="field.tooltip" style="margin-left:8px;display:flex;align-items:center">
            <fv-tooltip [content]="field.tooltip"></fv-tooltip>
          </div>
        </div>
        <fv-error-div *ngIf="error" [id]="field.name + '-error'">{{ error }}</fv-error-div>
      </div>
    </div>
  `,
})
export class RowFieldLayoutComponent {
  @Input({ required: true }) field!: DefinitionPropertyField;
  @Input() error?: string | null;
  @Input() rightAlign = false;

  readonly ctx = inject(FormitivaContextService);

  get fieldClass() { return CSS_CLASSES.field; }
  get labelClass() { return CSS_CLASSES.label; }
}

/**
 * StandardFieldLayout - renders row or column layout with a single projection slot
 */
@Component({
  selector: 'fv-standard-field-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [':host { display:block; width:100%; }'],
  imports: [NgIf, NgStyle, ErrorDivComponent, TooltipComponent],
  template: `
    <div [class]="fieldClass" [ngStyle]="rootStyle">
      <label
        *ngIf="showLabel"
        [id]="field.name + '-label'"
        [class]="labelClass"
        [attr.for]="field.name"
        [ngStyle]="labelStyle"
      >{{ ctx.t()(field.displayName) }}</label>

      <div [ngStyle]="contentColumnStyle">
        <div [ngStyle]="contentRowStyle">
          <div [ngStyle]="contentInnerStyle">
            <div [ngStyle]="controlWrapperStyle">
              <ng-content></ng-content>
            </div>
          </div>
          <div *ngIf="field.tooltip" [ngStyle]="tooltipStyle">
            <fv-tooltip [content]="field.tooltip"></fv-tooltip>
          </div>
        </div>
        <fv-error-div *ngIf="error" [id]="field.name + '-error'">{{ error }}</fv-error-div>
      </div>
    </div>
  `,
})
export class StandardFieldLayoutComponent {
  @Input({ required: true }) field!: DefinitionPropertyField;
  @Input() error?: string | null;
  @Input() rightAlign = false;

  readonly ctx = inject(FormitivaContextService);

  get fieldClass(): string {
    return this.useColumn ? `${CSS_CLASSES.field} column-layout` : CSS_CLASSES.field;
  }

  get labelClass(): string {
    return CSS_CLASSES.label;
  }

  get useColumn(): boolean {
    return (
      this.field.labelLayout === 'column-left' ||
      this.field.labelLayout === 'column-center' ||
      this.field.type === 'checkbox' ||
      this.field.type === 'switch'
    );
  }

  get showLabelInColumn(): boolean {
    return this.field.type !== 'checkbox' && this.field.type !== 'switch';
  }

  get showLabel(): boolean {
    return this.useColumn ? this.showLabelInColumn : true;
  }

  get rootStyle(): Record<string, string> | null {
    if (!this.useColumn) return null;
    return {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      gap: 'var(--formitiva-label-gap, 4px)',
    };
  }

  get labelStyle(): Record<string, string> | null {
    if (!this.useColumn) {
      return { textAlign: 'left' };
    }
    return {
      textAlign: this.field.labelLayout === 'column-center' ? 'center' : 'left',
      width: '100%',
      minWidth: 'unset',
      display: 'block',
      marginBottom: '10px',
    };
  }

  get contentColumnStyle(): Record<string, string> {
    return {
      display: 'flex',
      flexDirection: 'column',
      flex: this.useColumn ? '0 0 auto' : '1',
      width: '100%',
      minWidth: '0',
    };
  }

  get contentRowStyle(): Record<string, string> {
    return {
      display: 'flex',
      alignItems: 'center',
      gap: this.useColumn ? 'var(--formitiva-inline-gap, 8px)' : '0',
      width: '100%',
    };
  }

  get contentInnerStyle(): Record<string, string> {
    return {
      flex: '1',
      display: 'flex',
      alignItems: this.useColumn ? 'stretch' : 'center',
      minWidth: '0',
    };
  }

  get controlWrapperStyle(): Record<string, string> {
    if (this.useColumn) {
      return {
        width: '100%',
        minWidth: '0',
      };
    }
    return {
      display: 'flex',
      width: '100%',
      minWidth: '0',
      justifyContent: this.rightAlign ? 'flex-end' : 'flex-start',
    };
  }

  get tooltipStyle(): Record<string, string> {
    return this.useColumn
      ? { display: 'flex', alignItems: 'center' }
      : { marginLeft: '8px', display: 'flex', alignItems: 'center' };
  }
}

/**
 * InstanceName - editable instance name row above the field list
 */
@Component({
  selector: 'fv-instance-name',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:8px">
        <label style="font-size:0.85rem;color:var(--formitiva-color-text-muted, #888);white-space:nowrap">
          {{ ctx.t()('Instance name') }}:
        </label>
        <input
          type="text"
          [value]="name"
          (input)="onInput($event)"
          style="flex:1;font-size:0.85rem;border:1px solid var(--formitiva-border-color,#ccc);border-radius:var(--formitiva-border-radius,4px);padding:2px 6px;background:transparent;color:inherit;outline:none"
        />
      </div>
    </div>
  `,
})
export class InstanceNameComponent {
  @Input({ required: true }) name!: string;
  @Input({ required: true }) onChange!: (n: string) => void;

  readonly ctx = inject(FormitivaContextService);

  onInput(event: Event): void {
    this.onChange((event.target as HTMLInputElement).value);
  }
}
