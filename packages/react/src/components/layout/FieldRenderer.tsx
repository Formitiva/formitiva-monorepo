import * as React from "react";
import type { DefinitionPropertyField, FieldValueType, ErrorType } from '@formitiva/core';
import { getComponent } from "../../core/registries/componentRegistry";
import type { ButtonInputProps } from "../fields/ui-elements/Button";

export interface FieldRendererProps {
  field: DefinitionPropertyField;
  valuesMap: Record<string, FieldValueType>;
  handleChange: (fieldName: string, value: FieldValueType) => void;
  handleError?: (fieldName: string, error: ErrorType) => void;
  errorsMap?: Record<string, string>;
  disabledByRef?: Record<string, boolean>;
}

/**
 * Memoized component for rendering a single field with error handling
 * and optimized re-render prevention
 */
export const FieldRenderer = React.memo<FieldRendererProps>(
  ({ field, valuesMap, handleChange, handleError, errorsMap, disabledByRef }) => {
    const Component = getComponent(field.type) as React.ElementType | undefined;
    const value = valuesMap[field.name];
    const fieldError = errorsMap ? errorsMap[field.name] ?? null : undefined;
    const isDisabled = Boolean(field.disabled) || Boolean(disabledByRef?.[field.name]);

    const onChange = React.useCallback(
      (v: FieldValueType) => handleChange(field.name, v),
      [handleChange, field.name]
    );

    const onError = React.useCallback(
      (err: ErrorType) => handleError?.(field.name, err),
      [handleError, field.name]
    );

    if (!Component) return null;

    // Button type needs special props - pass valuesMap, handleChange, handleError
    if (field.type === 'button') {
      const buttonProps: ButtonInputProps = {
        field,
        value: null,
        disabled: isDisabled,
        valuesMap,
        handleChange,
        handleError: handleError || (() => {}),
      };
      return (
        <div
          aria-disabled={isDisabled}
          style={isDisabled ? { opacity: 0.6, pointerEvents: "none" } : undefined}
        >
          <Component {...buttonProps} />
        </div>
      );
    }

    return (
      <div
        aria-disabled={isDisabled}
        style={isDisabled ? { opacity: 0.6, pointerEvents: "none" } : undefined}
      >
        <Component
          field={field}
          value={value}
          disabled={isDisabled}
          onChange={onChange}
          onError={onError}
          error={fieldError}
        />
      </div>
    );
  },
  (prevProps, nextProps) =>
    prevProps.field === nextProps.field &&
    prevProps.valuesMap[prevProps.field.name] === nextProps.valuesMap[nextProps.field.name] &&
    prevProps.handleChange === nextProps.handleChange &&
    prevProps.handleError === nextProps.handleError &&
    prevProps.errorsMap?.[prevProps.field.name] === nextProps.errorsMap?.[nextProps.field.name] &&
    prevProps.disabledByRef?.[prevProps.field.name] === nextProps.disabledByRef?.[nextProps.field.name]
);

FieldRenderer.displayName = "FieldRenderer";
