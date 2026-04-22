/**
 * Base class for all Formitiva field components.
 * Provides common validation logic using FormitivaContextService.
 * Each field component extends this and adds its own template.
 */
import {
  Directive,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { OnChanges, SimpleChanges, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormitivaContextService } from '../../../services/formitiva-context.service';
import { validateField } from '@formitiva/core';
import type { DefinitionPropertyField, FieldValueType, ErrorType } from '@formitiva/core';

export type ValidationTrigger = 'change' | 'blur' | 'sync';

@Directive()
export abstract class BaseFieldComponent<TValue = FieldValueType>
  implements OnInit, OnChanges, OnDestroy
{
  @Input({ required: true }) field!: DefinitionPropertyField;
  @Input() value!: TValue;
  @Input() disabled = false;
  @Input() error: string | null = null; // external error from form state
  /** Emits the new value whenever the field's value changes. */
  @Output() valueChange = new EventEmitter<TValue>();
  /** Emits the validation error (or null when valid). */
  @Output() errorChange = new EventEmitter<string | null>();

  // Accept React-style callback props via Inputs when parent passes functions
  @Input() onChangeFn?: (value: TValue) => void;
  @Input() onErrorFn?: (error: string | null) => void;

  // Additional inputs used by container components (e.g., buttons)
  @Input() valuesMap?: Record<string, FieldValueType | unknown>;
  @Input('handleChange') handleChangeFn?: (name: string, value: FieldValueType | unknown) => void;
  @Input('handleError') handleErrorFn?: (name: string, error: ErrorType) => void;

  protected readonly ctx = inject(FormitivaContextService);
  readonly errorSig = signal<string | null>(null);

  ngOnInit(): void {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ngOnChanges(_changes: SimpleChanges): void {}
  ngOnDestroy(): void {}

  protected doValidate(value: TValue, trigger: ValidationTrigger = 'change'): string | null {
    const mode = this.ctx.fieldValidationMode();
    const t = this.ctx.t();
    const defName = this.ctx.definitionName();
    if (mode === 'onEdit' || mode === 'realTime') {
      return validateField(defName, this.field, value as unknown as FieldValueType, t) ?? null;
    }
    if (mode === 'onBlur') {
      return trigger === 'blur'
        ? (validateField(defName, this.field, value as unknown as FieldValueType, t) ?? null)
        : (this.error ?? null);
    }
    return this.error ?? null;
  }

  protected updateError(err: string | null): void {
    if (err !== this.errorSig()) {
      this.errorSig.set(err);
      this.errorChange.emit(err);
      if (typeof this.onErrorFn === 'function') this.onErrorFn(err);
    }
  }

  protected emitChange(value: TValue): void {
    this.valueChange.emit(value);
    if (typeof this.onChangeFn === 'function') this.onChangeFn(value);
    if (typeof this.handleChangeFn === 'function' && this.field && this.field.name) {
      this.handleChangeFn(this.field.name, value as unknown as FieldValueType | unknown);
    }
  }

  protected emitError(err: string | null): void {
    this.errorChange.emit(err);
    if (typeof this.onErrorFn === 'function') this.onErrorFn(err);
    if (typeof this.handleErrorFn === 'function' && this.field && this.field.name) {
      this.handleErrorFn(this.field.name, err as ErrorType);
    }
  }
}

/**
 * Extended base for fields backed by a FormControl (text/numeric inputs).
 * Prevents cursor-jumping by tracking the last emitted value, so we don't
 * overwrite the control when the parent echoes back the same value.
 */
@Directive()
export abstract class ReactiveStringFieldComponent
  extends BaseFieldComponent<string | number>
  implements OnInit, OnChanges, OnDestroy
{
  protected readonly control = new FormControl('');
  private lastEmittedValue: string | null = null;
  private lastControlValue: string | null = null;
  private readonly destroyRef = inject(DestroyRef);

  override ngOnInit(): void {
    this.control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((v: string | null) => {
      const val = String(v ?? '');
      if (val === this.lastControlValue) {
        return;
      }

      this.lastControlValue = val;
      this.lastEmittedValue = val;
      this.emitChange(val);
      this.updateError(this.doValidate(val, 'change'));
    });
  }

  override ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      const newVal = String(this.value ?? '');
      if (newVal !== this.lastEmittedValue) {
        this.control.setValue(newVal, { emitEvent: false });
      }
      this.lastControlValue = newVal;
    }
    if (changes['error'] || changes['field'] || changes['value']) {
      this.updateError(this.doValidate(this.control.value as string | number, 'sync'));
    }
  }

  override ngOnDestroy(): void {}

  onBlur(): void {
    this.updateError(this.doValidate(this.control.value as string | number, 'blur'));
  }
}
