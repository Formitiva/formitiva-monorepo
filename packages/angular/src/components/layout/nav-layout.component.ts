import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { NgFor, NgIf, NgStyle } from '@angular/common';
import type { DefinitionPropertyField, LayoutConfig } from '@formitiva/core';
import { LayoutRenderContextService } from '../../services/layout-render-context.service';
import { FieldRendererComponent } from './field-renderer.component';
import { FieldGroupComponent } from './field-group.component';

@Component({
  selector: 'fv-nav-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFor, NgIf, NgStyle, FieldRendererComponent, FieldGroupComponent],
  template: `
    <div style="display:flex;gap:0;min-height:200px;">
      <nav [attr.aria-label]="config.displayName" style="min-width:160px;border-right:1px solid var(--formitiva-border,#d1d5db);flex-shrink:0;">
        <button
          *ngFor="let item of config.sections; trackBy: trackSection"
          type="button"
          [attr.aria-current]="item.name === activeSection ? 'page' : null"
          [ngStyle]="{ display:'block', width:'100%', textAlign:'left', padding:'10px 16px',
            background: item.name === activeSection ? 'var(--formitiva-nav-active-bg,#e8f0fe)' : 'transparent',
            color: item.name === activeSection ? 'var(--formitiva-nav-active-color,#1a73e8)' : 'var(--formitiva-text,inherit)',
            fontWeight: item.name === activeSection ? '600' : 'normal',
            border: 'none',
            borderLeft: item.name === activeSection ? '3px solid var(--formitiva-nav-active-color,#1a73e8)' : '3px solid transparent',
            cursor: 'pointer', fontSize: 'inherit', fontFamily: 'inherit', lineHeight: '1.4' }"
          (click)="onSectionChange(item.name)"
        >{{ item.label }}</button>
      </nav>
      <div style="flex:1;padding-left:16px;min-width:0;">
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
      </div>
    </div>
    <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--formitiva-border,#d1d5db);">
      <button type="button" class="formitiva-button" style="width:120px;"
        [disabled]="ctx.isApplyDisabled()" (click)="ctx.handleSubmit()">{{ ctx.t()('Submit') }}</button>
    </div>
  `,
})
export class NavLayoutComponent {
  @Input() config!: LayoutConfig;
  @Input() activeSection!: string;
  @Input() onSectionChange!: (name: string) => void;
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
