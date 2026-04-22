import * as React from "react";
import type { DefinitionPropertyField, FieldValueType, ErrorType } from '@formitiva/core';
import { FieldRenderer } from "./FieldRenderer";

export interface FieldGroupProps {
  groupName: string;
  defaultOpen?: boolean;
  fields: DefinitionPropertyField[];
  valuesMap: Record<string, FieldValueType>;
  handleChange: (fieldName: string, value: FieldValueType) => void;
  handleError?: (fieldName: string, error: ErrorType) => void;
  errorsMap?: Record<string, string>;
  t: (key: string) => string;
  disabledByRef?: Record<string, boolean>;
}

/**
 * Self-managing collapsible field group component with internal toggle state
 */
export const FieldGroup = React.memo<FieldGroupProps>(
  ({ groupName, defaultOpen = true, fields, valuesMap, handleChange, handleError, errorsMap, t, disabledByRef }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    const onToggle = React.useCallback(() => setIsOpen(prev => !prev), []);

    return (
      <fieldset className="formitiva-group">
        <legend
          onClick={onToggle}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
          tabIndex={0}
          role="button"
          aria-expanded={isOpen}
          className="formitiva-group_legend"
        >
          <span>{t(groupName)}</span>
          <span className="formitiva-group_legend_arrow">{isOpen ? "\u25BC" : "\u25B6"}</span>
        </legend>
        {isOpen &&
          fields.map((field) => (
            <FieldRenderer
              key={field.name}
              field={field}
              valuesMap={valuesMap}
              handleChange={handleChange}
              handleError={handleError}
              errorsMap={errorsMap}
              disabledByRef={disabledByRef}
            />
          ))}
      </fieldset>
    );
  }
);

FieldGroup.displayName = "FieldGroup";
