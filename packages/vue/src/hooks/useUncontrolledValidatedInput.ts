import { ref, watch, type Ref, isRef, type VNodeRef } from "vue";
import type { ValidationTrigger } from "./useFieldValidator";

export type UseUncontrolledValidatedInputProps = {
  value?: Ref<string | number> | string | number;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onError?: (error: string | null) => void;
  validate: (value: string, trigger?: ValidationTrigger) => string | null; // validation always receives string
};

/**
 * Handles:
 * - Uncontrolled input
 * - Validation
 * - Error sync
 */
export function useUncontrolledValidatedInput<
  T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement
>({ value, disabled, onChange, onError, validate, }: UseUncontrolledValidatedInputProps) {
  const inputRefRaw: Ref<T | null> = ref(null);
  const prevError = ref<string | null>(null);
  const error = ref<string | null>(null);

  // Sync external value and validate when not focused
  watch([
    () => (isRef(value) ? (value as Ref<string | number>).value : (value as string | number)),
    () => disabled,
  ], ([newValue, isDisabled]) => {
    if (isDisabled) {
      if (prevError.value !== null) {
        prevError.value = null;
        onError?.(null);
        error.value = null;
      }
      return;
    }

    const strValue = String(newValue ?? "");
    const isFocused = document.activeElement === inputRefRaw.value;

    if (!isFocused) {
      const err = validate(strValue, "sync");
      if (err !== prevError.value) {
        prevError.value = err;
        onError?.(err ?? null);
        error.value = err;
      }

      if (inputRefRaw.value && inputRefRaw.value.value !== strValue) {
        inputRefRaw.value.value = strValue;
      }
    }
  }, { immediate: true });

  // Handle user input
  const handleChange = (e: Event) => {
    if (disabled) {
      return;
    }

    const target = e.target as T;
    const strValue = target.value;
    const err = validate(strValue, "change");

    if (err !== prevError.value) {
      prevError.value = err;
      error.value = err;
      onError?.(err ?? null);
    }

    onChange?.(strValue);
  };

  const handleBlur = () => {
    if (disabled) {
      return;
    }

    // Read from the DOM; if the element is unavailable skip validation to avoid
    // reporting errors against the stale initial prop value
    if (!inputRefRaw.value) return;
    const strValue = String(inputRefRaw.value.value);
    const err = validate(strValue, "blur");

    if (err !== prevError.value) {
      prevError.value = err;
      error.value = err;
      onError?.(err ?? null);
    }
  };

  // Expose a VNodeRef for template `ref` typing while keeping a raw Ref for DOM ops
  const inputRef: VNodeRef = inputRefRaw as unknown as VNodeRef;

  return { inputRef, error, handleChange, handleBlur };
}
