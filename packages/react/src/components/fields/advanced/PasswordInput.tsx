import * as React from "react";
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type { DefinitionPropertyField } from '@formitiva/core';
import type { BaseInputProps } from '@formitiva/core';
import { CSS_CLASSES, combineClasses } from '@formitiva/core';
import { useUncontrolledValidatedInput } from "../../../hooks/useUncontrolledValidatedInput";
import { useFieldValidator } from "../../../hooks/useFieldValidator";
import useFormitivaContext from "../../../hooks/useFormitivaContext";

const ShowIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable={false}
  >
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
    <circle cx={12} cy={12} r={3} />
  </svg>
);

const HideIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable={false}
  >
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3-11-8 1.02-2.35 2.77-4.28 4.78-5.54" />
    <path d="M1 1l22 22" />
    <path d="M9.88 9.88A3 3 0 0 0 14.12 14.12" />
  </svg>
);

type PasswordInputProps = BaseInputProps<string, DefinitionPropertyField>;

const PasswordInput: React.FC<PasswordInputProps> = ({
  field,
  value,
  onChange,
  onError,
  error: externalError,
}) => {
  const { t } = useFormitivaContext();
  const validate = useFieldValidator(field, externalError);

  // Use our shared uncontrolled + validated input hook
  const { inputRef, error, handleChange } = useUncontrolledValidatedInput({
    value,
    onChange,
    onError,
    validate,
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const toggleShow = () => setShowPassword((s) => !s);

  return (
    <StandardFieldLayout field={field} error={error}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, width: '100%' }}>
        <input
          id={field.name}
          type={showPassword ? "text" : "password"}
          defaultValue={String(value ?? "")}
          ref={inputRef}
          onChange={handleChange}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
          style={{ flex: 1, minWidth: 0 }}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.name}-error` : undefined}
        />
        <button
          type="button"
          onClick={toggleShow}
          aria-label={showPassword ? t("Hide password") : t("Show password")}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: 16,
            lineHeight: 1,
            padding: "4px 6px",
            flexShrink: 0,
          }}
        >
          {showPassword ? <ShowIcon /> : <HideIcon />}
        </button>
      </div>
    </StandardFieldLayout>
  );
};

PasswordInput.displayName = "PasswordInput";
export default React.memo(PasswordInput);
