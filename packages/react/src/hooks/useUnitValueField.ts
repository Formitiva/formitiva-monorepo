// hooks/useUnitValueField.ts
import * as React from "react";
import { validateField } from '@formitiva/core';
import type { DefinitionPropertyField } from '@formitiva/core';

export function useUnitValueField(
  definitionName: string,
  field: DefinitionPropertyField,
  value: [string | number, string],
  unitFactors: {
    default: string;
    labels: Record<string, string>;
    reverseLabels?: Record<string, string>;
  },
  t: (key: string) => string,
  onChange?: (v: [string, string], err: string | null) => void,
  onError?: (err: string | null) => void
) {
  const normalizeUnit = React.useCallback(
    (unit?: string) => {
      if (!unit) return unitFactors.default;
      if (unit in unitFactors.labels) return unit;
      if (unitFactors.reverseLabels?.[unit]) {
        return unitFactors.reverseLabels[unit];
      }
      return unitFactors.default;
    },
    [unitFactors]
  );

  const normalized = React.useMemo(() => {
    return {
      value: String(value[0] ?? ""),
      unit: normalizeUnit(value[1]),
    };
  }, [value, normalizeUnit]);

  const validate = React.useCallback(
    (v: string, u: string) =>
      validateField(definitionName, field, [v, u], t),
    [definitionName, field, t]
  );

  const error = React.useMemo(
    () => validate(normalized.value, normalized.unit),
    [normalized, validate]
  );

  React.useEffect(() => {
    onError?.(error);
  }, [error, onError]);

  const emitChange = React.useCallback(
    (v: string, u: string) => {
      const err = validate(v, u);
      onChange?.([v, u], err);
      onError?.(err);
    },
    [validate, onChange, onError]
  );

  return {
    value: normalized.value,
    unit: normalized.unit,
    error,
    setValue: (v: string) => emitChange(v, normalized.unit),
    setUnit: (u: string) => emitChange(normalized.value, u),
    setBoth: emitChange,
  };
}
