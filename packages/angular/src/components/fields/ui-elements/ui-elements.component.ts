import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import type { SimpleChanges } from '@angular/core';
import { NgIf, NgFor, NgStyle } from '@angular/common';
import { BaseFieldComponent } from '../base/base-field.component';
import { StandardFieldLayoutComponent } from '../../layout/layout-components.component';
import { CSS_CLASSES, combineClasses } from '@formitiva/core';
import { getButtonHandler } from '@formitiva/core';
import type { FieldValueType } from '@formitiva/core';

type AnyField = { [k: string]: unknown };

// ----------------------------
// ButtonComponent (type=button)
// ----------------------------
@Component({
  selector: 'fv-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, NgStyle, StandardFieldLayoutComponent],
  template: `
    <fv-standard-field-layout [field]="field">
      <div style="display:flex;flex-direction:column;width:100%;min-width:0;padding:4px 0">
        <div [ngStyle]="buttonContainerStyle">
          <button
            type="button"
            [disabled]="isProcessing || disabled"
            (click)="handleClick()"
            [class]="btnClass"
            [attr.aria-busy]="isProcessing || null"
            [ngStyle]="buttonStyle"
          >
            <span *ngIf="isProcessing" style="margin-right:6px">&#9696;</span>
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ label }}</span>
          </button>
        </div>
        <span *ngIf="buttonError" [class]="errorClass" style="margin-top:6px">{{ buttonError }}</span>
      </div>
    </fv-standard-field-layout>
  `,
})
export class ButtonComponent extends BaseFieldComponent<string | undefined> {
  btnClass = combineClasses(CSS_CLASSES.button);
  errorClass = CSS_CLASSES.error;
  isProcessing = false;
  buttonError: string | null = null;

  get label(): string {
    const f = this.field as unknown as AnyField;
    const t = this.ctx.t();
    const buttonText = typeof f['buttonText'] === 'string' ? f['buttonText'].trim() : '';
    const displayName = typeof this.field.displayName === 'string' ? this.field.displayName.trim() : '';
    return t(buttonText || displayName || 'Submit');
  }

  get buttonContainerStyle(): Record<string, string> {
    return {
      display: 'flex',
      width: '100%',
      minWidth: '0',
      justifyContent: this.resolveAlignment(),
    };
  }

  get buttonStyle(): Record<string, string> {
    return {
      width: this.resolveCssSize(this.field.width) ?? 'auto',
      maxWidth: '100%',
      minWidth: this.resolveCssSize(this.field.width) ?? 'fit-content',
      marginTop: '0',
      flex: 'none',
    };
  }

  private resolveAlignment(): string {
    switch (this.field.alignment) {
      case 'right':
        return 'flex-end';
      case 'center':
        return 'center';
      default:
        return 'flex-start';
    }
  }

  private resolveCssSize(size: string | number | undefined): string | null {
    if (size == null || size === '') return null;
    if (typeof size === 'number') return `${size}px`;
    return size;
  }

  handleClick(): void {
    const handler = getButtonHandler(this.field.action ?? 'submit');
    if (!handler) return;
    this.isProcessing = true;
    this.buttonError = null;
    const t = this.ctx.t();
    const emit = this.onError.emit.bind(this.onError);
    const result = handler(
      this.ctx.valuesMap() as Record<string, FieldValueType>,
      (_name, v) => this.emitChange(v as string),
      (_name, e) => this.emitError(typeof e === 'string' ? e : ((e as any)?.message ? String((e as any).message) : String(e))),
      t,
    );
    const cleanup = (err?: unknown) => {
      this.isProcessing = false;
      if (err) this.buttonError = err instanceof Error ? err.message : String(err);
    };
    if (result && typeof (result as Promise<unknown>).then === 'function') {
      (result as Promise<unknown>).then(() => cleanup(), cleanup);
    } else {
      cleanup();
    }
  }

  override ngOnChanges(_: SimpleChanges): void { /* buttons have no value to validate */ }
}

