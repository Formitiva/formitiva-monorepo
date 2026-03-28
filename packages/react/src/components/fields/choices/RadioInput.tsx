import * as React from "react";
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
} from '@formitiva/core';
import useFormitivaContext from "../../../hooks/useFormitivaContext";
import { CSS_CLASSES, combineClasses } from '@formitiva/core';
import { useFieldValidator } from "../../../hooks/useFieldValidator";

type RadioField = DefinitionPropertyField & {
  options: NonNullable<DefinitionPropertyField["options"]>;
};

export type RadioInputProps = BaseInputProps<string, RadioField>;

const RadioInput: React.FC<RadioInputProps> = ({
  field,
  value,
  onChange,
  onError,
  error : externalError,
}) => {
  const { t } = useFormitivaContext();
  const validate = useFieldValidator(field, externalError);

  const layout: "row" | "column" =
    field.layout?.toLowerCase() === "horizontal" ? "row" : "column";

  const onErrorRef = React.useRef(onError);

  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const [error, setError] = React.useState<string | null>(null);
  const prevErrorRef = React.useRef<string | null>(null);

  const updateError = React.useCallback(
    (next: string | null) => {
      if (next !== prevErrorRef.current) {
        prevErrorRef.current = next;
        setError(next);
        onErrorRef.current?.(next);
      }
    },
    []
  );

  /**
   * Validate & normalize incoming value
   */
  React.useEffect(() => {
    const safeValue = value != null ? String(value) : "";
    const err = validate(safeValue, "sync");

    if (err && field.options.length > 0) {
      const firstValue = String(field.options[0].value);
      onChange?.(firstValue);
    }

    updateError(err);
  }, [value, field.options, validate, onChange, updateError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    const err = validate(nextValue, "change");
    updateError(err);
    onChange?.(nextValue);
  };

  const handleBlur = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const err = validate(e.target.value, "blur");
      updateError(err);
    },
    [validate, updateError]
  );

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: layout,
    flexWrap: layout === "row" ? "wrap" : "nowrap",
    gap: layout === "row" ? "12px" : "4px",
    alignItems: layout === "row" ? "center" : "stretch",
    width: "100%",
    padding: layout === "row" ? "8px" : undefined,
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: layout === "column" ? "flex" : "inline-flex",
    gap: "8px",
    alignItems: "center",
    whiteSpace: "nowrap",
    marginBottom: layout === "column" ? 6 : 0,
    cursor: "pointer",
    width: layout === "column" ? "100%" : undefined,
    justifyContent: "flex-start",
  };

  return (
    <StandardFieldLayout field={field} error={error}>
      <div
        className={CSS_CLASSES.input}
        aria-labelledby={`${field.name}-label`}
        aria-invalid={!!error}
        style={containerStyle}
      >
        {field.options.map((opt) => {
          const optValue = String(opt.value);
          const id = `${field.name}-${optValue}`;
          return (
            <label
              key={optValue}
              className={combineClasses(CSS_CLASSES.label)}
              style={labelStyle}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                if (String(value ?? "") !== optValue) {
                  handleChange({ target: { value: optValue } } as React.ChangeEvent<HTMLInputElement>);
                }
              }}
            >
              <input
                id={id}
                type="radio"
                name={field.name}
                value={optValue}
                checked={String(value ?? "") === optValue}
                onChange={handleChange}
                onBlur={handleBlur}
                style={{ width: "1.1em", height: "1.1em" }}
              />
              <span
                style={{
                  userSelect: "none",
                  textAlign: layout === "column" ? "left" : undefined,
                  flex: layout === "column" ? 1 : undefined,
                  fontWeight: 400,
                }}
              >
                {t(opt.label)}
              </span>
            </label>
          );
        })}
      </div>
    </StandardFieldLayout>
  );
};

RadioInput.displayName = "RadioInput";
export default React.memo(RadioInput);
