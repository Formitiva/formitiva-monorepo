import type { DefinitionPropertyField, FieldValueType, TranslationFunction } from "../../core/formitivaTypes";

export function validateDropdownField(
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction
): string | undefined {
  const inputStr = String(input);
  if (inputStr === "") {
    return field.required ? t("Value required") : undefined;
  }
  
  if (!field.options?.some((opt) => String(opt.value) === inputStr)) {
    return t("Invalid option selected");
  }

  return undefined;
}

export function validateMultiSelectionField(
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction
): string | undefined {
  const inputStr = String(input ?? "");
  const trimedString = inputStr.trim();
  if (trimedString === "") {
    return field.required ? t("Value required") : undefined;
  }

  // Check if trimedstring is an array and validate each entry
  const selections = trimedString.split(",").map((s) => s.trim()).filter((s) => s !== "");
  if (selections.length === 0) {
    return field.required ? t("Value required") : undefined;
  }
  
  for (const selection of selections) {
    if (!field.options?.some((opt) => String(opt.value) === selection)) {
      return t("Invalid option selected");
    }
  }

  return undefined;
}
