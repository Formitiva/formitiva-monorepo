import type { DefinitionPropertyField, FieldValueType, TranslationFunction } from "../../core/formitivaTypes";

export function validateFloatField(
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction
): string | undefined {
  const inputStr = String(input);
  if (inputStr.trim() === "") {
    if (field.min !== undefined || field.max !== undefined) {
      return t("Value required when min or max constraints is set");
    }
    return field.required ? t("Value required") : undefined;
  }

  const parsedValue = Number(inputStr);
  if (Number.isNaN(parsedValue)) return t("Must be a valid float");

  if (field.min !== undefined) {
    const inclusive = field.type === "slider" ? true : field.minInclusive ?? true;
    const tooLow = inclusive
      ? parsedValue < field.min
      : parsedValue <= field.min;
    if (tooLow) {
      return t(
        "Must be {{1}} {{2}}",
        inclusive ? "\u2265" : ">",
        field.min
      );
    }
  }

  if (field.max !== undefined) {
    const inclusive = field.type === "slider" ? true : field.maxInclusive ?? true;
    const tooHigh = inclusive
      ? parsedValue > field.max
      : parsedValue >= field.max;
    if (tooHigh) {
      return t(
        "Must be {{1}} {{2}}",
        inclusive ? "\u2264" : "<",
        field.max
      );
    }
  }

  return undefined;
}

const validFloatRegex = /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?$/;
function isValidFloatArray(input: string) {
  return input
    .split(",")
    .map((item) => item.trim())
    .every((val) => validFloatRegex.test(val));
}

const delimiter = ",";
const parseArray = (text: string): number[] => {
  if (!text || text.trim() === "") return [];
  return text
    .split(delimiter)
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => Number(v));
};

export function validateFloatArrayField(
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction
): string | undefined {
  const inputStr = String(input);
  if (inputStr.trim() === "") {
    if (field.min !== undefined || field.max !== undefined) {
      return t("Value required when min or max constraints is set");
    }
    return field.required ? t("Value required") : undefined;
  }

  if (!isValidFloatArray(inputStr)) {
    return t("Each value must be a valid float");
  }

  const numbers = parseArray(inputStr);
  if (field.minCount !== undefined && numbers.length < field.minCount) {
    return t("Minimum number of values: {{1}}", field.minCount);
  }

  if (field.maxCount !== undefined && numbers.length > field.maxCount) {
    return t("Maximum number of values: {{1}}", field.maxCount);
  }

  for (const num of numbers) {
    if (field.min !== undefined) {
      const belowLimit = field.minInclusive
        ? num < field.min
        : num <= field.min;
      if (belowLimit) {
        return t(
          "Each value must be {{1}} {{2}}",
          field.minInclusive ? "\u2265" : ">",
          field.min
        );
      }
    }

    if (field.max !== undefined) {
      const aboveLimit = field.maxInclusive
        ? num > field.max
        : num >= field.max;
      if (aboveLimit) {
        return t(
          "Each value must be {{1}} {{2}}",
          field.maxInclusive ? "\u2264" : "<",
          field.max
        );
      }
    }
  }

  return undefined;
}
