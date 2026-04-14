import * as React from "react";
import type { ValidationTrigger } from "./useFieldValidator";

export type UseUncontrolledValidatedInputProps <TValue extends string | string[] = string>= {
  value?: string | number | Array<string | number>;
  disabled?: boolean;
  onChange?: (value: TValue) => void;
  onError?: (error: string | null) => void;
  validate: (value: TValue, trigger?: ValidationTrigger) => string | null; // validation always receives string
  count?:number; // for multiple inputs 
};

/**
 * Handles:
 * - Uncontrolled input
 * - Validation
 * - Error sync
 */
// Generic hook: supports both <input> and <textarea> elements
export function useUncontrolledValidatedInput<
  T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement,
  TValue extends string | string[] = string
>({ value, disabled, onChange, onError, validate, count=1}: UseUncontrolledValidatedInputProps<TValue>) {
  const normalizedCount = Math.max(1, count);
  const inputElementsRef = React.useRef<Array<T | null>>([]);
  
  // Backwards-compatible single-ref (first input)
  const inputRef = React.useRef<T | null>(null);
  const getInputRef = React.useCallback(
    (index = 0) => (el: T | null) => {
      inputElementsRef.current[index] = el;
      if (index === 0) inputRef.current = el;
    },
    []
  );

  const prevErrorRef = React.useRef<string | null>(null);
  const onErrorRef = React.useRef(onError);
  const [error, setError] = React.useState<string | null>(null);

  // Keep stable ref to latest onError
  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Helper: normalize incoming value to array of strings of length `count`
  const normalizeValueToArray = React.useCallback(
    (v?: string | number | Array<string | number>) => {
      if (v === undefined) return Array.from({ length: normalizedCount }, () => "");
      if (Array.isArray(v)) return v.slice(0, normalizedCount).map((s) => String(s));
      // single scalar -> first slot, others empty
      return [String(v), ...Array.from({ length: Math.max(0, normalizedCount - 1) }, () => "")].slice(0, normalizedCount);
    },
    [normalizedCount]
  );

  // Sync external value and validate when not focused
  React.useEffect(() => {
    // Helper: get the DOM element for a given index, falling back to
    // inputRef.current for index 0 when fields use `ref={inputRef}` directly
    // instead of `ref={getInputRef(0)}` (which would populate inputElementsRef).
    const getEl = (i: number): T | null =>
      inputElementsRef.current[i] ?? (i === 0 ? inputRef.current : null);

    if (disabled) {
      if (prevErrorRef.current !== null) {
        prevErrorRef.current = null;
        onErrorRef.current?.(null);
        setError(null);
      }
      // Sync DOM value for disabled/computed fields so externally-driven value
      // changes (e.g. computedRef) are reflected in the uncontrolled input.
      const strValues = normalizeValueToArray(value);
      for (let i = 0; i < normalizedCount; i += 1) {
        const el = getEl(i);
        if (el && el.value !== strValues[i]) {
          el.value = strValues[i];
        }
      }
      return;
    }

    const strValues = normalizeValueToArray(value);
    const isFocused =
      typeof document !== "undefined" &&
      Array.from({ length: normalizedCount }, (_, i) => getEl(i)).some(
        (el) => el !== null && document.activeElement === el
      );

    if (!isFocused) {
      const valueForValidate = (normalizedCount === 1 ? strValues[0] : strValues) as TValue;
      const err = validate(valueForValidate);
      if (err !== prevErrorRef.current) {
        prevErrorRef.current = err;
        onErrorRef.current?.(err ?? null);
        setError(err);
      }

      // sync DOM values for all managed inputs
      for (let i = 0; i < normalizedCount; i += 1) {
        const el = getEl(i);
        if (el && el.value !== strValues[i]) {
          el.value = strValues[i];
        }
      }
    }
    // dependencies: value/validate/count/inputRefs
  }, [disabled, value, validate, normalizedCount, normalizeValueToArray]);

  const emitChangeAtIndex = React.useCallback(
    (index: number, newPart: string) => {
      const currentArr = normalizeValueToArray(value);
      const next = currentArr.slice();
      next[index] = newPart;

      const valueForValidate = (normalizedCount === 1 ? next[0] : next) as TValue;
      const err = validate(valueForValidate);
      if (err !== prevErrorRef.current) {
        prevErrorRef.current = err;
        setError(err);
        onErrorRef.current?.(err ?? null);
      }

      onChange?.(valueForValidate);
    },
    [onChange, validate, value, normalizedCount, normalizeValueToArray]
  );

  // Handle user input
  const handleChange = React.useCallback(
    (e: React.ChangeEvent<T>) => {
      if (disabled) return;
      emitChangeAtIndex(0, e.target.value);
    },
    [emitChangeAtIndex, disabled]
  );

  // Multi-input handler factory
  const getHandleChange = React.useCallback(
    (index = 0) => (e: React.ChangeEvent<T>) => {
      emitChangeAtIndex(index, e.target.value);
    },
    [emitChangeAtIndex]
  );

  const emitBlurAtIndex = React.useCallback(
    (index: number) => {
      if (disabled) return;
      const currentArr = normalizeValueToArray(value);
      const el = inputElementsRef.current[index];
      if (el) currentArr[index] = el.value;
      const valueForValidate = (normalizedCount === 1 ? currentArr[0] : currentArr) as TValue;
      const err = validate(valueForValidate, "blur");
      if (err !== prevErrorRef.current) {
        prevErrorRef.current = err;
        setError(err);
        onErrorRef.current?.(err ?? null);
      }
    },
    [disabled, validate, value, normalizedCount, normalizeValueToArray]
  );

  // Backward-compatible blur handler (first input)
  const handleBlur = React.useCallback(() => {
    emitBlurAtIndex(0);
  }, [emitBlurAtIndex]);

  // Multi-input blur handler factory
  const getHandleBlur = React.useCallback(
    (index = 0) => () => {
      emitBlurAtIndex(index);
    },
    [emitBlurAtIndex]
  );

  React.useEffect(() => {
    const element = inputRef.current;
    if (!element) return;

    element.addEventListener("blur", handleBlur);
    return () => {
      element.removeEventListener("blur", handleBlur);
    };
  }, [handleBlur]);

  return { inputRef, getInputRef, error, handleChange, getHandleChange, handleBlur, getHandleBlur };
}