// ----------------------------
// DescriptionComponent (type=description)
// ----------------------------
@Component({
  selector: 'fv-description',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, NgFor],
  template: `
    <div [class]="descClass">
      <ng-container *ngIf="!isHtml">
        <ng-container *ngIf="!isMultiLine">{{ translatedLines[0] }}</ng-container>
        <ng-container *ngIf="isMultiLine">
          <p *ngFor="let line of translatedLines" style="margin:0 0 0.25em">{{ line }}</p>
        </ng-container>
      </ng-container>
      <div *ngIf="isHtml" [innerHTML]="translatedLines[0]"></div>
    </div>
  `,
})
export class DescriptionComponent extends BaseFieldComponent<string | undefined> {
  descClass = CSS_CLASSES.description;

  private get rawText(): string | string[] {
    const f = this.field as unknown as AnyField;
    return (f['displayText'] as string | string[] | undefined) ?? this.field.displayName ?? '';
  }

  get translatedLines(): string[] {
    const t = this.ctx.t();
    const raw = this.rawText;
    if (Array.isArray(raw)) return raw.map(l => t(l));
    return [t(String(raw))];
  }

  get isMultiLine(): boolean { return this.translatedLines.length > 1; }
  get isHtml(): boolean { return !!(this.field as unknown as AnyField)['allowHtml']; }

  override ngOnChanges(_: SimpleChanges): void { /* display-only */ }
}

// ----------------------------
// ImageDisplayComponent (type=image)
// ----------------------------
@Component({
  selector: 'fv-image-display',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf],
  template: `
    <div [style.text-align]="alignment" style="padding:4px 0">
      <img
        *ngIf="imageSrc"
        [src]="imageSrc"
        [alt]="imageAlt"
        [style.max-width]="imageWidth ? imageWidth + 'px' : '100%'"
        [style.max-height]="imageHeight ? imageHeight + 'px' : undefined"
        style="object-fit:contain;border-radius:var(--formitiva-border-radius,4px)"
      />
    </div>
  `,
})
export class ImageDisplayComponent extends BaseFieldComponent<string | undefined> {
  get imageSrc(): string {
    const f = this.field as unknown as AnyField;
    const src = f['src'] ?? f['imageSrc'] ?? this.field.localized ?? '';
    if (typeof src === 'object' && src !== null) {
      const lang = this.ctx.language();
      return (src as Record<string, string>)[lang] ?? Object.values(src as Record<string, string>)[0] ?? '';
    }
    return String(src);
  }

  get imageAlt(): string {
    const f = this.field as unknown as AnyField;
    const alt = f['alt'] ?? this.field.displayName ?? '';
    return this.ctx.t()(typeof alt === 'object'
      ? ((alt as Record<string, string>)[this.ctx.language()] ?? '')
      : String(alt));
  }

  get alignment(): string { return String(this.field.alignment ?? 'center'); }
  get imageWidth(): number | null { return this.field.width ? Number(this.field.width) : null; }
  get imageHeight(): number | null { return this.field.height ? Number(this.field.height) : null; }

  override ngOnChanges(_: SimpleChanges): void { /* display-only */ }
}

// ----------------------------
// SeparatorComponent (type=separator)
// ----------------------------
@Component({
  selector: 'fv-separator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf],
  template: `
    <div style="display:flex;align-items:center;gap:8px;padding:4px 0">
      <hr style="flex:1;margin:0;border-color:var(--formitiva-border-color,#ccc)" />
      <span *ngIf="separatorLabel" class="fv-separator-label">{{ separatorLabel }}</span>
      <hr *ngIf="separatorLabel" style="flex:1;margin:0;border-color:var(--formitiva-border-color,#ccc)" />
    </div>
  `,
})
export class SeparatorComponent extends BaseFieldComponent<string | undefined> {
  get separatorLabel(): string {
    const t = this.ctx.t();
    const lbl = this.field.displayName ?? '';
    return lbl ? t(lbl) : '';
  }

  override ngOnChanges(_: SimpleChanges): void { /* display-only */ }
}
