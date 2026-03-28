
import type { DefinitionPropertyField, FieldValueType, TranslationFunction } from "../../core/formitivaTypes";
import validateFieldPattern from "./validateFieldPattern";

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateEmailField(
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction
): string | undefined {
  const inputStr = String(input ?? "").trim();
  if (inputStr === "")
    return field.required ? t("Value required") : undefined;

  if (!isValidEmail(inputStr)) return t("Must be valid email format");

  return validateFieldPattern(field, input, t, t("Email does not match pattern: {{1}}", field.pattern));
}
