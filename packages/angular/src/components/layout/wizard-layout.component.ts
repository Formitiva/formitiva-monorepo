import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import type { OnChanges, SimpleChanges } from '@angular/core';
import { NgFor, NgIf, NgStyle } from '@angular/common';
import type { DefinitionPropertyField, LayoutConfig } from '@formitiva/core';
import { LayoutRenderContextService } from '../../services/layout-render-context.service';
import { FieldRendererComponent } from './field-renderer.component';
import { FieldGroupComponent } from './field-group.component';

@Component({
  selector: 'fv-wizard-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFor, NgIf, NgStyle, FieldRendererComponent, FieldGroupComponent],
  template: `
    <div>
      <div style="display:flex;align-items:center;margin-bottom:20px;gap:0;" [attr.aria-label]="config.displayName">
        <ng-container *ngFor="let step of config.sections; let i = index; trackBy: trackSection">
          <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
            <div [ngStyle]="{ width:'28px', height:'28px', borderRadius:'50%', display:'flex',
              alignItems:'center', justifyContent:'center', fontSize:'0.8em', fontWeight:'600',
              background: i < currentIndex ? 'var(--formitiva-wizard-done-bg,#34a853)'
                : step.name === activeSection ? 'var(--formitiva-wizard-active-bg,#1a73e8)'
                : 'var(--formitiva-wizard-inactive-bg,#e0e0e0)',
              color: i < currentIndex || step.name === activeSection ? '#fff' : 'var(--formitiva-text-muted,#666)' }"
            >{{ i < currentIndex ? '\u2713' : i + 1 }}</div>
            <span [ngStyle]="{ fontSize:'0.75em',
              color: step.name === activeSection ? 'var(--formitiva-wizard-active-color,#1a73e8)' : 'var(--formitiva-text-muted,#666)',
              fontWeight: step.name === activeSection ? '600' : 'normal', whiteSpace:'nowrap' }"
            >{{ step.label }}</span>
          </div>
          <div *ngIf="i < config.sections.length - 1" [ngStyle]="{ flex:'1', height:'2px',
            background: i < currentIndex ? 'var(--formitiva-wizard-done-bg,#34a853)' : 'var(--formitiva-border,#d1d5db)',
            margin:'0 4px', marginBottom:'20px' }"></div>
        </ng-container>
      </div>
      <div style="margin-bottom:16px;">
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
      <div style="display:flex;gap:8px;justify-content:space-between;align-items:center;">
        <div style="display:flex;gap:8px;">
          <button type="button" class="formitiva-button" style="width:120px;"
            [disabled]="ctx.isApplyDisabled()" (click)="ctx.handleSubmit()">{{ ctx.t()('Submit') }}</button>
        </div>
        <div style="display:flex;gap:8px;">
          <button [disabled]="isFirst" type="button" class="formitiva-button" style="width:100px;" (click)="goPrev()">{{ ctx.t()('Previous') }}</button>
          <button [disabled]="isNextDisabled()" type="button" class="formitiva-button" style="width:100px;" (click)="goNext()">{{ ctx.t()('Next') }}</button>
        </div>
      </div>
    </div>
  `,
})
export class WizardLayoutComponent implements OnChanges {
  @Input({ required: true }) config!: LayoutConfig;
  @Input({ required: true }) activeSection!: string;
  @Input({ required: true }) onSectionChange!: (name: string) => void;
  readonly ctx = inject(LayoutRenderContextService);
  currentIndex = 0;
  isFirst = true;
  isLast = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeSection'] || changes['config']) {
      this.currentIndex = this.config.sections.findIndex((s) => s.name === this.activeSection);
      this.isFirst = this.currentIndex === 0;
      this.isLast = this.currentIndex === this.config.sections.length - 1;
    }
  }

  goNext(): void {
    if (!this.isNextDisabled()) {
      this.onSectionChange(this.config.sections[this.currentIndex + 1].name);
    }
  }

  goPrev(): void {
    if (!this.isFirst) this.onSectionChange(this.config.sections[this.currentIndex - 1].name);
  }

  trackSection(_: number, section: { name: string }): string {
    return section.name;
  }

  trackGroup(index: number, group: { name: string | undefined }): string {
    return group.name ?? `ungrouped-${index}`;
  }

  trackField(_: number, field: DefinitionPropertyField): string {
    return field.name;
  }

  isNextDisabled(): boolean {
    return this.isLast || this.hasActiveSectionErrors();
  }

  private hasActiveSectionErrors(): boolean {
    const sectionProps = this.config.sections.find((section) => section.name === this.activeSection)?.props ?? [];
    if (sectionProps.length === 0) {
      return false;
    }

    const errors = this.ctx.errors();
    return sectionProps.some((propName) => Boolean(errors[propName]));
  }
}
