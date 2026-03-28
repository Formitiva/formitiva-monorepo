import * as React from "react";
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type { BaseInputProps, DefinitionPropertyField } from '@formitiva/core';
import { CSS_CLASSES, combineClasses } from '@formitiva/core';
import { useFieldValidator } from "../../../hooks/useFieldValidator";

type SliderInputProps = BaseInputProps<string | number, DefinitionPropertyField>;

const SliderInput: React.FC<SliderInputProps> = ({ field, value, onChange, onError, error: externalError }) => {
  const validate = useFieldValidator(field, externalError);
  
  const min = field.min ?? 0;
  const max = field.max ?? 100;

  // Controlled state
  const [inputValue, setInputValue] = React.useState(() =>
    !isNaN(Number(value)) ? String(Number(value)) : String(min)
  );

  // Sync with props
  React.useEffect(() => {
    const newVal = !isNaN(Number(value)) ? String(Number(value)) : String(min);
    setInputValue(newVal);
  }, [value, min]);

  const [error, setError] = React.useState<string | null>(null);
  const prevErrorRef = React.useRef<string | null>(null);
  const onErrorRef = React.useRef(onError);

  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const updateError = React.useCallback((next: string | null) => {
    if (next !== prevErrorRef.current) {
      prevErrorRef.current = next;
      setError(next);
      onErrorRef.current?.(next ?? null);
    }
  }, []);

  React.useEffect(() => {
    updateError(validate(inputValue, "sync") ?? null);
  }, [validate, inputValue, updateError]);

  // Handle changes from both range and text inputs
  const handleValueChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      setInputValue(input);
      updateError(validate(input, "change") ?? null);
      onChange?.(input);
    },
    [onChange, updateError, validate]
  );

  const handleBlur = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      updateError(validate(e.target.value, "blur") ?? null);
    },
    [updateError, validate]
  );

  const displayValue = !isNaN(Number(inputValue)) ? String(Number(inputValue)) : String(min);

  return (
    <StandardFieldLayout field={field} error={error}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
        <input
          id={`${field.name}-range`}
          type="range"
          value={displayValue}
          onChange={handleValueChange}
          onBlur={handleBlur}
          min={min}
          max={max}
          step="1.0"
          style={{
            padding: 0,
            flex: 1,
          }}
          className={CSS_CLASSES.rangeInput}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.name}-error` : undefined}
        />
        <input
          id={field.name}
          type="text"
          value={inputValue}
          onChange={handleValueChange}
          onBlur={handleBlur}
          required
          style={{
            width: "40px",
            minWidth: "40px",
            height: "2.3em",
            textAlign: "center",
            flexShrink: 0,
          }}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.name}-error` : undefined}
        />
      </div>
    </StandardFieldLayout>
  );
};

SliderInput.displayName = "SliderInput";
export default React.memo(SliderInput);
