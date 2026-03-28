import {
  ChangeDetectionStrategy,
  Component,
  signal,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import type { OnChanges, SimpleChanges } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { BaseFieldComponent } from '../base/base-field.component';
import { StandardFieldLayoutComponent } from '../../layout/layout-components.component';
import { PopupOptionMenuComponent } from '../base/popup-option-menu.component';
import { CSS_CLASSES } from '@formitiva/core';

// ----------------------------
// CheckboxInput (type=checkbox)
// ----------------------------
@Component({
  selector: 'fv-checkbox-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StandardFieldLayoutComponent],
  template: `
    <fv-standard-field-layout [field]="field" [error]="errorSig()">
      <div style="display:flex;align-items:center;justify-content:space-between;width:100%">
        <label [class]="CSS_CLASSES.label" [attr.for]="field.name"
               style="text-align:left;justify-content:flex-start">
          {{ ctx.t()(field.displayName) }}
        </label>
        <input
          [id]="field.name"
          data-testid="boolean-checkbox"
          type="checkbox"
          [checked]="!!value"
          (change)="handleChange($event)"
          (keydown)="handleKeyDown($event)"
          (blur)="handleBlur($event)"
          [attr.aria-checked]="!!value"
          [attr.aria-invalid]="!!errorSig() || null"
          style="cursor:pointer;margin:8px 0;width:1.2em;height:1.2em;vertical-align:middle"
        />
      </div>
    </fv-standard-field-layout>
  `,
})
export class CheckboxInputComponent extends BaseFieldComponent<boolean> implements OnChanges {
  CSS_CLASSES = CSS_CLASSES;

  override ngOnChanges(_: SimpleChanges): void {
    this.updateError(this.doValidate(!!this.value as boolean, 'sync'));
  }

  handleChange(e: Event): void {
    const checked = (e.target as HTMLInputElement).checked;
    this.emitChange(checked);
    this.updateError(this.doValidate(checked, 'change'));
  }

  handleKeyDown(e: KeyboardEvent): void {
    const isSpace = e.key === ' ' || e.key === 'Space' || e.key === 'Spacebar' || e.code === 'Space';
    if (isSpace || e.key === 'Enter') {
      e.preventDefault();
      const next = !this.value;
      this.emitChange(next);
      this.updateError(this.doValidate(next, 'change'));
    }
  }

  handleBlur(e: Event): void {
    const checked = (e.target as HTMLInputElement).checked;
    this.updateError(this.doValidate(checked, 'blur'));
  }
}

// ----------------------------
// SwitchInput (type=switch)
// ----------------------------
@Component({
  selector: 'fv-switch-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StandardFieldLayoutComponent],
  template: `
    <fv-standard-field-layout [field]="field" [error]="errorSig()">
      <div style="display:flex;align-items:center;justify-content:space-between;width:100%">
        <label [class]="CSS_CLASSES.label" [attr.for]="field.name">
          {{ ctx.t()(field.displayName) }}
        </label>
        <div
          [attr.aria-checked]="!!value"
          role="switch"
          tabindex="0"
          (click)="toggle()"
          (keydown)="onKeyDown($event)"
          style="position:relative;display:inline-block;width:44px;height:24px;cursor:pointer"
        >
          <div [style.background-color]="value ? 'var(--formitiva-color-primary, #007bff)' : 'var(--formitiva-border-color, #ccc)'"
               style="position:absolute;inset:0;border-radius:12px;transition:background-color 0.2s"></div>
          <div [style.left]="value ? '22px' : '2px'"
               style="position:absolute;top:2px;width:20px;height:20px;border-radius:50%;background:#fff;transition:left 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>
        </div>
      </div>
    </fv-standard-field-layout>
  `,
})
export class SwitchInputComponent extends BaseFieldComponent<boolean> implements OnChanges {
  CSS_CLASSES = CSS_CLASSES;

  override ngOnChanges(_: SimpleChanges): void {
    this.updateError(this.doValidate(!!this.value as boolean, 'sync'));
  }

  toggle(): void {
    const next = !this.value;
    this.emitChange(next);
    this.updateError(this.doValidate(next, 'change'));
  }

  onKeyDown(e: KeyboardEvent): void {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      this.toggle();
    }
  }
}

