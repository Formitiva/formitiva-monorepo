import type { DefinitionPropertyField, FieldValueType, TranslationFunction } from "../../core/formitivaTypes";

export function validateRatingField(
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction
): string | undefined {
  const inputStr = String(input ?? "").trim();
  if (inputStr === "") {
    return field.required ? t("Value required") : undefined;
  }

  let parsedValue = input;
  if (typeof input !== "number") {
    parsedValue = parseFloat(inputStr);
  }

  if (Number.isNaN(parsedValue) || (parsedValue as number) <= 0) {
    return t("Invalid value");
  }

  // Check max constraints
  if (field.max !== undefined && (parsedValue as number) > field.max) {
    return t("Must be {{1}} {{2}}", "\u2264", field.max);
  }

  return undefined;
}
