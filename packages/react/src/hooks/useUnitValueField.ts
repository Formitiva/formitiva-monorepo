// hooks/useUnitValueField.ts
import * as React from "react";
import { computeUnitValueState, emitUnitValueChange } from '@formitiva/core';
import type { UnitFactors } from '@formitiva/core';
import type { DefinitionPropertyField } from '@formitiva/core';

export function useUnitValueField(
  definitionName: string,
  field: DefinitionPropertyField,
  value: [string | number, string],
  unitFactors: UnitFactors,
  t: (key: string) => string,
  onChange?: (v: [string, string], err: string | null) => void,
  onError?: (err: string | null) => void
) {
  const normalized = React.useMemo(
    () => computeUnitValueState(definitionName, field, value, unitFactors, t),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, unitFactors, definitionName, field, t]
  );

  React.useEffect(() => {
    onError?.(normalized.error);
  }, [normalized.error, onError]);

  const emitChange = React.useCallback(
    (v: string, u: string) =>
      emitUnitValueChange(v, u, definitionName, field, t, onChange, onError),
    [definitionName, field, t, onChange, onError]
  );

  return {
    value: normalized.value,
    unit: normalized.unit,
    error: normalized.error,
    setValue: (v: string) => emitChange(v, normalized.unit),
    setUnit: (u: string) => emitChange(normalized.value, u),
    setBoth: emitChange,
  };
}
