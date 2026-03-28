import type { DefinitionPropertyField, FieldValueType, TranslationFunction } from "../../core/formitivaTypes";
import validateFieldPattern from "./validateFieldPattern";

export function validatePhoneField(
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction
): string | undefined {
  const inputStr = String(input ?? "").trim();
  if (inputStr === "") return field.required ? t("Value required") : undefined;

  return validateFieldPattern(field, inputStr, t, "Invalid phone number format");
}
