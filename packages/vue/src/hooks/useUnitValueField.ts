// hooks/useUnitValueField.ts
import { computed, watch } from "vue";
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
  const normalizeUnit = (unit?: string) => {
    if (!unit) return unitFactors.default;
    if (unit in unitFactors.labels) return unit;
    if (unitFactors.reverseLabels?.[unit]) {
      return unitFactors.reverseLabels[unit];
    }
    return unitFactors.default;
  };

  const normalized = computed(() => {
    return {
      value: String(value[0] ?? ""),
      unit: normalizeUnit(value[1]),
    };
  });

  const validate = (v: string, u: string) =>
    validateField(definitionName, field, [v, u], t);

  const error = computed(() => 
    validate(normalized.value.value, normalized.value.unit)
  );

  watch(error, (newError) => {
    onError?.(newError);
  });

  const emitChange = (v: string, u: string) => {
    const err = validate(v, u);
    onChange?.([v, u], err);
    onError?.(err);
  };

  return {
    value: computed(() => normalized.value.value),
    unit: computed(() => normalized.value.unit),
    error,
    setValue: (v: string) => emitChange(v, normalized.value.unit),
    setUnit: (u: string) => emitChange(normalized.value.value, u),
    setBoth: emitChange,
  };
}
