import type { DefinitionPropertyField, FieldValueType, TranslationFunction } from "../../core/formitivaTypes";

export function validateTimeField(
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction
): string | undefined {
  const inputStr = String(input);
  if (!inputStr || inputStr.trim() === "") {
    return (field.required || field.min || field.max) ? t("Value required") : undefined;
  }
  // Time comparison: treat as HH:MM or HH:MM:SS; compare lexicographically when zero-padded
  const toSeconds = (s: string) => {
    const parts = s.split(":").map((p) => parseInt(p, 10));
    if (parts.some((n) => Number.isNaN(n))) return NaN;
    const count = parts.length;
    if (count < 2 || count > 3) return NaN;
    
    if (count === 2 && (parts[0] < 0 || parts[0] > 23 || parts[1] < 0 || parts[1] > 59)) return NaN;
    if (count === 3 && (parts[0] < 0 || parts[0] > 23 || parts[1] < 0 || parts[1] > 59 || parts[2] < 0 || parts[2] > 59)) return NaN;
    
    let seconds = 0;
    if (parts.length === 3) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      seconds = parts[0] * 3600 + parts[1] * 60;
    } else if (parts.length === 1) {
      seconds = parts[0] * 3600;
    } else {
      return NaN;
    }
    return seconds;
  };

  const sec = toSeconds(inputStr);
  if (Number.isNaN(sec)) return t("Invalid time format");
  if (field.min && typeof field.min === 'string') {
    const minSec = toSeconds(field.min);
    if (!Number.isNaN(minSec) && sec < minSec)
      return t("Time must be on or after {{1}}", field.min);
  }
  if (field.max && typeof field.max === 'string') {
    const maxSec = toSeconds(field.max);
    if (!Number.isNaN(maxSec) && sec > maxSec)
      return t("Time must be on or before {{1}}", field.max);
  }

  return undefined;
}
