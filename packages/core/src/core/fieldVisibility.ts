import type { DefinitionPropertyField, FieldValueType, FieldVisibilityStatus, TranslationFunction } from './formitivaTypes';
import { getVisibilityHandler } from './registries/visibilityHandlerRegistry';
import { getComputedValueHandler } from './registries/computedValueHandlerRegistry';

const showChildrenRecursively = (
  parentName: string,
  fieldMap: Record<string, DefinitionPropertyField>,
  values: Record<string, FieldValueType>,
  visibility: Record<string, boolean>,
): void => {
  const parentField = fieldMap[parentName];
  if (!parentField?.children) return;

  const parentValue = values[parentName];
  const selectedValue =
    parentValue !== undefined && parentValue !== null ? String(parentValue) : '';

  const childrenToShow = parentField.children[selectedValue];
  if (!Array.isArray(childrenToShow)) return;

  for (const childName of childrenToShow) {
    if (typeof childName === 'string' && fieldMap[childName]) {
      visibility[childName] = true;
      showChildrenRecursively(childName, fieldMap, values, visibility);
    }
  }
};

const hideChildrenRecursively = (
  parentName: string,
  fieldMap: Record<string, DefinitionPropertyField>,
  visibility: Record<string, boolean>,
): void => {
  const parentField = fieldMap[parentName];
  if (!parentField?.children) return;

  for (const childrenList of Object.values(parentField.children)) {
    for (const childName of childrenList) {
      if (typeof childName === 'string' && childName in visibility) {
        visibility[childName] = false;
        hideChildrenRecursively(childName, fieldMap, visibility);
      }
    }
  }
};

/** Build the initial visibility map based on current values and parent-child relationships. */
export const updateVisibilityMap = (
  fields: DefinitionPropertyField[],
  values: Record<string, FieldValueType>,
  oldVisibility: Record<string, boolean>,
  fieldMapRef: Record<string, DefinitionPropertyField>,
): Record<string, boolean> => {
  const newVisibility = { ...oldVisibility };

  fields.forEach((field) => {
    if (!field.parents || Object.keys(field.parents).length === 0) {
      newVisibility[field.name] = true;
      showChildrenRecursively(field.name, fieldMapRef, values, newVisibility);
    }
  });

  return newVisibility;
};

/** Update visibility when a specific field's value changes. */
export const updateVisibilityBasedOnSelection = (
  visibility: Record<string, boolean>,
  fieldMap: Record<string, DefinitionPropertyField>,
  valuesMap: Record<string, FieldValueType>,
  fieldName: string,
  value: FieldValueType,
): Record<string, boolean> => {
  const newVisibility = { ...visibility };
  const field = fieldMap[fieldName];

  hideChildrenRecursively(fieldName, fieldMap, newVisibility);

  if (value !== undefined && value !== null && field?.children) {
    const valueKey = String(value);
    const childrenToShow = field.children[valueKey];
    if (Array.isArray(childrenToShow)) {
      for (const childName of childrenToShow) {
        if (typeof childName === 'string' && fieldMap[childName]) {
          newVisibility[childName] = true;
          showChildrenRecursively(childName, fieldMap, valuesMap, newVisibility);
        }
      }
    }
  }

  // Update fields that list `fieldName` as a parent
  Object.values(fieldMap).forEach((f) => {
    if (f.parents && fieldName in f.parents) {
      const accepted = f.parents[fieldName];
      if (Array.isArray(accepted)) {
        const strValue = String(value);
        const isArrayValue = Array.isArray(value);
        const visible = accepted.some((v) => {
          const strV = String(v);
          if (isArrayValue) {
            return (value as unknown[]).some((av) => String(av) === strV);
          }
          return strValue === strV;
        });
        if (visible) {
          newVisibility[f.name] = true;
          showChildrenRecursively(f.name, fieldMap, valuesMap, newVisibility);
        } else {
          newVisibility[f.name] = false;
          hideChildrenRecursively(f.name, fieldMap, newVisibility);
        }
      }
    }
  });

  return newVisibility;
};

/**
 * Apply visibilityRef handlers for all fields that declare one.
 * Returns a map of field name → FieldVisibilityStatus for each field whose
 * registered handler was found and invoked.
 * Results take precedence over parent-child visibility for those fields.
 */
export const applyVisibilityRefs = (
  fields: DefinitionPropertyField[],
  values: Record<string, FieldValueType>,
  t: TranslationFunction,
): Record<string, FieldVisibilityStatus> => {
  const result: Record<string, FieldVisibilityStatus> = {};
  for (const field of fields) {
    if (field.visibilityRef) {
      const handler = getVisibilityHandler(field.visibilityRef);
      if (handler) {
        result[field.name] = handler(field.name, values, t);
      }
    }
  }
  return result;
};

/**
 * Apply computedRef handlers for all fields that declare one.
 *
 * Behaviour:
 * - Each unique `computedRef` handler is called **at most once** per pass, even
 *   if multiple fields share the same handler name.
 * - A **progressive working copy** of the values map is maintained so that
 *   computed values produced earlier in the pass are visible to handlers that
 *   run later (fixes stale-read when one computed field depends on another).
 * - If a handler returns a plain `Record<string, FieldValueType>` map, **all**
 *   entries are merged into the result (and the working copy) immediately,
 *   enabling a single handler to update multiple fields atomically.
 * - If a handler returns a scalar `FieldValueType`, it is stored under the
 *   triggering field's own name (backward-compatible).
 */
export const applyComputedRefs = (
  fields: DefinitionPropertyField[],
  values: Record<string, FieldValueType>,
  t: TranslationFunction,
): Record<string, FieldValueType> => {
  const result: Record<string, FieldValueType> = {};
  // Progressive working copy: starts from the original values and accumulates
  // computed results so later handlers see freshly-computed values.
  const workingValues: Record<string, FieldValueType> = { ...values };
  // Track which handler names have already been called to avoid duplicate work
  // when multiple fields share the same computedRef.
  const calledRefs = new Set<string>();

  for (const field of fields) {
    if (!field.computedRef) continue;
    if (calledRefs.has(field.computedRef)) continue; // already handled by a previous field

    const handler = getComputedValueHandler(field.computedRef);
    if (!handler) continue;

    calledRefs.add(field.computedRef);
    const computed = handler(field.name, workingValues, t);

    if (computed === undefined) continue;

    // Detect a map return: plain object, not null, not an Array, not a File.
    if (
      computed !== null &&
      typeof computed === 'object' &&
      !Array.isArray(computed) &&
      !(computed instanceof File)
    ) {
      // Multi-field result — merge every entry
      const map = computed as Record<string, FieldValueType>;
      for (const [k, v] of Object.entries(map)) {
        result[k] = v;
        workingValues[k] = v; // feed forward
      }
    } else {
      // Single-field result — store under the triggering field's name
      result[field.name] = computed as FieldValueType;
      workingValues[field.name] = computed as FieldValueType; // feed forward
    }
  }

  return result;
};