// ----------------------------
// RadioInput (type=radio)
// ----------------------------
@Component({
  selector: 'fv-radio-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFor, StandardFieldLayoutComponent],
  template: `
    <fv-standard-field-layout [field]="field" [error]="errorSig()">
      <div [style.flex-direction]="layout === 'row' ? 'row' : 'column'"
           [style.flex-wrap]="layout === 'row' ? 'wrap' : 'nowrap'"
           [style.gap]="layout === 'row' ? '12px' : '4px'"
           style="display:flex;width:100%;box-sizing:border-box">
        <label *ngFor="let opt of field.options"
               [style.display]="layout === 'column' ? 'flex' : 'inline-flex'"
               style="gap:8px;align-items:center;cursor:pointer;justify-content:flex-start">
          <input
            type="radio"
            [name]="field.name"
            [value]="opt.value"
            [checked]="String(value) === String(opt.value)"
            (change)="handleChange($event)"
            (blur)="handleBlur($event)"
          />
          <span>{{ ctx.t()(opt.label) }}</span>
        </label>
      </div>
    </fv-standard-field-layout>
  `,
})
export class RadioInputComponent extends BaseFieldComponent<string> implements OnChanges {
  get layout(): 'row' | 'column' {
    return this.field.layout?.toLowerCase() === 'horizontal' ? 'row' : 'column';
  }
  String = String;

  override ngOnChanges(_: SimpleChanges): void {
    const safeVal = this.value != null ? String(this.value) : '';
    const err = this.doValidate(safeVal, 'sync');
    if (err && this.field.options && this.field.options.length > 0) {
      this.emitChange(String(this.field.options[0].value));
    }
    this.updateError(err);
  }

  handleChange(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    this.emitChange(v);
    this.updateError(this.doValidate(v, 'change'));
  }

  handleBlur(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    this.updateError(this.doValidate(v, 'blur'));
  }
}

// ----------------------------
// DropdownInput (type=dropdown)
// ----------------------------
@Component({
  selector: 'fv-dropdown-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, StandardFieldLayoutComponent, PopupOptionMenuComponent],
  template: `
    <fv-standard-field-layout [field]="field" [error]="errorSig()">
      <div
        #controlEl
        (click)="handleControlClick(controlEl)"
        (blur)="handleBlur()"
        tabindex="0"
        style="height:var(--formitiva-input-height, 2.5em);display:flex;align-items:center;
               width:100%;max-width:100%;min-width:0;box-sizing:border-box;padding:0 0.75em;cursor:pointer;position:relative;
               border:1px solid var(--formitiva-border-color, #ccc);border-radius:var(--formitiva-border-radius, 4px);
               background:var(--formitiva-input-bg, transparent)"
        [attr.aria-expanded]="menuOpen"
        aria-haspopup="listbox"
      >
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ selectedLabel }}</span>
        <span style="flex:none;margin-left:8px;font-size:0.75em">▼</span>
      </div>
      <fv-popup-option-menu
        *ngIf="menuOpen"
        [pos]="popupPos"
        [options]="menuOptions"
        (optionClicked)="handleOptionClick($event)"
        (closed)="menuOpen = false"
      ></fv-popup-option-menu>
    </fv-standard-field-layout>
  `,
})
export class DropdownInputComponent extends BaseFieldComponent<string> implements OnChanges {
  menuOpen = false;
  popupPos: { x: number; y: number } | null = null;

  get menuOptions(): Array<{ label: string; value: string }> {
    return (this.field.options ?? []).map(o => ({ label: this.ctx.t()(o.label), value: o.value }));
  }

  get selectedLabel(): string {
    const opt = (this.field.options ?? []).find(o => String(o.value) === String(this.value));
    return opt ? this.ctx.t()(opt.label) : '';
  }

  override ngOnChanges(_: SimpleChanges): void {
    const safeVal = String(this.value ?? '');
    let err = this.doValidate(safeVal, 'sync');
    if (err && this.field.options && this.field.options.length > 0) {
      this.emitChange(String(this.field.options[0].value));
      err = null;
    }
    this.updateError(err);
  }

