// components/NumericStepperInput.tsx
import * as React from "react";
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type { DefinitionPropertyField } from '@formitiva/core';
import type { BaseInputProps } from '@formitiva/core';
import { CSS_CLASSES } from '@formitiva/core';
import { useUncontrolledValidatedInput } from "../../../hooks/useUncontrolledValidatedInput";
import { useFieldValidator } from "../../../hooks/useFieldValidator";

export type NumericStepperInputProps = BaseInputProps<string | number, DefinitionPropertyField>;

const NumericStepperInput: React.FC<NumericStepperInputProps> = ({
  field,
  value,
  onChange,
  onError,
  error: externalError,
}) => {
  const validate = useFieldValidator(field, externalError);

  // Use shared uncontrolled + validated input hook
  const { inputRef, error, handleChange } = useUncontrolledValidatedInput<HTMLInputElement, string>({
    value: String(value ?? ""),
    onChange,
    onError,
    validate,
  });

  const step = Math.max(1, Math.round(field.step ?? 1)); // ensure step >= 1
  return (
    <StandardFieldLayout field={field} error={error}>
      <input
        id={field.name}
        type="number"
        // IMPORTANT: Don't change this to `value={...}` unless you want a controlled input
        // See IntegerInput.tsx for details.
        defaultValue={String(value ?? "")}
        ref={inputRef}
        min={field.min ?? undefined}
        max={field.max ?? undefined}
        step={step}
        onChange={handleChange}
        style={{
          width: "100%",
          height: "100%"
        }}
        className={CSS_CLASSES.input}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.name}-error` : undefined}
      />
    </StandardFieldLayout>
  );
};

NumericStepperInput.displayName = "NumericStepperInput";
export default React.memo(NumericStepperInput);
