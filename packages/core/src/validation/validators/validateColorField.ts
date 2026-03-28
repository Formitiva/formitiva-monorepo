import type { DefinitionPropertyField, FieldValueType, TranslationFunction } from "../../core/formitivaTypes";

const HEX_REGEX = /^#([0-9A-F]{3}){1,2}$/i;
const isValidHexColor = (color: string) => HEX_REGEX.test(color);

export function validateColorField(
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction
): string | undefined {
  const inputStr = String(input).trim();
  if (inputStr === "") {
    return field.required ? t("Value required") : undefined;
  }

  if (!isValidHexColor(inputStr)) {
    return t("Invalid color format");
  }

  return undefined;
}