  handleControlClick(el: HTMLElement): void {
    const rect = el.getBoundingClientRect();
    this.popupPos = { x: rect.left, y: rect.bottom };
    this.menuOpen = !this.menuOpen;
  }

  handleOptionClick(opt: { label: string; value: string }): void {
    this.emitChange(opt.value);
    this.updateError(this.doValidate(opt.value, 'change'));
    this.menuOpen = false;
  }

  handleBlur(): void {
    this.updateError(this.doValidate(String(this.value ?? ''), 'blur'));
  }
}

// ----------------------------
// MultiSelectionInput (type=multi-selection)
// ----------------------------
@Component({
  selector: 'fv-multi-selection',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, NgFor, StandardFieldLayoutComponent, PopupOptionMenuComponent],
  template: `
    <fv-standard-field-layout [field]="field" [error]="errorSig()">
      <div
        #controlEl
        (click)="handleControlClick(controlEl)"
        tabindex="0"
        style="min-height:var(--formitiva-input-height, 2.5em);display:flex;flex-wrap:wrap;align-items:center;
               width:100%;max-width:100%;min-width:0;box-sizing:border-box;padding:4px;cursor:pointer;gap:4px;
               border:1px solid var(--formitiva-border-color, #ccc);border-radius:var(--formitiva-border-radius, 4px);
               background:var(--formitiva-input-bg, transparent)"
        [attr.aria-expanded]="menuOpen"
        aria-haspopup="listbox"
      >
        <span *ngIf="selectedValues.length === 0" style="flex:1;min-width:0;opacity:0.5;padding:0 4px">
          {{ ctx.t()('Select...') }}
        </span>
        <span *ngFor="let v of selectedValues"
              style="max-width:calc(100% - 2em);background:var(--formitiva-color-primary, #007bff);color:#fff;padding:2px 6px;
                     border-radius:3px;font-size:0.85em;display:flex;align-items:center;gap:4px;min-width:0">
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ labelFor(v) }}</span>
          <span (click)="removeOption(v, $event)" style="flex:none;cursor:pointer;font-size:1.1em;line-height:1">&#215;</span>
        </span>
        <span style="flex:none;margin-left:auto;font-size:0.75em">▼</span>
      </div>
      <fv-popup-option-menu
        *ngIf="menuOpen"
        [pos]="popupPos"
        [options]="menuOptions"
        (optionClicked)="toggleOption($event)"
        (closed)="menuOpen = false"
      ></fv-popup-option-menu>
    </fv-standard-field-layout>
  `,
})
export class MultiSelectionComponent extends BaseFieldComponent<string[] | null> implements OnChanges {
  menuOpen = false;
  popupPos: { x: number; y: number } | null = null;

  get selectedValues(): string[] {
    const arr = Array.isArray(this.value) ? this.value : [];
    const allowed = new Set((this.field.options ?? []).map(o => o.value));
    return arr.filter(v => allowed.has(v));
  }

  get menuOptions(): Array<{ label: string; value: string }> {
    return (this.field.options ?? []).map(o => ({ label: this.ctx.t()(o.label), value: o.value }));
  }

  labelFor(v: string): string {
    const opt = (this.field.options ?? []).find(o => o.value === v);
    return opt ? this.ctx.t()(opt.label) : v;
  }

  override ngOnChanges(_: SimpleChanges): void {
    const arr = Array.isArray(this.value) ? this.value : [];
    this.updateError(this.doValidate(arr as unknown as string[], 'sync'));
  }

  handleControlClick(el: HTMLElement): void {
    const rect = el.getBoundingClientRect();
    this.popupPos = { x: rect.left, y: rect.bottom };
    this.menuOpen = !this.menuOpen;
  }

  toggleOption(opt: { label: string; value: string }): void {
    const current = this.selectedValues;
    const newValues = current.includes(opt.value)
      ? current.filter(v => v !== opt.value)
      : [...current, opt.value];
    this.emitChange(newValues);
    this.updateError(this.doValidate(newValues as unknown as string[], 'change'));
  }

  removeOption(v: string, e: Event): void {
    e.stopPropagation();
    const newValues = this.selectedValues.filter(x => x !== v);
    this.emitChange(newValues);
    this.updateError(this.doValidate(newValues as unknown as string[], 'change'));
  }
}
