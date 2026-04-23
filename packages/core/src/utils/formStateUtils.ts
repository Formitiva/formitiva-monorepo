/**
 * formStateUtils.ts
 *
 * Pure, framework-agnostic helpers that encapsulate the shared form-state
 * logic that would otherwise be duplicated inside every framework renderer
 * (React, Vue, Angular, Vanilla).
 *
 * None of these functions carry framework-specific primitives (hooks,
 * signals, refs, …).  They operate on plain JS objects and return new
 * plain JS objects that each framework can store however it likes.
 */

import type {
  DefinitionPropertyField,
  FieldValueType,
  FieldVisibilityStatus,
  FieldValidationMode,
  FormitivaDefinition,
  FormitivaInstance,
  TranslationFunction,
} from '../core/formitivaTypes';
import {
  updateVisibilityMap,
  updateVisibilityBasedOnSelection,
  applyVisibilityRefs,
  applyComputedRefs,
} from '../core/fieldVisibility';
import { renameDuplicatedGroups, groupConsecutiveFields } from './groupingHelpers';
import { validateField } from '../validation/validation';

// ─── buildFieldMap ───────────────────────────────────────────────────────────

export interface FieldMapResult {
  /** Field map with `children` populated from each field's `parents` entries. */
  nameToField: Record<string, DefinitionPropertyField>;
  /** Same fields as `nameToField` values (order matches original `properties`). */
  updatedProperties: DefinitionPropertyField[];
  /** Pre-filtered subset of `updatedProperties` that declare a `computedRef`. */
  computedRefFields: DefinitionPropertyField[];
  /** Pre-filtered subset of `updatedProperties` that declare a `visibilityRef`. */
  visibilityRefFields: DefinitionPropertyField[];
}

/**
 * Builds the `nameToField` lookup from a definition's `properties` array:
 * - copies each field and initialises an empty `children` map
 * - populates `children` by inverting `parents` declarations
 * - renames duplicated group names so they remain unique for rendering
 */
export function buildFieldMap(properties: DefinitionPropertyField[]): FieldMapResult {
  const nameToField: Record<string, DefinitionPropertyField> = {};
  properties.forEach(f => {
    nameToField[f.name] = { ...f, children: {} as Record<string, string[]> };
  });

  properties.forEach(field => {
    if (!field.parents) return;
    Object.entries(field.parents).forEach(([parentName, selections]) => {
      const parentField = nameToField[parentName];
      if (!parentField) return;
      selections.forEach(sel => {
        if (!parentField.children) parentField.children = {};
        const key = String(sel);
        parentField.children[key] = [...(parentField.children[key] ?? []), field.name];
      });
    });
  });

  renameDuplicatedGroups(properties, nameToField);
  const updatedProperties = Object.values(nameToField) as DefinitionPropertyField[];
  return {
    nameToField,
    updatedProperties,
    computedRefFields: updatedProperties.filter(f => f.computedRef),
    visibilityRefFields: updatedProperties.filter(f => f.visibilityRef),
  };
}

// ─── initFormState ───────────────────────────────────────────────────────────

export interface FormStateInit {
  nameToField: Record<string, DefinitionPropertyField>;
  updatedProperties: DefinitionPropertyField[];
  /** Pre-filtered subset of `updatedProperties` that declare a `computedRef`. */
  computedRefFields: DefinitionPropertyField[];
  /** Pre-filtered subset of `updatedProperties` that declare a `visibilityRef`. */
  visibilityRefFields: DefinitionPropertyField[];
  valuesMap: Record<string, FieldValueType>;
  visibility: Record<string, boolean>;
  visibilityRefStatus: Record<string, FieldVisibilityStatus>;
  disabledByRef: Record<string, boolean>;
}

/**
 * Computes the full initial form state from a definition + instance.
 *
 * Replaces the ~40-line boilerplate that was duplicated verbatim in the
 * React, Vue, Angular, and Vanilla renderers.
 */
