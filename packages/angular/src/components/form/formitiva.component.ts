import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  inject,
} from '@angular/core';
import type { AfterViewInit, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { NgIf, NgStyle } from '@angular/common';
import { FormitivaContextService } from '../../services/formitiva-context.service';
import { FormitivaRendererComponent } from './formitiva-renderer.component';
import { createInstanceFromDefinition } from '@formitiva/core';
import { registerBaseComponents } from '../../core/registries/component-registry';
import { ensureBuiltinFieldTypeValidatorsRegistered } from '@formitiva/core';
import type {
  FormitivaDefinition,
  FormitivaInstance,
  FieldValidationMode,
  FormSubmissionHandler,
  FormValidationHandler,
} from '@formitiva/core';

let _formitivaInitialized = false;
function ensureFormitivaInitialized(): void {
  if (_formitivaInitialized) return;
  _formitivaInitialized = true;
  registerBaseComponents();
  ensureBuiltinFieldTypeValidatorsRegistered();
}

@Component({
  selector: 'fv-formitiva',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, NgStyle, FormitivaRendererComponent],
  providers: [FormitivaContextService],
  template: `
    <div
      [attr.data-formitiva-theme]="resolvedTheme"
      [class]="className"
      [ngStyle]="wrapperStyle"
    >
      <div *ngIf="!definition" style="color:red">Error: No form definition provided.</div>
      <div *ngIf="definition && !resolvedInstance" style="color:red">Error: Failed to create instance from definition.</div>
      <fv-formitiva-renderer
        *ngIf="definition && resolvedInstance"
        [definition]="definition"
        [instance]="resolvedInstance"
        [onSubmit]="onSubmit"
        [onValidation]="onValidation"
      ></fv-formitiva-renderer>
    </div>
  `,
})
export class FormitivaComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() definitionData?: string | Record<string, unknown> | FormitivaDefinition;
  @Input() instance?: FormitivaInstance;
  @Input() language?: string;
  @Input() className = 'formitiva-container';
  @Input() theme?: string;
  @Input() style?: Record<string, string>;
  @Input() fieldValidationMode: FieldValidationMode = 'onEdit';
  @Input() displayInstanceName = true;
  @Input() onSubmit?: FormSubmissionHandler;
  @Input() onValidation?: FormValidationHandler;

  readonly ctx = inject(FormitivaContextService);
  private readonly elRef = inject(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);

  definition: FormitivaDefinition | null = null;
  resolvedInstance: FormitivaInstance | null = null;
  resolvedTheme = 'light';
  wrapperStyle: Record<string, string> | null = null;

  private mo?: MutationObserver;
  private detectedTheme: string | null = null;

  ngOnInit(): void {
    ensureFormitivaInitialized();
    this.parseDefinition();
    this.resolveInstance();
    this.configureContext();
  }

  ngAfterViewInit(): void {
    this.setupThemeObserver();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['definitionData']) this.parseDefinition();
    if (changes['instance'] || changes['definitionData']) this.resolveInstance();
    // Only reconfigure when relevant inputs actually changed
    if (changes['language'] || changes['theme'] || changes['fieldValidationMode'] ||
        changes['displayInstanceName'] || changes['style'] || changes['definitionData']) {
      this.configureContext();
    }
    if (changes['theme']) {
      this.resolvedTheme = this.theme ?? this.detectedTheme ?? 'light';
    }
  }

  ngOnDestroy(): void {
    this.mo?.disconnect();
  }

  private parseDefinition(): void {
    try {
      if (!this.definitionData) { this.definition = null; return; }
      this.definition = typeof this.definitionData === 'string'
        ? JSON.parse(this.definitionData) as FormitivaDefinition
        : this.definitionData as FormitivaDefinition;
    } catch {
      this.definition = null;
    }
  }

  private resolveInstance(): void {
    if (this.instance) { this.resolvedInstance = this.instance; return; }
    if (!this.definition) { this.resolvedInstance = null; return; }
    const result = createInstanceFromDefinition(this.definition, this.definition.name);
    this.resolvedInstance = (result.success && result.instance) ? result.instance : null;
  }

  private configureContext(): void {
    this.resolvedTheme = this.theme ?? this.detectedTheme ?? 'light';
    this.wrapperStyle = this.style ?? null;

    this.ctx.configure({
      definitionName: this.definition?.name ?? '',
      language: this.language ?? 'en',
      theme: this.resolvedTheme,
      fieldValidationMode: this.fieldValidationMode,
      displayInstanceName: this.displayInstanceName,
      defaultStyle: (this.style as Record<string, unknown>) ?? {},
      localizeName: this.definition?.localization ?? '',
    });
  }

  private setupThemeObserver(): void {
    if (typeof document === 'undefined') return;
    // Observe the component's own host element for data-formitiva-theme attribute changes
    const el = this.elRef.nativeElement as HTMLElement;
    const themeEl = el.querySelector('[data-formitiva-theme]') as Element | null ?? el;
    this.detectedTheme = themeEl.getAttribute('data-formitiva-theme');
    if (this.detectedTheme) {
      this.resolvedTheme = this.theme ?? this.detectedTheme;
    }
    this.mo = new MutationObserver(mutations => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'data-formitiva-theme') {
          this.detectedTheme = (m.target as Element).getAttribute('data-formitiva-theme');
          if (!this.theme) {
            this.resolvedTheme = this.detectedTheme ?? 'light';
            this.ctx.configure({ theme: this.resolvedTheme });
            this.cdr.markForCheck();
          }
        }
      }
    });
    this.mo.observe(themeEl, { attributes: true, attributeFilter: ['data-formitiva-theme'] });
  }
}
