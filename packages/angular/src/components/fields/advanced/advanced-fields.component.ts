import {
  ChangeDetectionStrategy,
  Component,
  signal,
} from '@angular/core';
import type { OnChanges, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ReactiveStringFieldComponent, BaseFieldComponent } from '../base/base-field.component';
import { StandardFieldLayoutComponent } from '../../layout/layout-components.component';
import { PopupOptionMenuComponent } from '../base/popup-option-menu.component';
import { CSS_CLASSES, combineClasses } from '@formitiva/core';
import { getUnitFactors, convertTemperature } from '@formitiva/core';

// ----------------------------
// EmailInput (type=email)
// ----------------------------
@Component({
  selector: 'fv-email-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, StandardFieldLayoutComponent],
  template: `
    <fv-standard-field-layout [field]="field" [error]="errorSig()">
      <input
        [id]="field.name"
        type="email"
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
export class EmailInputComponent extends ReactiveStringFieldComponent {
  inputClass = combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput);
}

// ----------------------------
// PhoneInput (type=phone)
// ----------------------------
@Component({
  selector: 'fv-phone-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, StandardFieldLayoutComponent],
  template: `
    <fv-standard-field-layout [field]="field" [error]="errorSig()">
      <input
        [id]="field.name"
        type="tel"
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
export class PhoneInputComponent extends ReactiveStringFieldComponent {
  inputClass = combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput);
}

// ----------------------------
// UrlInput (type=url)
// ----------------------------
@Component({
  selector: 'fv-url-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, StandardFieldLayoutComponent],
  template: `
    <fv-standard-field-layout [field]="field" [error]="errorSig()">
      <input
        [id]="field.name"
        type="url"
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
export class UrlInputComponent extends ReactiveStringFieldComponent {
  inputClass = combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput);
}

// ----------------------------
// ColorInput (type=color)
// ----------------------------
const DEFAULT_COLOR = '#000000';
const HEX_REGEX = /^#([0-9A-F]{3}){1,2}$/i;
const COLOR_PRESETS = [
  { label: 'Black', value: '#000000' },
  { label: 'White', value: '#ffffff' },
  { label: 'Red', value: '#ff0000' },
  { label: 'Green', value: '#008000' },
  { label: 'Blue', value: '#0000ff' },
  { label: 'Yellow', value: '#ffff00' },
  { label: 'Cyan', value: '#00ffff' },
  { label: 'Magenta', value: '#ff00ff' },
  { label: 'Orange', value: '#ffa500' },
  { label: 'Purple', value: '#800080' },
  { label: 'Brown', value: '#a52a2a' },
  { label: 'Gray', value: '#808080' }
];

function normalizeHexColor(color?: string): string {
  if (!color || !HEX_REGEX.test(color)) return DEFAULT_COLOR;
  const c = color.toLowerCase();
  if (c.length === 4) return '#' + c.slice(1).split('').map(x => x + x).join('');
  return c;
}

function isPresetColor(color: string): boolean {
  return COLOR_PRESETS.some((preset) => preset.value === color);
}

function toRgbLabel(color: string): string {
  const normalized = normalizeHexColor(color);
  const red = parseInt(normalized.slice(1, 3), 16);
  const green = parseInt(normalized.slice(3, 5), 16);
  const blue = parseInt(normalized.slice(5, 7), 16);
  return `(${red}, ${green}, ${blue})`;
}

@Component({
  selector: 'fv-color-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFor, StandardFieldLayoutComponent],
  template: `
    <fv-standard-field-layout [field]="field" [error]="errorSig()">
      <div style="display:flex;align-items:center;gap:8px;width:100%;min-width:0">
        <select
          [id]="field.name"
          (change)="handlePresetChange($event)"
          (blur)="handleBlur()"
          [disabled]="disabled"
          [class]="selectClass"
          style="flex:1 1 auto;min-width:0"
        >
          <option *ngFor="let option of colorOptions" [value]="option.value" [selected]="option.value === normalizedValue">{{ option.label }}</option>
        </select>
        <button
          type="button"
          (click)="openColorPicker(colorPicker)"
          [disabled]="disabled"
          [attr.aria-label]="ctx.t()('Select color')"
          [title]="ctx.t()('Select color')"
          style="position:relative;flex:0 0 2.75em;width:2.75em;height:2.5em;padding:2px;border:1px solid var(--formitiva-border-color,#ccc);border-radius:var(--formitiva-border-radius,4px);background:var(--formitiva-secondary-bg,#fff);cursor:pointer"
        >
          <span
            [style.background-color]="normalizedValue"
            style="display:block;width:100%;height:100%;border-radius:calc(var(--formitiva-border-radius,4px) - 2px)"
          ></span>
        </button>
        <input
          #colorPicker
          type="color"
          [value]="normalizedValue"
          (input)="handleInput($event)"
          (blur)="handleBlur()"
          tabindex="-1"
          style="position:absolute;opacity:0;pointer-events:none;width:0;height:0"
        />
      </div>
    </fv-standard-field-layout>
  `,
})
export class ColorInputComponent extends BaseFieldComponent<string> implements OnChanges {
  selectClass = combineClasses(CSS_CLASSES.input, CSS_CLASSES.inputSelect);
  presetColors = COLOR_PRESETS;

  get normalizedValue(): string { return normalizeHexColor(String(this.value ?? '')); }

  get colorOptions(): Array<{ label: string; value: string }> {
    return isPresetColor(this.normalizedValue)
      ? this.presetColors
      : [...this.presetColors, { label: toRgbLabel(this.normalizedValue), value: this.normalizedValue }];
  }

  override ngOnChanges(_: SimpleChanges): void {
    this.updateError(this.doValidate(this.normalizedValue, 'sync'));
  }

  handleInput(e: Event): void {
    const v = normalizeHexColor((e.target as HTMLInputElement).value);
    this.updateError(this.doValidate(v, 'change'));
    this.emitChange(v);
  }

  handlePresetChange(e: Event): void {
    const raw = (e.target as HTMLSelectElement).value;
    const v = normalizeHexColor(raw);
    this.emitChange(v);
    this.updateError(this.doValidate(v, 'change'));
  }

  openColorPicker(colorPicker: HTMLInputElement): void {
    if (this.disabled) return;
    colorPicker.click();
  }

  handleBlur(): void {
    this.updateError(this.doValidate(this.normalizedValue, 'blur'));
  }
}

// ----------------------------
// SliderInput (type=slider)
// ----------------------------
@Component({
  selector: 'fv-slider-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StandardFieldLayoutComponent],
  template: `
    <fv-standard-field-layout [field]="field" [error]="errorSig()">
      <div style="display:flex;align-items:center;gap:8px;width:100%">
        <input\n          [id]="field.name"\n          type="range"\n          [value]="displayValue"\n          (input)="handleChange($event)"\n          (blur)="handleBlur($event)"\n          [min]="field.min ?? 0"\n          [max]="field.max ?? 100"\n          [step]="field.step ?? 1"\n          style="padding:0;flex:1"\n        />\n        <input\n          [id]="field.name + '-number'"\n          type="number"\n          [value]="displayValue"\n          (input)="handleChange($event)"\n          (blur)="handleBlur($event)"\n          [min]="field.min ?? 0"\n          [max]="field.max ?? 100"\n          [attr.aria-label]="ctx.t()(field.displayName)"\n          style="width:5em"\n          [class]="inputClass"\n        />
      </div>
    </fv-standard-field-layout>
  `,
})
export class SliderInputComponent extends BaseFieldComponent<string | number> implements OnChanges {
  inputClass = combineClasses(CSS_CLASSES.input, CSS_CLASSES.inputNumber);
  get displayValue(): string {
    const n = Number(this.value);
    return isNaN(n) ? String(this.field.min ?? 0) : String(n);
  }

  override ngOnChanges(_: SimpleChanges): void {
    this.updateError(this.doValidate(this.displayValue, 'sync'));
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
// RatingInput (type=rating)
// ----------------------------
@Component({
  selector: 'fv-rating-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFor, StandardFieldLayoutComponent],
  template: `
    <fv-standard-field-layout [field]="field" [error]="errorSig()">
      <div
        style="display:flex;gap:4px"
        (focusout)="onGroupBlur($event)"
        (mouseleave)="hoverIndex = null"
      >
        <span
          *ngFor="let i of starIndices"
          tabindex="0"
          [attr.aria-label]="(i + 1) + ' ' + ctx.t()('stars')"
          [attr.aria-pressed]="ratingValue > i"
          (click)="selectStar(i + 1)"
          (mouseenter)="hoverIndex = i"
          (keydown)="onKeyDown($event, i)"
          style="cursor:pointer;font-size:1.5rem;line-height:1;user-select:none;transition:color 0.12s ease"
          [style.color]="(hoverIndex !== null ? i <= hoverIndex : i < ratingValue) ? 'var(--formitiva-color-primary, #f59e0b)' : 'var(--formitiva-border-color, #ccc)'"
        >{{ iconChar }}</span>
      </div>
    </fv-standard-field-layout>
  `,
})
export class RatingInputComponent extends BaseFieldComponent<number> implements OnChanges {
  hoverIndex: number | null = null;

  get max(): number { return this.field.max ?? 5; }
  get iconChar(): string { return ((this.field as unknown as Record<string, unknown>)['icon'] as string | undefined)?.trim() || '\u2605'; }
  get starIndices(): number[] { return Array.from({ length: this.max }, (_, i) => i); }
  get ratingValue(): number {
    const v = this.value ?? 0;
    return Math.min(Math.max(v, 0), this.max);
  }

  override ngOnChanges(_: SimpleChanges): void {
    this.updateError(this.doValidate(this.ratingValue, 'sync'));
  }

  selectStar(val: number): void {
    const n = Math.min(Math.max(val, 0), this.max);
    this.emitChange(n);
    this.updateError(this.doValidate(n, 'change'));
  }

  onGroupBlur(e: FocusEvent): void {
    if ((e.currentTarget as HTMLElement).contains(e.relatedTarget as Node | null)) return;
    this.updateError(this.doValidate(this.ratingValue, 'blur'));
  }

  onKeyDown(e: KeyboardEvent, index: number): void {
    switch (e.key) {
      case 'Enter': case ' ':
        e.preventDefault();
        this.selectStar(index + 1);
        break;
      case 'ArrowRight': case 'ArrowUp':
        e.preventDefault();
        ((e.currentTarget as HTMLElement).nextElementSibling as HTMLElement | null)?.focus();
        break;
      case 'ArrowLeft': case 'ArrowDown':
        e.preventDefault();
        ((e.currentTarget as HTMLElement).previousElementSibling as HTMLElement | null)?.focus();
        break;
    }
  }
}

// ----------------------------
// FileInput (type=file)
// ----------------------------
@Component({
  selector: 'fv-file-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, NgFor, StandardFieldLayoutComponent],
  template: `
    <fv-standard-field-layout [field]="field" [error]="errorSig()">
      <div
        (dragover)="onDragOver($event)"
        (dragleave)="isDragging = false"
        (drop)="onDrop($event)"
        [style.border-color]="isDragging ? 'var(--formitiva-color-primary, #007bff)' : 'var(--formitiva-border-color, #ccc)'"
        style="width:100%;max-width:100%;box-sizing:border-box;overflow:hidden;border:2px dashed;border-radius:var(--formitiva-border-radius,4px);padding:16px;text-align:center;cursor:pointer"
        role="button"
        tabindex="0"
        [attr.aria-label]="ctx.t()('Upload file')"
        (click)="fileInput.click()"
        (keydown)="onDropZoneKeyDown($event, fileInput)"
      >
        <input
          #fileInput
          type="file"
          [accept]="field.accept || ''"
          [multiple]="!!field.multiple"
          style="display:none"
          (change)="onFileChange($event)"
        />
        <div *ngIf="!fileList.length">
          {{ ctx.t()('Click or drag files here') }}
        </div>
        <ul *ngIf="fileList.length" style="list-style:none;margin:0;padding:0;text-align:left;width:100%;max-width:100%">
          <li *ngFor="let f of fileList" style="display:flex;align-items:center;gap:8px;margin-bottom:4px;width:100%;max-width:100%;min-width:0">
            <span
              [title]="f.name"
              style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
            >{{ f.name }}</span>
            <span style="flex:none;opacity:0.6;font-size:0.85em;white-space:nowrap">({{ (f.size / 1024).toFixed(1) }} KB)</span>
            <button type="button" (click)="removeFile(f, $event)"
                    style="flex:none;background:none;border:none;cursor:pointer;padding:0;font-size:1em">&#215;</button>
          </li>
        </ul>
      </div>
    </fv-standard-field-layout>
  `,
})
export class FileInputComponent extends BaseFieldComponent<File | File[] | null> implements OnChanges {
  isDragging = false;

  get fileList(): File[] {
    if (!this.value) return [];
    return Array.isArray(this.value) ? this.value : [this.value];
  }

  override ngOnChanges(_: SimpleChanges): void {
    const arr = Array.isArray(this.value) ? this.value : (this.value ? [this.value] : []);
    this.updateError(this.doValidate(arr as unknown as File | File[] | null, 'sync'));
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.isDragging = true;
  }

  onDropZoneKeyDown(e: KeyboardEvent, fileInput: HTMLInputElement): void {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragging = false;
    const files = Array.from(e.dataTransfer?.files ?? []);
    this.applyFiles(files);
  }

  onFileChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.applyFiles(files);
    input.value = '';
  }

  private applyFiles(files: File[]): void {
    let selected: File | File[] | null;
    if (this.field.multiple) {
      const existing = this.fileList;
      const unique = files.filter(f => !existing.some(e => e.name === f.name && e.size === f.size));
      selected = [...existing, ...unique];
    } else {
      selected = files[0] ?? null;
    }
    this.emitChange(selected);
    const arr = Array.isArray(selected) ? selected : (selected ? [selected] : []);
    this.updateError(this.doValidate(arr as unknown as File | File[] | null, 'change'));
  }

  removeFile(f: File, e: Event): void {
    e.stopPropagation();
    const newList = this.fileList.filter(x => x !== f);
    const val: File | File[] | null = this.field.multiple ? newList : (newList[0] ?? null);
    this.emitChange(val);
    this.updateError(this.doValidate(newList as unknown as File | File[] | null, 'change'));
  }
}

// ----------------------------
// UnitValueInput (type=unit)
// ----------------------------
interface UnitOpt { label: string; value: string; unit: string; }

@Component({
  selector: 'fv-unit-value-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, NgFor, ReactiveFormsModule, StandardFieldLayoutComponent, PopupOptionMenuComponent],
  template: `
    <fv-standard-field-layout [field]="field" [error]="errorSig()">
      <div style="position:relative;width:100%">
        <div style="display:flex;align-items:center;gap:4px;width:100%">
          <input
            [id]="field.name"
            type="text"
            [formControl]="control"
            (blur)="onBlur()"
            style="flex:1"
            [class]="inputClass"
            [attr.aria-invalid]="!!errorSig() || null"
          />
          <select
            [value]="selectedUnit"
            (change)="handleUnitChange($event)"
            [class]="inputClass"
            style="width:auto;min-width:4em"
          >
            <option *ngFor="let u of availableUnits" [value]="u" [selected]="u === selectedUnit">{{ ctx.t()(u) }}</option>
          </select>
          <button
            type="button"
            (click)="showConversions($event)"
            [disabled]="disabled"
            title="{{ ctx.t()('Convert') }}"
            style="width:2.5em;height:2.5em;border:none;border-radius:var(--formitiva-border-radius,4px);
                   background:var(--formitiva-color-primary,#007bff);color:#fff;cursor:pointer;font-size:1em"
          >&#x21C4;</button>
        </div>
        <fv-popup-option-menu
          *ngIf="showMenu"
          [pos]="menuPos"
          [options]="conversionOptions"
          (optionClicked)="applyConversion($event)"
          (closed)="showMenu = false"
        ></fv-popup-option-menu>
      </div>
    </fv-standard-field-layout>
  `,
})
export class UnitValueInputComponent extends ReactiveStringFieldComponent
  implements OnInit, OnChanges, OnDestroy {
  inputClass = combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput);
  showMenu = false;
  menuPos: { x: number; y: number } | null = null;
  conversionOptions: UnitOpt[] = [];
  selectedUnit = '';

  override ngOnInit(): void {
    super.ngOnInit();
    try {
      this.selectedUnit = this.currentUnit;
    } catch {
      this.selectedUnit = String(this.field?.defaultUnit ?? '');
    }
  }

  get currentUnit(): string {
    const v = this.value as unknown as [string | number, string] | undefined;
    const unitFactors = this.field.dimension ? getUnitFactors(this.field.dimension) : null;
    const available = this.availableUnits;
    const candidate = String(v?.[1] ?? this.field.defaultUnit ?? unitFactors?.['default'] ?? '');

    if (available && available.length > 0) {
      // Prefer an exact match from available units (case-sensitive), then case-insensitive
      let match = available.find(u => String(u) === candidate);
      if (!match) match = available.find(u => String(u).toLowerCase() === candidate.toLowerCase());
      if (match) return match;

      // If field.defaultUnit exists, try that specifically
      if (this.field && typeof this.field.defaultUnit === 'string') {
        const def = String(this.field.defaultUnit);
        match = available.find(u => String(u) === def) ?? available.find(u => String(u).toLowerCase() === def.toLowerCase());
        if (match) return match;
      }

      // Fall back to the unitFactors default if present, otherwise the first available unit
      if (unitFactors && unitFactors['default']) {
        const defUnit = String(unitFactors['default']);
        const defMatch = available.find(u => String(u) === defUnit);
        if (defMatch) return defMatch;
      }

      return available[0] ?? '';
    }

    return candidate;
  }

  get availableUnits(): string[] {
    if (!this.field.dimension) return this.currentUnit ? [this.currentUnit] : [];
    const uf = getUnitFactors(this.field.dimension);
    return (uf as unknown as { units?: string[] } | null)?.units ?? [];
  }

  override ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      const v = this.value as unknown as [string | number, string] | undefined;
      const numStr = String(v?.[0] ?? '');
      const saved = this.value;
      this.value = numStr as unknown as string | number;
      super.ngOnChanges(changes);
      this.value = saved;
      // Keep an explicit selectedUnit so the <select> stays in sync reliably
      try { this.selectedUnit = this.currentUnit; } catch { this.selectedUnit = String((v?.[1] ?? this.field.defaultUnit ?? '') as string); }
    } else {
      super.ngOnChanges(changes);
      try { this.selectedUnit = this.currentUnit; } catch { this.selectedUnit = String(this.field.defaultUnit ?? ''); }
    }
  }

  handleUnitChange(e: Event): void {
    const newUnit = (e.target as HTMLSelectElement).value;
    const v = this.value as unknown as [string | number, string] | undefined;
    const newVal: [string | number, string] = [v?.[0] ?? '', newUnit];
    this.emitChange(newVal as unknown as string | number);
    this.updateError(this.doValidate(this.control.value as string | number, 'change'));
    this.selectedUnit = newUnit;
  }

  showConversions(e: MouseEvent): void {
    if (this.disabled) return;
    const numStr = this.control.value ?? '';
    const parsed = parseFloat(numStr);
    if (!isFinite(parsed) || !this.field.dimension) return;
    const uf = getUnitFactors(this.field.dimension);
    if (!uf) return;
    const selectedUnit = this.currentUnit;
    const dim = this.field.dimension;
    const opts: UnitOpt[] = [];
    const unitsList = (uf as unknown as { units?: string[] }).units ?? [];
    if (dim === 'temperature') {
      for (const toUnit of unitsList) {
        const converted = convertTemperature(selectedUnit, toUnit, parsed);
        if (isFinite(converted)) opts.push({ label: `${converted.toFixed(6)} ${this.ctx.t()(toUnit)}`, value: String(converted), unit: toUnit });
      }
    } else {
      const factors = (uf as unknown as { factors?: Record<string, number> }).factors ?? {};
      const fromFactor = factors[selectedUnit];
      if (fromFactor !== undefined) {
        for (const [toUnit, toFactor] of Object.entries(factors)) {
          const converted = (parsed / fromFactor) * toFactor;
          if (isFinite(converted)) opts.push({ label: `${converted.toFixed(6)} ${this.ctx.t()(toUnit)}`, value: String(converted), unit: toUnit });
        }
      }
    }
    this.conversionOptions = opts;
    this.menuPos = { x: (e.target as HTMLElement).getBoundingClientRect().left, y: (e.target as HTMLElement).getBoundingClientRect().bottom };
    this.showMenu = opts.length > 0;
  }

  applyConversion(opt: UnitOpt): void {
    this.showMenu = false;
    const newVal: [string, string] = [opt.value, opt.unit];
    this.emitChange(newVal as unknown as string | number);
    this.control.setValue(opt.value, { emitEvent: false });
    this.updateError(this.doValidate(opt.value as string | number, 'change'));
  }
}