export function initFormState(
  definition: FormitivaDefinition,
  instance: FormitivaInstance,
  t: TranslationFunction,
): FormStateInit {
  const { properties } = definition;
  const { nameToField, updatedProperties, computedRefFields, visibilityRefFields } = buildFieldMap(properties);

  // Default values (unit fields use a [value, unit] tuple)
  const valuesMap: Record<string, FieldValueType> = {};
  updatedProperties.forEach(f => {
    if (f.type === 'unit') {
      const numVal = typeof f.defaultValue === 'number' ? String(f.defaultValue) : '';
      const unitVal = typeof f.defaultUnit === 'string' ? f.defaultUnit : String(f.defaultUnit ?? 'm');
      valuesMap[f.name] = [numVal, unitVal] as unknown as FieldValueType;
    } else {
      valuesMap[f.name] = f.defaultValue;
    }
  });

  // Override with instance values
  Object.keys(instance.values).forEach(key => {
    if (nameToField[key] !== undefined) valuesMap[key] = instance.values[key];
  });

  // Apply computed value handlers before computing visibility (pre-filtered list)
  const initComputed = applyComputedRefs(computedRefFields, valuesMap, t);
  Object.assign(valuesMap, initComputed);

  // Initial visibility
  const vis: Record<string, boolean> = {};
  updatedProperties.forEach(f => { vis[f.name] = false; });
  const visibility = updateVisibilityMap(updatedProperties, valuesMap, vis, nameToField);

  // Visibility-ref status (pre-filtered list)
  const visibilityRefStatus = applyVisibilityRefs(visibilityRefFields, valuesMap, t);
  const disabledByRef = Object.fromEntries(
    Object.entries(visibilityRefStatus).map(([n, s]) => [n, s === 'disable']),
  );

  return { nameToField, updatedProperties, computedRefFields, visibilityRefFields, valuesMap, visibility, visibilityRefStatus, disabledByRef };
}

// ─── computeFieldChange ──────────────────────────────────────────────────────

export interface FieldChangeResult {
  /** Updated values map (includes computed-ref propagation). */
  newValues: Record<string, FieldValueType>;
  /** Updated visibility map (only differs from input when visibility changed). */
  newVisibility: Record<string, boolean>;
  /** Updated visibilityRef status map. */
  newVisRefStatus: Record<string, FieldVisibilityStatus>;
  /** Convenience map: field name → true when visRef status is 'disable'. */
  newDisabledByRef: Record<string, boolean>;
  /** True when at least one field's visibility or refStatus changed. */
  visibilityChanged: boolean;
}

/**
 * Computes the new form state after a single field value change.
 *
 * Returns plain objects; the caller is responsible for writing them into
 * whatever reactive store the framework uses.
 */
