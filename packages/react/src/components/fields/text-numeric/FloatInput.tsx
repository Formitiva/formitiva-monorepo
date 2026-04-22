// components/FloatInput.tsx
import * as React from "react";
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type { DefinitionPropertyField } from '@formitiva/core';
import type { BaseInputProps } from '@formitiva/core';
import { CSS_CLASSES, combineClasses } from '@formitiva/core';
import { useUncontrolledValidatedInput } from "../../../hooks/useUncontrolledValidatedInput";
import { useFieldValidator } from "../../../hooks/useFieldValidator";

/**
 * FloatInput component
 */
export type FloatInputProps = BaseInputProps<number | string, DefinitionPropertyField>;

const FloatInput: React.FC<FloatInputProps> = ({
  field,
  value,
  onChange,
  onError,
  error: externalError,
}) => {
  const validate = useFieldValidator(field, externalError);

  // Use shared uncontrolled + validated input hook
  const { inputRef, error, handleChange } = useUncontrolledValidatedInput<HTMLInputElement, string>({
    value,
    onChange,
    onError,
    validate,
  });

  return (
    <StandardFieldLayout field={field} error={error}>
      <input
        id={field.name}
        type="text"
        inputMode="decimal"
        pattern="[+-]?[0-9]*[.,]?[0-9]*"
        ref={inputRef}
        // IMPORTANT:
        // This input is intentionally UNCONTROLLED for typing performance.
        // - `defaultValue` is only used on mount.
        // - Subsequent value updates are synced manually via `inputRef` in an effect.
        // Do NOT change this to `value={...}` unless you want a controlled input
        // (which will re-render on every keystroke).
        defaultValue={String(value ?? "")}
        onChange={handleChange}
        className={combineClasses(
          CSS_CLASSES.input,
          CSS_CLASSES.inputNumber
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.name}-error` : undefined}
      />
    </StandardFieldLayout>
  );
};

FloatInput.displayName = "FloatInput";
export default React.memo(FloatInput);
