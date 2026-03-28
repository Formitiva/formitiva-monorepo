import type { DefinitionPropertyField, FieldValueType, TranslationFunction } from "../../core/formitivaTypes";

export function validateFileField(
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction
): string | undefined {
  if (Array.isArray(input)) {
    if (input.length === 0) {
      return t("Select a file");
    }

    return !(input as File[]).every(f => f instanceof File) ? t("Invalid file input") : undefined;
  }

  if (!(input instanceof File)) {
    const inputString = String(input);
    if (field.required && (input == null || (typeof inputString === "string" && inputString.trim() === ""))) {
      return t("Select a file");
    }
    return t("Invalid file input: {{1}}", inputString);
  }
  return undefined;
}
