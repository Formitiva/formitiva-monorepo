// components/IntegerInput.tsx
import * as React from "react";
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type { DefinitionPropertyField } from '@formitiva/core';
import type { BaseInputProps } from '@formitiva/core';
import { CSS_CLASSES, combineClasses } from '@formitiva/core';
import { useUncontrolledValidatedInput } from "../../../hooks/useUncontrolledValidatedInput";
import { useFieldValidator } from "../../../hooks/useFieldValidator";

export type IntegerInputProps = BaseInputProps<number | string, DefinitionPropertyField>;

const IntegerInput: React.FC<IntegerInputProps> = ({
  field,
  value,
  onChange,
  onError,
  error: externalError,
}) => {
  // Define validation logic
  const validate = useFieldValidator(field, externalError);

  // Use our shared uncontrolled + validated input hook
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
        // Uncontrolled input for typing performance
        defaultValue={String(value ?? "")}
        ref={inputRef}
        onChange={handleChange}
        className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.inputNumber)}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.name}-error` : undefined}
      />
    </StandardFieldLayout>
  );
};

IntegerInput.displayName = "IntegerInput";
export default React.memo(IntegerInput);
