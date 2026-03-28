import * as React from "react";
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
} from '@formitiva/core';

import useFormitivaContext from "../../../hooks/useFormitivaContext";
import { CSS_CLASSES } from '@formitiva/core';
import { useFieldValidator } from "../../../hooks/useFieldValidator";

// Props expected by SwitchInput component
type SwitchInputProps = BaseInputProps<boolean, DefinitionPropertyField>;

/**
 * SwitchInput
 */
const SwitchInput: React.FC<SwitchInputProps> = ({
  field,
  value,
  onChange,
  onError,
  error: externalError,
}) => {
  const { t, formStyle, fieldStyle } = useFormitivaContext();
  const validate = useFieldValidator(field, externalError);
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
    updateError(validate(Boolean(value), "sync"));
  }, [value, validate, updateError]);
  
  const fs = formStyle as Record<string, unknown> | undefined;
  const ffs = fieldStyle as Record<string, unknown> | undefined;

  const styleFrom = (
    source: Record<string, unknown> | undefined,
    section?: string,
    key?: string
  ): React.CSSProperties => {
    if (!section) return {};
    const sec = source?.[section] as Record<string, unknown> | undefined;
    const val = key && sec ? (sec[key] as React.CSSProperties | undefined) : undefined;
    return (val ?? {}) as React.CSSProperties;
  };
  const labelStyle = React.useMemo<React.CSSProperties>(() => ({
    display: 'inline-block',
    position: 'relative',
    width: 44,
    height: 24,
    ...styleFrom(fs, 'switch', 'label'),
    ...styleFrom(ffs, undefined, 'label'),
  }), [fs, ffs]);

  const hiddenInputStyle = React.useMemo<React.CSSProperties>(() => ({
    position: 'absolute',
    opacity: 0,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    margin: 0,
    cursor: 'pointer',
    pointerEvents: 'none', // Make hidden input non-interactive to avoid event conflicts
    ...styleFrom(fs, 'switch', 'hiddenInput'),
    ...styleFrom(ffs, undefined, 'hiddenInput'),
  }), [fs, ffs]);

  const sliderBaseStyle = React.useMemo<React.CSSProperties>(() => ({
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'var(--formitiva-switch-off-bg, #ccc)',
    transition: '0.3s',
    borderRadius: 24,
    // Use individual border properties to avoid mixing shorthand and
    // non-shorthand style updates (React warns when `border` and
    // `borderColor` are toggled separately). Setting these separately
    // lets us update `borderColor` without replacing the whole shorthand.
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'transparent',
    ...styleFrom(fs, 'switch', 'slider'),
    ...styleFrom(ffs, undefined, 'slider'),
  }), [fs, ffs]);

  const knobBaseStyle = React.useMemo<React.CSSProperties>(() => ({
    position: 'absolute',
    height: 16,
    width: 16,
    left: 2,
    bottom: 2,
    backgroundColor: 'white',
    transition: '0.3s',
    borderRadius: '50%',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    ...styleFrom(fs, 'switch', 'knob'),
    ...styleFrom(ffs, undefined, 'knob'),
  }), [fs, ffs]);

  const isOn = Boolean(value);

  // Toggles boolean value on click
  const handleToggle = () => {
    const newVal = !isOn;
    updateError(validate(newVal, "change"));
    onChange?.(newVal);
  };

  const handleBlur = React.useCallback(() => {
    updateError(validate(isOn, "blur"));
  }, [isOn, updateError, validate]);

  return (
    <StandardFieldLayout field={field} error={error} rightAlign={false}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <label 
          className={CSS_CLASSES.label}
          htmlFor={field.name}
          style={{ textAlign: 'left' as const, justifyContent: 'flex-start' }}
        >
          {t(field.displayName)}
        </label>
        <label style={labelStyle}>
          <input
            id={field.name}
            type="checkbox"
            checked={isOn}
            readOnly={true}
            aria-label={t(field.displayName)}
            aria-invalid={false}
            aria-describedby={undefined}
            style={hiddenInputStyle}
            tabIndex={-1}
          />
          <span
            role="switch"
            data-testid="switch"
            tabIndex={0}
            aria-checked={isOn}
            aria-invalid={!!error}
            aria-describedby={error ? `${field.name}-error` : undefined}
            onClick={handleToggle}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Space' || e.key === 'Enter') {
                e.preventDefault();
                handleToggle();
              }
            }}
            className={`formitiva-switch ${isOn ? 'active checked on' : ''} `}
            style={isOn ? { ...sliderBaseStyle, backgroundColor: 'var(--formitiva-switch-on-bg, #22c55e)', borderColor: 'var(--formitiva-switch-on-border, #16a34a)' } : sliderBaseStyle}
          >
            <span
              style={{
                ...knobBaseStyle,
                transform: isOn ? 'translateX(20px)' : undefined,
              }}
            />
          </span>
        </label>
      </div>
    </StandardFieldLayout>
  );
};

SwitchInput.displayName = "SwitchInput";
export default React.memo(SwitchInput);
