import * as React from "react";
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
} from '@formitiva/core';
import useFormitivaContext from "../../../hooks/useFormitivaContext";
import { CSS_CLASSES } from '@formitiva/core';
import { useFieldValidator } from "../../../hooks/useFieldValidator";

type CheckboxInputProps = BaseInputProps<boolean, DefinitionPropertyField>;

const CheckboxInput: React.FC<CheckboxInputProps> = ({
  field,
  value = false,
  onChange,
  onError,
  error: externalError,
}) => {
  const { t,  } = useFormitivaContext();
  const validate = useFieldValidator(field, externalError);
  const onErrorRef = React.useRef(onError);
  const [error, setError] = React.useState<string | null>(null);
  const prevErrorRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  React.useEffect(() => {
    const err = validate(value, "sync");
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      setError(err);
      if (!externalError) {
        onErrorRef.current?.(err ?? null);
      }
    }
  }, [value, validate, externalError]);

  const updateError = React.useCallback(
    (next: string | null) => {
      if (next !== prevErrorRef.current) {
        prevErrorRef.current = next;
        setError(next);
        if (!externalError) {
          onErrorRef.current?.(next ?? null);
        }
      }
    },
    [externalError]
  );

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      updateError(validate(checked, "change"));
      onChange?.(checked);
    },
    [onChange, updateError, validate]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Accept multiple possible space key representations across envs
      const isSpace = e.key === " " || e.key === "Space" || e.key === "Spacebar" || e.code === "Space";
      if (isSpace || e.key === "Enter") {
        e.preventDefault();
        const next = !value;
        updateError(validate(next, "change"));
        onChange?.(next);
      }
    },
    [onChange, value, updateError, validate]
  );

  const handleBlur = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      updateError(validate(e.target.checked, "blur"));
    },
    [updateError, validate]
  );

  const inputId = field.name;

  return (
    <StandardFieldLayout field={field} rightAlign={false} error={error}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <label
          className={CSS_CLASSES.label}
          htmlFor={inputId}
          style={{ textAlign: "left", justifyContent: "flex-start" }}
        >
          {t(field.displayName)}
        </label>

        <input
          id={inputId}
          data-testid="boolean-checkbox"
          type="checkbox"
          checked={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          aria-checked={value}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.name}-error` : undefined}
          style={{
            cursor: "pointer",
            margin: "8px 0",
            width: "1.2em",
            height: "1.2em",
            verticalAlign: "middle",
            accentColor: "#0000FF",
          }}
        />
      </div>
    </StandardFieldLayout>
  );
};

CheckboxInput.displayName = "CheckboxInput";
export default React.memo(CheckboxInput);
