/**
 * Vanilla JS unit-value field utility.
 * Replaces the React useUnitValueField hook.
 */
import { validateField } from '@formitiva/core';
import type { DefinitionPropertyField } from '@formitiva/core';

export function createUnitValueField(
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
  const normalizeUnit = (unit?: string): string => {
    if (!unit) return unitFactors.default;
    if (unit in unitFactors.labels) return unit;
    if (unitFactors.reverseLabels?.[unit]) {
      return unitFactors.reverseLabels[unit];
    }
    return unitFactors.default;
  };

  const normalized = {
    value: String(value[0] ?? ''),
    unit: normalizeUnit(value[1]),
  };

  const validate = (v: string, u: string): string | null =>
    validateField(definitionName, field, [v, u], t) ?? null;

  const error = validate(normalized.value, normalized.unit);
  onError?.(error);

  const emitChange = (v: string, u: string): void => {
    const err = validate(v, u);
    onChange?.([v, u], err);
    onError?.(err);
  };

  return {
    value: normalized.value,
    unit: normalized.unit,
    error,
    setValue: (v: string) => emitChange(v, normalized.unit),
    setUnit: (u: string) => emitChange(normalized.value, u),
    setBoth: emitChange,
  };
}


