/**
 * Vanilla JS uncontrolled-validated-input utility.
 * Replaces the React useUncontrolledValidatedInput hook.
 *
 * Manages an uncontrolled <input> or <textarea> element:
 * - Syncs the external value to the DOM when the element is not focused
 * - Validates on change and blur
 * - Debounces validation-triggered onChange if needed
 */
import type { ValidationTrigger } from './useFieldValidator';

export type ValidateFunction<TValue extends string | string[] = string> = (
  value: TValue,
  trigger?: ValidationTrigger
) => string | null;

export class UncontrolledValidatedInput<
  T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement,
  TValue extends string | string[] = string
> {
  private inputs: Array<T | null> = [];
  private count: number;
  private prevError: string | null = null;

  readonly onError?: (error: string | null) => void;
  readonly onChange?: (value: TValue) => void;
  readonly validate: ValidateFunction<TValue>;

  private _error: string | null = null;
  private _errorListeners: Array<(e: string | null) => void> = [];

  constructor(opts: {
    count?: number;
    onChange?: (value: TValue) => void;
    onError?: (error: string | null) => void;
    validate: ValidateFunction<TValue>;
  }) {
    this.count = Math.max(1, opts.count ?? 1);
    this.onChange = opts.onChange;
    this.onError = opts.onError;
    this.validate = opts.validate;
    this.inputs = Array(this.count).fill(null);
  }

  /** Register an input element at a given index (default 0) */
  setRef(el: T | null, index = 0): void {
    this.inputs[index] = el;
  }

  /** Get the element at index 0 (backward-compat) */
  get inputRef(): T | null {
    return this.inputs[0];
  }

  get error(): string | null {
    return this._error;
  }

  private emitError(err: string | null): void {
    if (err !== this.prevError) {
      this.prevError = err;
      this._error = err;
      this.onError?.(err);
      this._errorListeners.forEach((l) => l(err));
    }
  }

  onErrorChange(listener: (e: string | null) => void): () => void {
    this._errorListeners.push(listener);
    return () => {
      this._errorListeners = this._errorListeners.filter((l) => l !== listener);
    };
  }

  private normalize(v?: string | number | Array<string | number>): string[] {
    if (v === undefined) return Array(this.count).fill('');
    if (Array.isArray(v)) return v.slice(0, this.count).map(String);
    return [String(v), ...Array(Math.max(0, this.count - 1)).fill('')].slice(0, this.count);
  }

  /** Sync external value to DOM (called when value prop changes) */
  syncValue(value?: string | number | Array<string | number>, disabled?: boolean): void {
    if (disabled) {
      this.emitError(null);
      return;
    }
    const strValues = this.normalize(value);
    const isFocused = typeof document !== 'undefined' &&
      this.inputs.slice(0, this.count).some((el) => el && document.activeElement === el);
    if (!isFocused) {
      const valueForValidate = (this.count === 1 ? strValues[0] : strValues) as TValue;
      this.emitError(this.validate(valueForValidate) ?? null);
      for (let i = 0; i < this.count; i++) {
        const el = this.inputs[i];
        if (el && el.value !== strValues[i]) el.value = strValues[i];
      }
    }
  }

  private emitChangeAt(
    index: number,
    newPart: string,
    currentValue?: string | number | Array<string | number>
  ): void {
    const current = this.normalize(currentValue);
    const next = [...current];
    next[index] = newPart;
    const valueForValidate = (this.count === 1 ? next[0] : next) as TValue;
    this.emitError(this.validate(valueForValidate) ?? null);
    this.onChange?.(valueForValidate);
  }

  /** Native 'input' event handler for element at index 0 */
  handleChange = (e: Event): void => {
    const target = e.target as T;
    // currentValue is read from siblings
    const current = this.inputs.map((el) => (el ? el.value : ''));
    this.emitChangeAt(0, target.value, current);
  };

  /** Factory for per-index native 'input' event handler */
  getHandleChange(index: number): (e: Event) => void {
    return (e: Event) => {
      const target = e.target as T;
      const current = this.inputs.map((el) => (el ? el.value : ''));
      this.emitChangeAt(index, target.value, current);
    };
  }

  private emitBlurAt(_index: number): void {
    const current = this.inputs.map((el) => (el ? el.value : ''));
    const valueForValidate = (this.count === 1 ? current[0] : current) as TValue;
    this.emitError(this.validate(valueForValidate, 'blur') ?? null);
  }

  handleBlur = (): void => {
    this.emitBlurAt(0);
  };

  getHandleBlur(index: number): () => void {
    return () => this.emitBlurAt(index);
  }

  /** Attach event listeners to all registered input elements */
  attachListeners(value?: string | number | Array<string | number>): () => void {
    const handlers: Array<{ el: T; change: (e: Event) => void; blur: () => void }> = [];
    for (let i = 0; i < this.count; i++) {
      const el = this.inputs[i];
      if (!el) continue;
      const changeHandler = this.getHandleChange(i);
      const blurHandler = this.getHandleBlur(i);
      el.addEventListener('input', changeHandler);
      el.addEventListener('blur', blurHandler);
      handlers.push({ el, change: changeHandler, blur: blurHandler });
    }
    // Initial sync
    this.syncValue(value);
    return () => {
      for (const { el, change, blur } of handlers) {
        el.removeEventListener('input', change);
        el.removeEventListener('blur', blur);
      }
    };
  }
}
