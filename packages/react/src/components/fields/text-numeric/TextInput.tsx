import * as React from "react";
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type { DefinitionPropertyField } from '@formitiva/core';
import type { BaseInputProps } from '@formitiva/core';
import { CSS_CLASSES, combineClasses } from '@formitiva/core';
import { useUncontrolledValidatedInput } from "../../../hooks/useUncontrolledValidatedInput";
import { useFieldValidator } from "../../../hooks/useFieldValidator";
import useFormitivaContext from "../../../hooks/useFormitivaContext";

// ------------------ Types ------------------

type TextInputProps = BaseInputProps<string, DefinitionPropertyField> & { error?: string | null };

// ------------------ Component ------------------

const TextInput: React.FC<TextInputProps> = ({
  field,
  value,
  onChange,
  onError,
  error: externalError,
}) => {
  const validate = useFieldValidator(field, externalError);
  const { t } = useFormitivaContext();

  const { inputRef, error, handleChange } = useUncontrolledValidatedInput({
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
        defaultValue={String(value ?? "")}
        ref={inputRef}
        onChange={handleChange}
        className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
        placeholder={field.placeholder ? t(field.placeholder) : undefined}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.name}-error` : undefined}
      />
    </StandardFieldLayout>
  );
};

TextInput.displayName = "TextInput";
export default TextInput;
