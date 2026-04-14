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

  const allChildren = Object.values(parentField.children).flat();
  for (const childName of allChildren) {
    if (typeof childName === 'string' && childName in visibility) {
      visibility[childName] = false;
      hideChildrenRecursively(childName, fieldMap, visibility);
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
 * Returns a map of field name → computed FieldValueType for each field whose
 * registered handler was found and invoked and returned a non-undefined value.
 * Call after any value change and merge results back into the values map so
 * dependent fields always show up-to-date derived values.
 */
export const applyComputedRefs = (
  fields: DefinitionPropertyField[],
  values: Record<string, FieldValueType>,
  t: TranslationFunction,
): Record<string, FieldValueType> => {
  const result: Record<string, FieldValueType> = {};
  for (const field of fields) {
    if (field.computedRef) {
      const handler = getComputedValueHandler(field.computedRef);
      if (handler) {
        const computed = handler(field.name, values, t);
        if (computed !== undefined) {
          result[field.name] = computed;
        }
      }
    }
  }
  return result;
};
