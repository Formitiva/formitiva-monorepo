/**
 * Vanilla JS unit-value field utility.
 * Replaces the React useUnitValueField hook.
 */
import { computeUnitValueState, emitUnitValueChange } from '@formitiva/core';
import type { UnitFactors } from '@formitiva/core';
import type { DefinitionPropertyField } from '@formitiva/core';

export function createUnitValueField(
  definitionName: string,
  field: DefinitionPropertyField,
  value: [string | number, string],
  unitFactors: UnitFactors,
  t: (key: string) => string,
  onChange?: (v: [string, string], err: string | null) => void,
  onError?: (err: string | null) => void
) {
  const state = computeUnitValueState(definitionName, field, value, unitFactors, t);
  onError?.(state.error);

  const emitChange = (v: string, u: string): void =>
    emitUnitValueChange(v, u, definitionName, field, t, onChange, onError);

  return {
    value: state.value,
    unit: state.unit,
    error: state.error,
    setValue: (v: string) => emitChange(v, state.unit),
    setUnit: (u: string) => emitChange(state.value, u),
    setBoth: emitChange,
  };
}

