import type { DefinitionPropertyField, FieldValueType } from './formitivaTypes';

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
