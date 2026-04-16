/**
 * unitValueFieldUtils.ts
 *
 * Pure, framework-agnostic helpers for unit-value fields.
 * These replace the duplicated logic that was present in the
 * React/Vue/Vanilla `useUnitValueField` / `createUnitValueField` hooks.
 */

import type { DefinitionPropertyField, TranslationFunction } from '../core/formitivaTypes';
import { validateField } from '../validation/validation';

// ─── UnitFactors ─────────────────────────────────────────────────────────────

export interface UnitFactors {
  /** The canonical key used when no unit is provided or the unit is unknown. */
  default: string;
  /** Map of canonical unit key → display label. */
  labels: Record<string, string>;
  /** Optional reverse map: display label → canonical unit key. */
  reverseLabels?: Record<string, string>;
}

// ─── normalizeUnit ────────────────────────────────────────────────────────────

/**
 * Resolves a raw unit string (which may be a display label) to its canonical
 * key, falling back to `unitFactors.default` when the unit is unknown.
 */
export function normalizeUnit(unit: string | undefined, unitFactors: UnitFactors): string {
  if (!unit) return unitFactors.default;
  if (unit in unitFactors.labels) return unit;
  if (unitFactors.reverseLabels?.[unit]) return unitFactors.reverseLabels[unit];
  return unitFactors.default;
}

// ─── UnitValueState ───────────────────────────────────────────────────────────

export interface UnitValueState {
  /** Normalized numeric value as a string. */
  value: string;
  /** Normalized canonical unit key. */
  unit: string;
  /** Validation error, or `null` when valid. */
  error: string | null;
}

/**
 * Computes the normalized state (value, unit, error) for a unit-value field.
 * Call this once per value/unit change — the result is a plain object with no
 * reactive primitives, suitable for use in any framework.
 */
export function computeUnitValueState(
  definitionName: string,
  field: DefinitionPropertyField,
  value: [string | number, string],
  unitFactors: UnitFactors,
  t: TranslationFunction,
): UnitValueState {
  const unit = normalizeUnit(value[1], unitFactors);
  const val = String(value[0] ?? '');
  const error = validateField(definitionName, field, [val, unit], t) ?? null;
  return { value: val, unit, error };
}

// ─── emitUnitValueChange ──────────────────────────────────────────────────────

/**
 * Validates the new `(v, u)` pair and fires `onChange` + `onError` callbacks.
 * This is the shared "emitChange" body used by every framework's hook.
 */
export function emitUnitValueChange(
  v: string,
  u: string,
  definitionName: string,
  field: DefinitionPropertyField,
  t: TranslationFunction,
  onChange?: (v: [string, string], err: string | null) => void,
  onError?: (err: string | null) => void,
): void {
  const err = validateField(definitionName, field, [v, u], t) ?? null;
  onChange?.([v, u], err);
  onError?.(err);
}
