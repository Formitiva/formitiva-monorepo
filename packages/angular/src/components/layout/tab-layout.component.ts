import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { NgFor, NgIf, NgStyle } from '@angular/common';
import type { DefinitionPropertyField, LayoutConfig } from '@formitiva/core';
import { LayoutRenderContextService } from '../../services/layout-render-context.service';
import { FieldRendererComponent } from './field-renderer.component';
import { FieldGroupComponent } from './field-group.component';

@Component({
  selector: 'fv-tab-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFor, NgIf, NgStyle, FieldRendererComponent, FieldGroupComponent],
  template: `
    <div>
      <div role="tablist" [attr.aria-label]="config.displayName"
        style="display:flex;border-bottom:2px solid var(--formitiva-border,#d1d5db);margin-bottom:16px;gap:0;">
        <button *ngFor="let item of config.sections; trackBy: trackSection" type="button" role="tab"
          [attr.aria-selected]="item.name === activeSection"
          [ngStyle]="{ padding:'8px 20px', background:'transparent', border:'none',
            borderBottom: item.name === activeSection ? '2px solid var(--formitiva-tab-active-color,#1a73e8)' : '2px solid transparent',
            marginBottom:'-2px',
            color: item.name === activeSection ? 'var(--formitiva-tab-active-color,#1a73e8)' : 'var(--formitiva-text,inherit)',
            fontWeight: item.name === activeSection ? '600' : 'normal',
            cursor:'pointer', fontSize:'inherit', fontFamily:'inherit' }"
          (click)="onSectionChange(item.name)">{{ item.label }}</button>
      </div>
      <div role="tabpanel">
        <ng-container *ngFor="let group of ctx.visibleGroups(); trackBy: trackGroup">
          <fv-field-group *ngIf="group.name; else ungrouped" [groupName]="group.name" [fields]="group.fields"
            [valuesMap]="ctx.valuesMap()" [handleChange]="ctx.handleChange" [handleError]="ctx.handleError"
            [errorsMap]="ctx.errors()" [disabledByRef]="ctx.disabledByRef()"></fv-field-group>
          <ng-template #ungrouped>
            <fv-field-renderer *ngFor="let field of group.fields; trackBy: trackField" [field]="field"
              [valuesMap]="ctx.valuesMap()" [handleChange]="ctx.handleChange" [handleError]="ctx.handleError"
              [errorsMap]="ctx.errors()" [disabledByRef]="ctx.disabledByRef()"></fv-field-renderer>
          </ng-template>
        </ng-container>
        <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--formitiva-border,#d1d5db);">
          <button type="button" class="formitiva-button" style="width:120px;"
            [disabled]="ctx.isApplyDisabled()" (click)="ctx.handleSubmit()">{{ ctx.t()('Submit') }}</button>
        </div>
      </div>
    </div>
  `,
})
export class TabLayoutComponent {
  @Input({ required: true }) config!: LayoutConfig;
  @Input({ required: true }) activeSection!: string;
  @Input({ required: true }) onSectionChange!: (name: string) => void;
  readonly ctx = inject(LayoutRenderContextService);

  trackSection(_: number, section: { name: string }): string {
    return section.name;
  }

  trackGroup(index: number, group: { name: string | undefined }): string {
    return group.name ?? `ungrouped-${index}`;
  }

  trackField(_: number, field: DefinitionPropertyField): string {
    return field.name;
  }
}
