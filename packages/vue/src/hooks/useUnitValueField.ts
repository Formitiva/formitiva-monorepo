// hooks/useUnitValueField.ts
import { computed, watch } from "vue";
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
  const normalized = computed(() =>
    computeUnitValueState(definitionName, field, value, unitFactors, t)
  );

  watch(() => normalized.value.error, (newError) => {
    onError?.(newError);
  });

  const emitChange = (v: string, u: string) =>
    emitUnitValueChange(v, u, definitionName, field, t, onChange, onError);

  return {
    value: computed(() => normalized.value.value),
    unit: computed(() => normalized.value.unit),
    error: computed(() => normalized.value.error),
    setValue: (v: string) => emitChange(v, normalized.value.unit),
    setUnit: (u: string) => emitChange(normalized.value.value, u),
    setBoth: emitChange,
  };
}
