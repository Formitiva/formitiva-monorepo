import * as React from "react";
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type { DefinitionPropertyField } from '@formitiva/core';
import type { BaseInputProps } from '@formitiva/core';
import { CSS_CLASSES, combineClasses } from '@formitiva/core';
import { useUncontrolledValidatedInput } from "../../../hooks/useUncontrolledValidatedInput";
import { useFieldValidator } from "../../../hooks/useFieldValidator";

type DateInputProps = BaseInputProps<string, DefinitionPropertyField>;

/**
 * Safely parse a date string into a Date object.
 * Returns null if invalid or empty.
 */
const parseDate = (dateStr?: string): Date | null => {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Safely format a value for the HTML date input.
 * Returns empty string if the value is not a valid date format.
 */
const formatDateForInput = (dateValue?: string): string => {
  if (!dateValue) return "";

  // Check if it's already in yyyy-MM-dd format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (dateRegex.test(dateValue)) {
    // Verify it's actually a valid date
    const parsed = parseDate(dateValue);
    return parsed ? dateValue : "";
  }

  // Try to parse and format other date strings
  const parsed = parseDate(dateValue);
  if (parsed) {
    // Format as yyyy-MM-dd
    // Use UTC getters to avoid timezone shifts when formatting ISO timestamps
    const year = parsed.getUTCFullYear();
    const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
    const day = String(parsed.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return "";
};

/**
 * DateInput Component
 * -------------------
 * Controlled date input for Formitiva.
 */
const DateInput: React.FC<DateInputProps> = ({
  field,
  value,
  onChange,
  onError,
  error: externalError,
}) => {
  const validate = useFieldValidator(field, externalError);

  // Use our shared uncontrolled + validated input hook
  const formattedValue = formatDateForInput(value);

  const { inputRef, error, handleChange } = useUncontrolledValidatedInput<HTMLInputElement>({
    value: formattedValue,
    onChange,
    onError,
    validate,
  });

  return (
    <StandardFieldLayout field={field} error={error}>
      <input
        id={field.name}
        type="date"
        ref = {inputRef}
        defaultValue={formatDateForInput(value)}
        onChange={handleChange}
        className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
        {...(field.minDate ? { min: field.minDate } : {})}
        {...(field.maxDate ? { max: field.maxDate } : {})}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.name}-error` : undefined}
      />
    </StandardFieldLayout>
  );
};

DateInput.displayName = "DateInput";
export default React.memo(DateInput);
