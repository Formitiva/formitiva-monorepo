import type { DefinitionPropertyField, FieldValueType, TranslationFunction } from "../../core/formitivaTypes";

const parseDateTime = (value?: string): number | null => {
  if (!value) return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : time;
};

const fieldCache = new WeakMap<
  DefinitionPropertyField,
  { minTime: number | null; maxTime: number | null }
>();

const getCachedLimits = (field: DefinitionPropertyField) => {
  let cached = fieldCache.get(field);
  if (!cached) {
    cached = {
      minTime: parseDateTime(field.minDate),
      maxTime: parseDateTime(field.maxDate),
    };
    fieldCache.set(field, cached);
  }
  return cached;
};

export function validateDateField(
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction
): string | undefined {
  if (input == null || String(input).trim() === "") {
    return field.required ? t("Value required") : undefined;
  }

  const inputStr = String(input).trim();
  const inputTime = parseDateTime(inputStr);
  if (inputTime === null) {
    return t("Invalid date format");
  }

  const { minTime, maxTime } = getCachedLimits(field);

  if (minTime !== null && inputTime < minTime) {
    return t("Date must be on or after {{1}}", field.minDate);
  }

  if (maxTime !== null && inputTime > maxTime) {
    return t("Date must be on or before {{1}}", field.maxDate);
  }

  return undefined;
}