export function computeFieldChange(
  name: string,
  value: FieldValueType,
  state: {
    fieldMap: Record<string, DefinitionPropertyField>;
    updatedProperties: DefinitionPropertyField[];
    valuesMap: Record<string, FieldValueType>;
    visibility: Record<string, boolean>;
    /** Pre-filtered fields with computedRef — avoids iterating all fields on every change. */
    computedRefFields?: DefinitionPropertyField[];
    /** Pre-filtered fields with visibilityRef — avoids iterating all fields on every change. */
    visibilityRefFields?: DefinitionPropertyField[];
  },
  t: TranslationFunction,
): FieldChangeResult {
  const { fieldMap, updatedProperties, valuesMap, visibility, computedRefFields, visibilityRefFields } = state;

  // 1. Update values + propagate computed refs (use pre-filtered list when available)
  const baseValues = { ...valuesMap, [name]: value };
  const computedVals = applyComputedRefs(computedRefFields ?? updatedProperties, baseValues, t);
  const newValues = Object.keys(computedVals).length > 0 ? { ...baseValues, ...computedVals } : baseValues;

  // 2. Update visibility when this field drives conditional show/hide.
  //    `hasChildren` is non-empty whenever any other field lists `name` as a
  //    parent (buildFieldMap inverts parents→children), so the separate
  //    isParentToOthers O(n) scan is redundant and removed.
  const field = fieldMap[name];
  const hasChildren = field?.children && Object.keys(field.children).length > 0;

  let newVisibility = visibility;
  if (hasChildren) {
    newVisibility = updateVisibilityBasedOnSelection({ ...visibility }, fieldMap, newValues, name, value);
  }

  // 3. Re-apply visibilityRef handlers (use pre-filtered list when available)
  const newVisRefStatus = applyVisibilityRefs(visibilityRefFields ?? updatedProperties, newValues, t);
  const newDisabledByRef = Object.fromEntries(
    Object.entries(newVisRefStatus).map(([n, s]) => [n, s === 'disable']),
  );

  const visibilityChanged =
    newVisibility !== visibility ||
    Object.keys(newVisRefStatus).some(k => (state as unknown as { visRefStatus?: Record<string, FieldVisibilityStatus> }).visRefStatus?.[k] !== newVisRefStatus[k]);

  return { newValues, newVisibility, newVisRefStatus, newDisabledByRef, visibilityChanged };
}

// ─── computeVisibleGroups ────────────────────────────────────────────────────

export interface VisibleGroup {
  name: string | undefined;
  fields: DefinitionPropertyField[];
}

/**
 * Filters the visible fields (combining visibility map and visibilityRef
 * status) and groups consecutive fields that share a group name.
 *
 * @param loadedCount - When provided, only the first `loadedCount` properties
 *   are considered (used by progressive-rendering frameworks such as React /
 *   Angular).
 */
export function computeVisibleGroups(
  updatedProperties: DefinitionPropertyField[],
  visibility: Record<string, boolean>,
  visibilityRefStatus: Record<string, FieldVisibilityStatus>,
  loadedCount?: number,
): VisibleGroup[] {
  const props = loadedCount !== undefined
    ? updatedProperties.slice(0, loadedCount)
    : updatedProperties;

  const visibleFields = props.filter(f => {
    const refStatus = visibilityRefStatus[f.name];
    if (refStatus !== undefined) return refStatus !== 'invisible';
    return visibility[f.name];
  });

  const { groups } = groupConsecutiveFields(visibleFields);
  return groups.map(g => ({ name: g.name ?? undefined, fields: g.fields }));
}

// ─── computeSubmitErrors ─────────────────────────────────────────────────────

/**
 * Runs the on-submission validation pass over all non-disabled fields.
 * Returns an error map (field name → error message string).
 * An empty object means the form is valid.
 */
export function computeSubmitErrors(
  updatedProperties: DefinitionPropertyField[],
  valuesMap: Record<string, FieldValueType>,
  definitionName: string,
  t: TranslationFunction,
): Record<string, string> {
  const errors: Record<string, string> = {};
  updatedProperties.forEach(field => {
    if (field.disabled) return;
    const value = valuesMap[field.name];
    if (value === undefined) return;
    const err = validateField(definitionName, field, value, t);
    if (err) errors[field.name] = err;
  });
  return errors;
}

// ─── isSubmitDisabled ────────────────────────────────────────────────────────

/**
 * Returns `true` when the submit button should be disabled because the form
 * has live-validation errors.  Only applies in the three "live" validation
 * modes; in `onSubmission` mode the button is always enabled.
 */
export function isSubmitDisabled(
  fieldValidationMode: FieldValidationMode | undefined,
  errors: Record<string, string>,
): boolean {
  if (
    fieldValidationMode === 'onEdit' ||
    fieldValidationMode === 'onBlur' ||
    fieldValidationMode === 'realTime'
  ) {
    return Object.values(errors).some(Boolean);
  }
  return false;
}
