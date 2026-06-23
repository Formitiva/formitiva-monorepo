import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import type { LayoutConfig, TranslationFunction } from '@formitiva/core';
import { NavLayoutComponent } from './nav-layout.component';
import { TabLayoutComponent } from './tab-layout.component';
import { WizardLayoutComponent } from './wizard-layout.component';

/**
 * Angular layout adapter.
 *
 * Registered by formitiva.component.ts on startup. Receives the layout config
 * and active-section state from the renderer via ngComponentOutlet inputs, then
 * delegates rendering to the appropriate layout component (nav / tab / wizard)
 * based on config.type.
 *
 * Custom adapters can replace this by calling registerLayoutAdapter() with their
 * own component type -the renderer has zero knowledge of specific layout types.
 */
@Component({
  selector: 'fv-layout-adapter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, NavLayoutComponent, TabLayoutComponent, WizardLayoutComponent],
  template: `
    <fv-nav-layout
      *ngIf="config.type === 'nav'"
      [config]="config"
      [activeSection]="activeSection"
      [onSectionChange]="onSectionChange"
    ></fv-nav-layout>

    <fv-tab-layout
      *ngIf="config.type === 'tab'"
      [config]="config"
      [activeSection]="activeSection"
      [onSectionChange]="onSectionChange"
    ></fv-tab-layout>

    <fv-wizard-layout
      *ngIf="config.type === 'wizard'"
      [config]="config"
      [activeSection]="activeSection"
      [onSectionChange]="onSectionChange"
    ></fv-wizard-layout>
  `,
})
export class LayoutAdapterComponent {
  @Input({ required: true }) config!: LayoutConfig;
  @Input({ required: true }) activeSection!: string;
  @Input({ required: true }) onSectionChange!: (name: string) => void;
  @Input() t: TranslationFunction = (k) => k;
}
