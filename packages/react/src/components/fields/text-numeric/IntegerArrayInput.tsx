// components/IntegerArrayInput.tsx
import * as React from "react";
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type { DefinitionPropertyField } from '@formitiva/core';
import type { BaseInputProps } from '@formitiva/core';
import { CSS_CLASSES, combineClasses } from '@formitiva/core';
import { useFieldValidator } from "../../../hooks/useFieldValidator";
import { useUncontrolledValidatedInput } from "../../../hooks/useUncontrolledValidatedInput";

// Base field type for number arrays
// Props for the generic number array input
export type IntegerArrayInputProps = BaseInputProps<string | number[], DefinitionPropertyField>;


/**
 * IntegerArrayInput
 */
const IntegerArrayInput: React.FC<IntegerArrayInputProps> = ({
  field,
  value,
  onChange,
  onError,
  error: externalError,
}) => {
  const validate = useFieldValidator(field, externalError);

  const stringValue = Array.isArray(value) ? value.join(", ") : String(value ?? "");

  const { inputRef, error, handleChange } = useUncontrolledValidatedInput<HTMLInputElement, string>({
    value: stringValue,
    onChange,
    onError,
    validate,
  });

  return (
    <StandardFieldLayout field={field} error={error}>
      <input
        id={field.name}
        type="text"
        defaultValue={stringValue}
        ref={inputRef}
        onChange={handleChange}
        className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
        style={{ flex: 1 }}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.name}-error` : undefined}
      />
    </StandardFieldLayout>
  );
};

IntegerArrayInput.displayName = "IntegerArrayInput";
export default React.memo(IntegerArrayInput);
