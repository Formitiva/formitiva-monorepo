import type { DefinitionPropertyField, FieldValueType, TranslationFunction } from "../../core/formitivaTypes";
import { validateFloatField } from "./validateFloatField";

export function validateUnitValueField(
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction
): string | undefined {
  const inputArr = Array.isArray(input) ? input : [];
  const value = inputArr[0];
  const unit = inputArr[1] ? String(inputArr[1]).trim() : "";
  const inputValueStr = String(value ?? "").trim();

  if (inputValueStr === "" || unit === "") {
    return field.required ? t("Value required") : undefined;
  }

  return validateFloatField(field, value, t);
}
